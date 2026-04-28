const nlpService = require("../services/nlp.service");
const showtimeService = require("../services/showtime.service");
const seatService = require("../services/seat-recommender.service");
const comboService = require("../services/combo.service");
const timeParser = require("../utils/time-parser");
const pool = require("../config/db");

async function getUserInfo(userId) {
    if (!userId || userId === "anonymous" || userId === "guest") return null;
    try {
        const [rows] = await pool.query(
            "SELECT fullname, email, phone, membership_rank FROM auth_db.users WHERE id = ? OR email = ? LIMIT 1",
            [userId, userId]
        );
        return rows[0] || null;
    } catch (err) {
        console.error("Error getting user info in voice controller:", err);
        return null;
    }
}


// ===================================================================
// Voice Controller — Điều phối quy trình đặt vé bằng giọng nói
// ===================================================================

// Helper: Tạo mã đặt vé ngẫu nhiên cho Voice (Pattern: DPM + 10 ký tự)
function generateVoiceBookingCode() {
    return "DPM" + Math.random().toString(36).substring(2, 12).toUpperCase();
}

exports.handleVoiceRequest = async (req, res) => {
    try {
        const { text, history = [], session_data = {} } = req.body;
        
        if (!text) {
            return res.status(400).json({ reply: "Tôi chưa nghe rõ, bạn có thể nói lại không?" });
        }

        // 1. Phân tích ý định bằng NLP (Gemini)
        const analysis = await nlpService.parseIntent(text, history);
        const { intent, entities } = analysis;

        let response = {
            intent,
            reply: "",
            data: {},
            next_action: null
        };

        // 2. Xử lý theo Intent
        let timeInfo = entities.time_extracted || timeParser.parseVietnameseTime(text);
        
        // Restore or save booking date context
        const hasExplicitDate = entities.time_extracted && !entities.time_extracted.is_default_date;
        if (hasExplicitDate) {
            session_data.booking_date = entities.time_extracted.date;
        } else if (session_data.booking_date) {
            timeInfo.date = session_data.booking_date;
        } else {
            session_data.booking_date = timeInfo.date;
        }
        
        switch (intent) {
            case "CHECK_SCHEDULE":
            case "SEARCH_MOVIE":
            case "BOOK_TICKET":
                // Nếu người dùng nói chung chung "Đặt vé xem phim" hoặc "Hôm nay có phim gì"
                if (!entities.movie_name || entities.movie_name.length < 3) {
                    const allMovies = await showtimeService.findAllMoviesWithShowtimes(timeInfo.date);
                    if (allMovies.length > 0) {
                        response.reply = `Trong ngày ${timeParser.formatDateDisplay(timeInfo.date)}, chúng tôi có các phim: ${allMovies.map(m => m.title).join(", ")}. Bạn muốn xem phim nào?`;
                        response.data.movies = allMovies;
                        response.next_action = "SELECT_MOVIE";
                    } else {
                        const nextDate = await showtimeService.findNextAvailableDate(timeInfo.date);
                        if (nextDate) {
                            response.reply = `Rất tiếc, ngày ${timeParser.formatDateDisplay(timeInfo.date)} chưa có lịch. Tuy nhiên, chúng tôi có suất chiếu vào ${timeParser.formatDateDisplay(nextDate)}. Bạn có muốn xem lịch ngày đó không?`;
                        } else {
                            response.reply = `Rất tiếc, hiện tại hệ thống chưa có lịch chiếu mới. Bạn vui lòng quay lại sau nhé!`;
                        }
                    }
                    break;
                }

                // Tìm phim cụ thể
                const movie = await showtimeService.findMovie(entities.movie_name);
                if (!movie) {
                    const allMovies = await showtimeService.findAllMoviesWithShowtimes(timeInfo.date);
                    response.reply = `Tôi không tìm thấy phim "${entities.movie_name}". Tuy nhiên hôm nay có các phim: ${allMovies.slice(0, 3).map(m => m.title).join(", ")}. Bạn muốn xem phim nào trong số này không?`;
                    response.data.movies = allMovies;
                    response.next_action = "SELECT_MOVIE";
                    break;
                }

                // Nếu đã có phim, tìm suất chiếu
                const showtimes = await showtimeService.findShowtimes(movie.id, timeInfo);

                if (showtimes.length === 0) {
                    const dateDisplay = timeParser.formatDateDisplay(timeInfo.date);
                    response.reply = `Phim ${movie.title} hiện không có suất chiếu vào ${dateDisplay}. Bạn có muốn xem vào ngày khác không?`;
                    response.data.movie = movie;
                } else if (showtimes.length > 1) {
                    response.reply = `Tôi tìm thấy ${showtimes.length} suất chiếu phim ${movie.title} vào ${timeParser.formatDateDisplay(timeInfo.date)}. Bạn muốn xem lúc mấy giờ?`;
                    response.data.movie = movie;
                    response.data.showtimes = showtimes;
                    response.next_action = "SELECT_SHOWTIME";
                } else {
                    // Chỉ có 1 suất chiếu phù hợp -> Tiến hành gợi ý ghế luôn
                    const st = showtimes[0];
                    let seats = [];
                    const userId = `voice_${session_data.user_id || 'anonymous'}`;
                    let seatReply = "";

                    if (entities.seat_codes && entities.seat_codes.length > 0) {
                        const seatMap = await seatService.getSeatMap(st.showtime_id);
                        const allSeats = Object.values(seatMap).flat();
                        const requestedCodes = entities.seat_codes.map(c => c.toUpperCase());
                        const availableSeats = [];
                        const unavailableCodes = [];
                        
                        requestedCodes.forEach(code => {
                            const matchSeat = allSeats.find(s => s.seat_code === code);
                            if (matchSeat && matchSeat.status === 'available') {
                                availableSeats.push(matchSeat);
                            } else {
                                unavailableCodes.push(code);
                            }
                        });
                        
                        if (availableSeats.length === 0) {
                            // Gợi ý ghế khác
                            seats = await seatService.recommendSeats(st.showtime_id, {
                                quantity: entities.quantity || requestedCodes.length || 1,
                                preference: entities.seat_preference || 'center'
                            });
                            seatReply = `Rất tiếc, các ghế ${requestedCodes.join(", ")} đã có người đặt. Tôi gợi ý cho bạn ghế: ${seats.map(s => s.seat_code).join(", ")}. Bạn đồng ý đặt chứ?`;
                        } else {
                            seats = availableSeats;
                            if (unavailableCodes.length > 0) {
                                seatReply = `Ok, tôi đã chọn suất ${st.show_time} tại ${st.cinema_name}. Tôi đã chọn cho bạn ghế: ${seats.map(s => s.seat_code).join(", ")} (ghế ${unavailableCodes.join(", ")} đã có người đặt). Bạn đồng ý đặt chứ?`;
                            } else {
                                seatReply = `Ok, tôi đã chọn suất ${st.show_time} tại ${st.cinema_name}. Tôi đã chọn cho bạn ghế: ${seats.map(s => s.seat_code).join(", ")}. Bạn đồng ý đặt chứ?`;
                            }
                        }
                    } else {
                        seats = await seatService.recommendSeats(st.showtime_id, {
                            quantity: entities.quantity || 1,
                            preference: entities.seat_preference || 'center'
                        });
                        seatReply = `Ok, tôi đã chọn suất ${st.show_time} tại ${st.cinema_name}. Tôi đã chọn cho bạn ghế: ${seats.map(s => s.seat_code).join(", ")}. Bạn đồng ý đặt chứ?`;
                    }

                    // Giữ chỗ
                    await seatService.releaseSeats(st.showtime_id, userId);
                    await seatService.holdSeats(st.showtime_id, seats.map(s => s.seat_id), userId);

                    const seatMap = await seatService.getSeatMap(st.showtime_id);

                    response.reply = seatReply;
                    response.data = {
                        movie,
                        showtime: st,
                        recommended_seats: seats,
                        quantity: entities.quantity || seats.length || 1,
                        seat_map: seatMap,
                        combo_offered: false
                    };
                    response.next_action = "CONFIRM_BOOKING";
                }
                break;

            case "SELECT_MOVIE":
                // 1. Nếu đang ở bước chọn SUẤT CHIẾU mà người dùng nói số thứ tự
                if (session_data.next_action === "SELECT_SHOWTIME" && entities.index) {
                    const showtimes = await showtimeService.findShowtimes(session_data.movie_id, timeInfo);
                    if (showtimes[entities.index - 1]) {
                        const st = showtimes[entities.index - 1];
                        const seats = await seatService.recommendSeats(st.showtime_id, {
                            quantity: session_data.quantity || 1,
                            preference: session_data.preference || 'center'
                        });

                        response.reply = `Tuyệt vời, đã chọn suất chiếu ${st.show_time}. Tôi gợi ý cho bạn ghế ${seats.map(s => s.seat_code).join(", ")}. Bạn đồng ý đặt chứ?`;
                        response.data = { showtime: st, recommended_seats: seats };
                        response.next_action = "CONFIRM_BOOKING";
                        break;
                    }
                }

                // 2. Nếu đang ở bước chọn PHIM
                let selectedMovie = null;
                if (entities.index && session_data.last_movies) {
                    const idx = entities.index - 1;
                    if (session_data.last_movies[idx]) {
                        selectedMovie = await showtimeService.findMovieById(session_data.last_movies[idx].id);
                    }
                } else if (entities.movie_name) {
                    selectedMovie = await showtimeService.findMovie(entities.movie_name);
                }

                if (selectedMovie) {
                    const sts = await showtimeService.findShowtimes(selectedMovie.id, timeInfo);
                    if (sts.length > 0) {
                        response.reply = `Đã chọn phim ${selectedMovie.title}. Phim có các suất chiếu lúc: ${sts.map(s => s.show_time).join(", ")}. Bạn muốn xem lúc mấy giờ (hoặc chọn theo số thứ tự)?`;
                        response.data.movie = selectedMovie;
                        response.data.showtimes = sts;
                        response.next_action = "SELECT_SHOWTIME";
                    } else {
                        response.reply = `Phim ${selectedMovie.title} hiện chưa có suất chiếu phù hợp. Bạn chọn phim khác nhé?`;
                    }
                } else {
                    response.reply = "Tôi vẫn chưa rõ bạn chọn gì. Bạn vui lòng đọc tên hoặc số thứ tự trên màn hình nhé!";
                }
                break;

            case "SELECT_SHOWTIME":
                // Giả định session_data chứa movie_id từ bước trước
                if (session_data.movie_id) {
                    const showtimes = await showtimeService.findShowtimes(session_data.movie_id, timeInfo);
                    
                    let selectedST = null;
                    if (entities.index && showtimes[entities.index - 1]) {
                        selectedST = showtimes[entities.index - 1];
                    } else if (entities.specific_time || /\d+/.test(text)) {
                        // Tìm kiếm thông minh bằng cách so sánh các con số trong giờ
                        const inputTime = entities.specific_time || text;
                        const inputHour = inputTime.match(/\d+/)?.[0];
                        
                        if (inputHour) {
                            selectedST = showtimes.find(s => {
                                const sHour = s.show_time.split(':')[0].replace(/^0/, ''); // "09" -> "9"
                                return sHour === inputHour.replace(/^0/, '');
                            });
                        }
                    }

                    if (selectedST) {
                        const st = selectedST;
                        const seats = await seatService.recommendSeats(st.showtime_id, {
                            quantity: session_data.quantity || 1,
                            preference: session_data.preference || 'center'
                        });

                        // Real-time Hold: Giữ chỗ ghế để người khác thấy
                        const userId = `voice_${session_data.user_id || 'anonymous'}`;
                        await seatService.releaseSeats(st.showtime_id, userId); // Giải phóng ghế cũ nếu có
                        await seatService.holdSeats(st.showtime_id, seats.map(s => s.seat_id), userId);

                        const seatMap = await seatService.getSeatMap(st.showtime_id);

                        response.reply = `Tuyệt vời, đã chọn suất ${st.show_time}. Tôi gợi ý cho bạn ghế ${seats.map(s => s.seat_code).join(", ")}. Bạn đồng ý đặt chứ?`;
                        response.data = { 
                            showtime: st, 
                            recommended_seats: seats,
                            seat_map: seatMap,
                            combo_offered: false
                        };
                        response.next_action = "CONFIRM_BOOKING";
                    } else {
                        response.reply = "Suất chiếu bạn chọn hiện không có hoặc đã hết. Bạn vui lòng chọn lại số thứ tự hoặc giờ khác nhé!";
                    }
                } else {
                    response.reply = "Bạn vui lòng chọn phim trước khi chọn suất chiếu nhé! Nói 'Hôm nay có phim gì' để xem danh sách.";
                    response.next_action = "SELECT_MOVIE";
                }
                break;

            case "SELECT_SEAT":
                if (session_data.showtime_id) {
                    let seats = [];
                    const userId = `voice_${session_data.user_id || 'anonymous'}`;
                    let seatReply = "";

                    if (entities.seat_codes && entities.seat_codes.length > 0) {
                        // Trường hợp người dùng chọn đích danh ghế (A1, A2...)
                        const seatMap = await seatService.getSeatMap(session_data.showtime_id);
                        const allSeats = Object.values(seatMap).flat();
                        const requestedCodes = entities.seat_codes.map(c => c.toUpperCase());
                        const availableSeats = [];
                        const unavailableCodes = [];
                        
                        requestedCodes.forEach(code => {
                            const matchSeat = allSeats.find(s => s.seat_code === code);
                            if (matchSeat && matchSeat.status === 'available') {
                                availableSeats.push(matchSeat);
                            } else {
                                unavailableCodes.push(code);
                            }
                        });
                        
                        if (availableSeats.length === 0) {
                            // Gợi ý ghế khác
                            seats = await seatService.recommendSeats(session_data.showtime_id, {
                                quantity: entities.quantity || requestedCodes.length || 1,
                                preference: entities.seat_preference || 'center'
                            });
                            seatReply = `Rất tiếc, các ghế ${requestedCodes.join(", ")} đã có người đặt. Tôi gợi ý cho bạn ghế: ${seats.map(s => s.seat_code).join(", ")}. Bạn đồng ý đặt chứ?`;
                        } else {
                            seats = availableSeats;
                            if (unavailableCodes.length > 0) {
                                seatReply = `Tôi đã chọn ghế ${seats.map(s => s.seat_code).join(", ")} cho bạn (ghế ${unavailableCodes.join(", ")} đã có người đặt). Bạn đồng ý đặt chứ?`;
                            } else {
                                seatReply = `Đã chọn cho bạn ghế: ${seats.map(s => s.seat_code).join(", ")}. Bạn đồng ý đặt chứ?`;
                            }
                        }
                    } else {
                        // Trường hợp chọn theo sở thích
                        const preference = entities.seat_preference || session_data.preference || 'center';
                        let quantity = entities.quantity || session_data.quantity || 1;
                        if (preference === 'couple' && quantity < 2) quantity = 2;

                        seats = await seatService.recommendSeats(session_data.showtime_id, {
                            quantity: quantity,
                            preference: preference
                        });
                        seatReply = `Đã chọn cho bạn ghế: ${seats.map(s => s.seat_code).join(", ")}. Bạn đồng ý đặt chứ?`;
                    }
                    
                    // Giữ chỗ
                    await seatService.releaseSeats(session_data.showtime_id, userId);
                    await seatService.holdSeats(session_data.showtime_id, seats.map(s => s.seat_id), userId);

                    const seatMap = await seatService.getSeatMap(session_data.showtime_id);
                    response.reply = seatReply;
                    response.data = {
                        showtime: { showtime_id: session_data.showtime_id },
                        recommended_seats: seats,
                        seat_map: seatMap,
                        combo_offered: false 
                    };
                    response.next_action = "CONFIRM_BOOKING";
                } else {
                    response.reply = "Bạn vui lòng chọn phim và suất chiếu trước khi chọn ghế nhé! Nói 'Hôm nay có phim gì' để bắt đầu.";
                    response.next_action = "SELECT_MOVIE";
                }
                break;

            case "SELECT_COMBO":
                if (session_data.showtime_id) {
                    const combos = await comboService.findCombosByShowtime(session_data.showtime_id);
                    const currentCombos = session_data.selected_combos || [];
                    let addedSomething = false;
                    let replyParts = [];

                    // Hỗ trợ đặt nhiều combo từ entities.combos_extracted
                    if (entities.combos_extracted && entities.combos_extracted.length > 0) {
                        for (const item of entities.combos_extracted) {
                            let matchedCombo = null;
                            if (item.name === "combo" && entities.index && combos[entities.index - 1]) {
                                matchedCombo = combos[entities.index - 1];
                            } else {
                                matchedCombo = combos.find(c => 
                                    c.name.toLowerCase().includes(item.name.toLowerCase()) || 
                                    item.name.toLowerCase().includes(c.name.toLowerCase())
                                );
                            }

                            if (matchedCombo) {
                                const existing = currentCombos.find(c => c.id === matchedCombo.id);
                                if (existing) {
                                    existing.qty += item.quantity;
                                } else {
                                    currentCombos.push({
                                        id: matchedCombo.id,
                                        name: matchedCombo.name,
                                        price: Number(matchedCombo.price) || 0,
                                        qty: item.quantity
                                    });
                                }
                                addedSomething = true;
                                replyParts.push(`${item.quantity} ${matchedCombo.name}`);
                            }
                        }
                    } else if (entities.index && combos[entities.index - 1]) {
                        // Chọn bằng chỉ số
                        const selectedCombo = combos[entities.index - 1];
                        const quantity = entities.quantity || 1;
                        const existing = currentCombos.find(c => c.id === selectedCombo.id);
                        if (existing) {
                            existing.qty += quantity;
                        } else {
                            currentCombos.push({
                                id: selectedCombo.id,
                                name: selectedCombo.name,
                                price: Number(selectedCombo.price) || 0,
                                qty: quantity
                            });
                        }
                        addedSomething = true;
                        replyParts.push(`${quantity} ${selectedCombo.name}`);
                    }

                    if (addedSomething) {
                        response.reply = `Đã thêm ${replyParts.join(" và ")} vào đơn hàng của bạn. Bạn có muốn chọn thêm combo nào nữa không, hay muốn xác nhận đặt vé luôn?`;
                        response.data = {
                            selected_combos: currentCombos,
                            combos: combos
                        };
                        response.next_action = "SELECT_COMBO";
                    } else if (/không|thanh toán|đặt luôn|xong|ok|đồng ý/i.test(text)) {
                        response.reply = "Tuyệt vời! Đây là mã QR để bạn thanh toán. Sau khi quét mã thành công, hệ thống sẽ tự động hoàn tất đặt vé cho bạn.";
                        response.next_action = "SHOW_PAYMENT_QR";
                        
                        const seatTotal = (session_data.recommended_seats || []).reduce((sum, s) => sum + (Number(s.price) || 0), 0);
                        const comboTotal = currentCombos.reduce((sum, c) => sum + (c.price * c.qty), 0);

                        response.data = {
                            showtime_id: session_data.showtime_id,
                            showtime: { showtime_id: session_data.showtime_id },
                            recommended_seats: session_data.recommended_seats || [],
                            selected_combos: currentCombos,
                            seat_total: seatTotal,
                            combo_total: comboTotal,
                            final_total: seatTotal + comboTotal,
                            booking_code: generateVoiceBookingCode(),
                            hold_until: new Date(Date.now() + 15 * 60 * 1000).toISOString()
                        };
                    } else {
                        response.reply = `Chúng tôi có các combo bắp nước sau: ${combos.map((c, i) => `${i+1}. ${c.name} (${c.price.toLocaleString()}đ)`).join(", ")}. Bạn muốn lấy combo số mấy hoặc nói tên combo?`;
                        response.data = {
                            combos: combos,
                            selected_combos: currentCombos
                        };
                        response.next_action = "SELECT_COMBO";
                    }
                } else {
                    response.reply = "Bạn vui lòng chọn phim và suất chiếu trước khi chọn combo nhé!";
                }
                break;

            case "CONFIRM":
                // Luồng linh hoạt: Nếu đã chọn ghế nhưng chưa hỏi combo bắp nước
                const hasSeatsToConfirm = session_data.recommended_seats && session_data.recommended_seats.length > 0;
                const hasNoCombosYet = !session_data.selected_combos || session_data.selected_combos.length === 0;
                
                if (hasSeatsToConfirm && hasNoCombosYet && !session_data.combo_offered) {
                    const combos = await comboService.findCombosByShowtime(session_data.showtime_id);
                    response.reply = `Tuyệt vời! Trước khi thanh toán, bạn có muốn dùng thêm bắp nước không? Tôi có các combo như: ${combos.slice(0, 2).map(c => c.name).join(", ")}. Bạn có thể nói "Chọn combo số 1" hoặc "Không, thanh toán luôn".`;
                    response.data = {
                        combos: combos,
                        showtime: { showtime_id: session_data.showtime_id },
                        recommended_seats: session_data.recommended_seats,
                        combo_offered: true
                    };
                    response.next_action = "SELECT_COMBO";
                } else if (session_data.next_action === "SELECT_COMBO" && hasNoCombosYet) {
                    // Người dùng đồng ý mua combo (nói "Có" khi được hỏi "Bạn có muốn dùng thêm bắp nước không?")
                    const combos = await comboService.findCombosByShowtime(session_data.showtime_id);
                    response.reply = `Chúng tôi có các combo bắp nước sau: ${combos.map((c, i) => `${i+1}. ${c.name} (${c.price.toLocaleString()}đ)`).join(", ")}. Bạn muốn lấy combo số mấy hoặc nói tên combo?`;
                    response.data = {
                        combos: combos,
                        showtime: { showtime_id: session_data.showtime_id },
                        recommended_seats: session_data.recommended_seats,
                        combo_offered: true
                    };
                    response.next_action = "SELECT_COMBO";
                } else {
                    // Nếu xác nhận ở các bước khác (ví dụ sau khi đã chọn combo)
                    response.reply = "Tuyệt vời! Đây là mã QR để bạn thanh toán. Sau khi quét mã thành công, hệ thống sẽ tự động hoàn tất đặt vé cho bạn.";
                    response.next_action = "SHOW_PAYMENT_QR";
                    
                    const seatTotal = (session_data.recommended_seats || []).reduce((sum, s) => sum + (Number(s.price) || 0), 0);
                    const comboTotal = (session_data.selected_combos || []).reduce((sum, c) => sum + (c.price * c.qty), 0);

                    response.data = {
                        showtime_id: session_data.showtime_id,
                        showtime: { showtime_id: session_data.showtime_id },
                        recommended_seats: session_data.recommended_seats || [],
                        selected_combos: session_data.selected_combos || [],
                        seat_total: seatTotal,
                        combo_total: comboTotal,
                        final_total: seatTotal + comboTotal,
                        booking_code: generateVoiceBookingCode(),
                        hold_until: new Date(Date.now() + 15 * 60 * 1000).toISOString()
                    };
                }
                break;

            case "CANCEL":
                if (session_data.next_action === "SELECT_COMBO") {
                    response.reply = "Ok, tôi đã bỏ qua phần combo. Đây là mã QR để bạn thanh toán vé nhé.";
                    response.next_action = "SHOW_PAYMENT_QR";
                    
                    const seatTotal = (session_data.recommended_seats || []).reduce((sum, s) => sum + (Number(s.price) || 0), 0);
                    const comboTotal = (session_data.selected_combos || []).reduce((sum, c) => sum + (c.price * c.qty), 0);

                    response.data = {
                        showtime_id: session_data.showtime_id,
                        showtime: { showtime_id: session_data.showtime_id },
                        recommended_seats: session_data.recommended_seats || [],
                        selected_combos: session_data.selected_combos || [],
                        seat_total: seatTotal,
                        combo_total: comboTotal,
                        final_total: seatTotal + comboTotal,
                        booking_code: generateVoiceBookingCode(),
                        hold_until: new Date(Date.now() + 15 * 60 * 1000).toISOString()
                    };
                } else {
                    response.reply = "Đã hủy yêu cầu. Tôi có thể giúp gì khác cho bạn không?";
                }
                break;

            default:
                response.reply = "Tôi là trợ lý ảo D-Prime Cinema. Bạn có thể nói 'Đặt 2 vé Avengers tối nay' hoặc 'Tìm phim hành động' để tôi hỗ trợ nhé!";
        }

        // Luôn đính kèm booking_date vào response.data để client lưu giữ
        if (!response.data) response.data = {};
        response.data.booking_date = session_data.booking_date;

        const user = await getUserInfo(session_data.user_id);
        const name = user ? user.fullname : "Khách hàng";
        const phone = user ? user.phone : "";
        const rank = user ? user.membership_rank : "Đồng";
        
        response.data.user_info = {
            fullname: name,
            phone: phone,
            rank: rank
        };
        
        response.data.payment_methods = [
            { id: "momo", name: "MOMO", desc: "Ví điện tử", active: true },
            { id: "zalopay", name: "ZaloPay", desc: "Ví điện tử", active: false },
            { id: "bank_transfer", name: "Thẻ ngân hàng", desc: "Visa, Mastercard, JCB", active: false },
            { id: "vnpay", name: "VNPay", desc: "Ví điện tử", active: false }
        ];

        // Luôn trả về kết quả từ Controller nếu có câu trả lời
        res.json(response.reply ? response : { 
            reply: "Tôi chưa hiểu rõ ý bạn. Bạn có thể nói cụ thể hơn tên phim và thời gian không?",
            intent: "OTHER",
            data: { 
                booking_date: session_data.booking_date,
                user_info: response.data.user_info,
                payment_methods: response.data.payment_methods
            }
        });

    } catch (error) {
        console.error("VOICE CONTROLLER ERROR:", error);
        res.status(500).json({ reply: "Có lỗi xảy ra trong quá trình xử lý. Vui lòng thử lại sau." });
    }
};
