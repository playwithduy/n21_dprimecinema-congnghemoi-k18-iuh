const seatMap = document.getElementById("seat-map");
const selectedSeatsText = document.getElementById("selected-seats");
const countdownEl = document.getElementById("countdown");

/* 🎬 HEADER */
const movieNameEl = document.getElementById("movie-name");
const cinemaInfoEl = document.getElementById("cinema-info");

/* 🎬 FOOTER */
const moviePosterEl = document.getElementById("movie-poster");
const movieNameFooterEl = document.getElementById("movie-name-footer");
const cinemaInfoFooterEl = document.getElementById("cinema-info-footer");
const countdownFooterEl = document.getElementById("countdown-footer");
const totalPriceEl = document.getElementById("total-price");

let seatPrices = {};

// SỬ DỤNG CONFIG TỪ window.APP_CONFIG ĐỂ ĐẢM BẢO CHẠY ĐÚNG TRÊN MỌI MÔI TRƯỜNG
const socketUrl = window.APP_CONFIG.WS_URL;
let socket = null;
let reconnectTimer = null;

// =========================================================
// FIX CORE: Dùng 1 flag duy nhất để kiểm soát việc có
// gửi LEAVE hay không. Mặc định = false (sẽ leave).
// Chỉ set = true khi navigate nội bộ có chủ đích.
// =========================================================
let suppressLeave = false;

// USER_ID cố định toàn session
let USER_ID = localStorage.getItem("USER_ID");
if (!USER_ID) {
    USER_ID = "user_" + Math.random().toString(36).substring(2, 10);
    localStorage.setItem("USER_ID", USER_ID);
}

// TAB_ID giữ nguyên trong cùng 1 tab
let TAB_ID = sessionStorage.getItem("TAB_ID");
if (!TAB_ID) {
    TAB_ID = "tab_" + Math.random().toString(36).substring(2, 10);
    sessionStorage.setItem("TAB_ID", TAB_ID);
}

const SESSION_ID = "sess_" + Math.random().toString(36).substring(2, 12);

let selected = [];
let seatState = {};
let currentType = null;
let isInitLoading = false;

let countdownInterval = null;
let timeLeft = 15 * 60;
let roomCentralMetadata = null;

/* ================= LOAD SHOWTIME ================= */

async function loadShowtimeInfo() {
    if (!SHOWTIME_ID) {
        if (movieNameEl) movieNameEl.innerText = "Không có suất chiếu";
        return;
    }
    try {
        const res = await fetch(`${window.APP_CONFIG.API_BASE}/booking/showtimes/${SHOWTIME_ID}`);
        const data = await res.json();
        const movieName = data.movie_name || data.name || "";
        const info = `${data.cinema_name || ""} • ${data.room_name || ""} • ${data.show_time || ""}`;
        
        if (movieNameEl) movieNameEl.innerText = movieName;
        if (cinemaInfoEl) cinemaInfoEl.innerText = info;
        if (movieNameFooterEl) movieNameFooterEl.innerText = movieName;
        if (cinemaInfoFooterEl) cinemaInfoFooterEl.innerText = info;
        
        roomCentralMetadata = data.central_metadata;
        if (typeof roomCentralMetadata === 'string') {
            try { 
                roomCentralMetadata = JSON.parse(roomCentralMetadata); 
            } catch(e) {
                console.log("Parse central metadata failed:", e);
            }
        }

        // Force re-render to highlight central zone if seats are already loaded
        if (Object.keys(seatState).length > 0) {
            renderSeats();
        }

        // APPLY CUSTOM STYLES (If any)
        if (data.seat_styles) {
            const root = document.documentElement;
            const s = data.seat_styles;
            const uploadBase = window.APP_CONFIG.API_BASE.replace('/api', '');

            if (s.colors) {
                if (s.colors.normal) root.style.setProperty('--seat-normal', s.colors.normal);
                if (s.colors.vip) root.style.setProperty('--seat-vip', s.colors.vip);
                if (s.colors.sweetbox) root.style.setProperty('--seat-sweetbox', s.colors.sweetbox);
                if (s.colors.sold) root.style.setProperty('--seat-sold', s.colors.sold);
            }
            if (s.images) {
                const getUrl = (path) => {
                    if (!path) return 'none';
                    if (path.startsWith('http')) return `url('${path}')`;
                    // Ensure path doesn't have leading slash if uploadBase has trailing or vice-versa
                    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
                    return `url('${uploadBase}/${cleanPath}')`;
                };
                if (s.images.normal) root.style.setProperty('--img-normal', getUrl(s.images.normal));
                if (s.images.vip) root.style.setProperty('--img-vip', getUrl(s.images.vip));
                if (s.images.sweetbox) root.style.setProperty('--img-sweetbox', getUrl(s.images.sweetbox));
                if (s.images.sold) root.style.setProperty('--img-sold', getUrl(s.images.sold));
            }
        }

        if (moviePosterEl && data.poster) {
            const root = window.APP_CONFIG.API_BASE.replace('/api', '');
            moviePosterEl.src = data.poster.startsWith('http') ? data.poster : `${root}/${data.poster}`;
            moviePosterEl.onerror = () => {
                moviePosterEl.src = "https://placehold.co/300x450/0b0f19/e50914?text=No+Poster";
            };
        }

        // FALLBACK: Nếu vẫn rỗng, thử lấy từ localStorage (đã lưu khi click Mua vé)
        if (!movieNameEl.innerText || movieNameEl.innerText === ".." || movieNameEl.innerText === "Đang tải phim...") {
            const pending = JSON.parse(localStorage.getItem('pending_booking') || "{}");
            const localMovieName = pending.movie_name || localStorage.getItem('selected_movie_title');
            if (localMovieName) {
                movieNameEl.innerText = localMovieName;
                if (movieNameFooterEl) movieNameFooterEl.innerText = localMovieName;
            }
        }
    } catch (err) {
        console.log("loadShowtimeInfo error:", err);
        // Catch-all fallback
        const localMovieName = localStorage.getItem('selected_movie_title');
        if (localMovieName && movieNameEl) movieNameEl.innerText = localMovieName;
    }
}

/* ================= LOAD PRICE ================= */

async function loadSeatPrices() {
    if (!SHOWTIME_ID) return;
    try {
        const res = await fetch(`${window.APP_CONFIG.API_BASE}/booking/showtimes/${SHOWTIME_ID}/prices`);
        const data = await res.json();
        seatPrices = {};
        data.forEach(item => { seatPrices[item.seat_type] = Number(item.price) || 0; });
        updateText();
    } catch (err) {
        console.log("loadSeatPrices error:", err);
    }
}

/* ================= LEAVE ================= */

function leaveShowtime() {
    // Nếu đang navigate nội bộ → KHÔNG gửi LEAVE
    if (suppressLeave) return;

    if (reconnectTimer) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
    }

    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({
            type: "LEAVE_SHOWTIME",
            showtime_id: SHOWTIME_ID,
            user_id: USER_ID,
            session_id: SESSION_ID,
            tab_id: TAB_ID
        }));
    }
}

// Helper: navigate nội bộ an toàn — set flag rồi mới redirect
function navigateInternal(url) {
    suppressLeave = true;
    // Backup vào sessionStorage phòng khi browser fire beforeunload async
    sessionStorage.setItem("INTERNAL_NAVIGATION", "true");
    window.location.href = url;
}

window.addEventListener("beforeunload", leaveShowtime);
window.addEventListener("pagehide", leaveShowtime);

/* ================= SOCKET ================= */

function connectSocket() {
    if (!SHOWTIME_ID) return;

    socket = new WebSocket(socketUrl);

    if (seatMap) {
        seatMap.style.pointerEvents = "none";
        seatMap.classList.add("loading");
    }

    socket.onopen = () => {
        console.log("✅ socket open", { SHOWTIME_ID, USER_ID, SESSION_ID, TAB_ID });
        if (seatMap) {
            seatMap.style.pointerEvents = "auto";
            seatMap.classList.remove("loading");
        }
        socket.send(JSON.stringify({
            type: "JOIN_SHOWTIME",
            showtime_id: SHOWTIME_ID,
            user_id: USER_ID,
            session_id: SESSION_ID,
            tab_id: TAB_ID
        }));
    };

    socket.onmessage = (msg) => {
        const data = JSON.parse(msg.data);
        console.log("📩 SOCKET EVENT:", data);

        if (data.type === "INIT") {
            isInitLoading = true;
            buildSeatState(data.seats || []);
            rebuildSelectedFromInit();
            renderSeats();
            updateText();
            syncCountdownFromState();
            setTimeout(() => { isInitLoading = false; }, 300);
            return;
        }

        if (data.type === "SEAT_HELD") {
            updateSeatState(data.seat, "holding", String(data.holder), data.hold_until || null);
            return;
        }

        if (data.type === "SEAT_RELEASED") {
            updateSeatState(data.seat, "available", null, null);
            return;
        }

        if (data.type === "SEAT_BOOKED") {
            updateSeatState(data.seat, "booked", null, null);
            return;
        }

        if (data.type === "HOLD_FAILED") {
            if (seatState[data.seat]) {
                seatState[data.seat].status = "available";
                seatState[data.seat].held_by = null;
                seatState[data.seat].hold_until = null;
            }
            removeFromSelected(data.seat);
            updateSeatElement(data.seat);
            syncCountdownFromState();
            updateText();
            alert(data.message || "Ghế đang được người khác giữ");
            return;
        }

        if (data.type === "BOOKING_SUCCESS") {
            console.log("✅ BOOKING_SUCCESS");
            localStorage.removeItem("booking_data");
            return;
        }

        if (data.type === "BOOKING_FAILED") {
            alert(data.message || "Đặt ghế thất bại");
            return;
        }

        if (data.type === "SERVER_ERROR") {
            console.log("SERVER_ERROR:", data.message);
            return;
        }
    };

    socket.onclose = () => {
        console.log("🔴 Socket disconnected");
        if (seatMap) {
            seatMap.style.pointerEvents = "none";
            seatMap.classList.add("loading");
        }
        // Chỉ reconnect nếu KHÔNG phải navigate nội bộ và KHÔNG phải thoát hẳn
        if (!suppressLeave) {
            if (reconnectTimer) clearTimeout(reconnectTimer);
            reconnectTimer = setTimeout(() => { connectSocket(); }, 1500);
        }
    };

    socket.onerror = (err) => { console.log("Socket error:", err); };
}

connectSocket();
loadShowtimeInfo();
loadSeatPrices();

/* ================= STATE ================= */

function buildSeatState(seats) {
    seatState = {};
    seats.forEach(seat => {
        seatState[seat.seat_code] = {
            seat_type: seat.seat_type || "normal",
            status: seat.status || "available",
            held_by: seat.held_by != null ? String(seat.held_by) : null,
            hold_until: seat.hold_until || null
        };
    });
}

function isMySeatHolder(holder) {
    if (holder == null) return false;
    return String(holder) === String(USER_ID);
}

function rebuildSelectedFromInit() {
    selected = [];
    currentType = null;
    Object.keys(seatState).forEach(code => {
        const seat = seatState[code];
        if (seat.status === "holding" && isMySeatHolder(seat.held_by)) {
            selected.push(code);
            if (!currentType) currentType = seat.seat_type;
        }
    });
    console.log("🔄 rebuildSelectedFromInit →", selected);
}

function updateSeatState(code, status, holder, holdUntil = null) {
    if (!seatState[code]) return;
    if (isInitLoading) return;

    const prev = { ...seatState[code] };

    seatState[code].status = status;
    seatState[code].held_by = holder ? String(holder) : null;
    seatState[code].hold_until = holdUntil || null;

    const isMine = status === "holding" && isMySeatHolder(holder);

    if (isMine) addToSelected(code);

    if (
        status === "available" ||
        status === "booked" ||
        (prev.status === "holding" && isMySeatHolder(prev.held_by) && !isMySeatHolder(holder))
    ) {
        removeFromSelected(code);
    }

    updateSeatElement(code);
    syncCountdownFromState();
    updateText();
}

function updateSeatElement(code) {
    const el = document.querySelector(`[data-code='${code}']`);
    const seat = seatState[code];
    if (!el || !seat) return;

    el.classList.remove("mine", "other", "booked", "pending");

    if (seat.status === "booked") { el.classList.add("booked"); return; }
    if (seat.status === "pending") { el.classList.add("pending"); return; }
    if (seat.status === "holding") {
        el.classList.add(isMySeatHolder(seat.held_by) ? "mine" : "other");
    }
}

function renderSeats() {
    if (!seatMap) return;
    seatMap.innerHTML = '<div id="central-zone-overlay"></div>';
    const rows = {};

    Object.keys(seatState).forEach(code => {
        const row = code[0];
        if (!rows[row]) rows[row] = [];
        rows[row].push(code);
    });

    Object.keys(rows).sort().forEach(row => {
        const rowDiv = document.createElement("div");
        rowDiv.className = "seat-row";

        rows[row]
            .sort((a, b) => parseInt(a.slice(1), 10) - parseInt(b.slice(1), 10))
            .forEach(code => {
                const seat = seatState[code];
                const el = document.createElement("div");
                el.className = `seat ${seat.seat_type}`;
                el.dataset.code = code;
                el.innerText = code;

                if (seat.status === "booked" || seat.seat_type === "broken") {
                    el.classList.add("booked");
                } else if (seat.status === "holding") {
                    el.classList.add(isMySeatHolder(seat.held_by) ? "mine" : "other");
                }
                
                if (isCentralSeat(code)) {
                    el.classList.add("is-central");
                }

                el.onclick = () => selectSeat(code);
                el.onmouseenter = () => {
                    if (seat.seat_type === "sweetbox") {
                        const pair = getPairSeat(code);
                        document.querySelector(`[data-code='${pair}']`)?.classList.add("hover-pair");
                    }
                };
                el.onmouseleave = () => {
                    document.querySelectorAll(".hover-pair").forEach(e => e.classList.remove("hover-pair"));
                };
                rowDiv.appendChild(el);
            });

        seatMap.appendChild(rowDiv);
    });

    // Gọi lại highlight sau khi DOM đã ổn định
    setTimeout(highlightCentralZone, 100);
    setTimeout(highlightCentralZone, 500); // Thử lại lần nữa cho chắc
}

function highlightCentralZone() {
    const overlay = document.getElementById('central-zone-overlay');
    const centralSeats = document.querySelectorAll('.seat.is-central');
    
    if (centralSeats.length > 0 && overlay) {
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        centralSeats.forEach(el => {
            const rect = {
                left: el.offsetLeft,
                top: el.offsetTop,
                right: el.offsetLeft + el.offsetWidth,
                bottom: el.offsetTop + el.offsetHeight
            };
            minX = Math.min(minX, rect.left);
            minY = Math.min(minY, rect.top);
            maxX = Math.max(maxX, rect.right);
            maxY = Math.max(maxY, rect.bottom);
        });

        const padding = 8;
        overlay.style.display = 'block';
        overlay.style.left = (minX - padding) + 'px';
        overlay.style.top = (minY - padding) + 'px';
        overlay.style.width = (maxX - minX + padding * 2) + 'px';
        overlay.style.height = (maxY - minY + padding * 2) + 'px';
    } else if (overlay) {
        overlay.style.display = 'none';
    }
}

function selectSeat(code) {
    if (Object.keys(seatPrices).length === 0) { alert("Đang tải giá ghế..."); return; }
    const seat = seatState[code];
    if (!seat) return;
    if (seat.status === "booked" || seat.seat_type === "broken") return;
    if (seat.status === "holding" && !isMySeatHolder(seat.held_by)) return;
    if (currentType && seat.seat_type !== currentType) { alert("Không thể chọn ghế khác loại"); return; }

    if (seat.seat_type === "sweetbox") {
        const pair = getPairSeat(code);
        const pairSeat = seatState[pair];
        if (!pairSeat) { alert("Ghế đôi lỗi"); return; }
        if (pairSeat.status === "booked") return;
        if (pairSeat.status === "holding" && !isMySeatHolder(pairSeat.held_by)) return;
        if (currentType && pairSeat.seat_type !== currentType) { alert("Không thể chọn ghế khác loại"); return; }

        const bothMine =
            seat.status === "holding" && isMySeatHolder(seat.held_by) &&
            pairSeat.status === "holding" && isMySeatHolder(pairSeat.held_by);

        if (bothMine) { toggleSeat(code); toggleSeat(pair); return; }
        if (!currentType) currentType = "sweetbox";
        if (seat.status === "available") toggleSeat(code);
        if (pairSeat.status === "available") toggleSeat(pair);
        return;
    }

    toggleSeat(code);
}

function toggleSeat(code) {
    const seat = seatState[code];
    if (!seat) return;
    if (!socket || socket.readyState !== WebSocket.OPEN) { alert("Mất kết nối tới server ghế"); return; }
    if (seat.status === "pending") return;

    if (seat.status === "holding" && isMySeatHolder(seat.held_by)) {
        seatState[code].status = "pending";
        updateSeatElement(code);
        setTimeout(() => {
            if (seatState[code]?.status === "pending") {
                seatState[code].status = "holding";
                updateSeatElement(code);
            }
        }, 5000);
        socket.send(JSON.stringify({
            type: "RELEASE_SEAT",
            showtime_id: SHOWTIME_ID,
            seat: code,
            user_id: USER_ID,
            session_id: SESSION_ID,
            tab_id: TAB_ID
        }));
        return;
    }

    if (seat.status === "available") {
        if (currentType && seat.seat_type !== currentType) { alert("Không thể chọn ghế khác loại"); return; }
        if (!currentType) currentType = seat.seat_type;
        seatState[code].status = "pending";
        seatState[code].held_by = String(USER_ID);
        updateSeatElement(code);
        setTimeout(() => {
            if (seatState[code]?.status === "pending") {
                seatState[code].status = "available";
                seatState[code].held_by = null;
                updateSeatElement(code);
            }
        }, 5000);
        socket.send(JSON.stringify({
            type: "HOLD_SEAT",
            showtime_id: SHOWTIME_ID,
            seat: code,
            user_id: USER_ID,
            session_id: SESSION_ID,
            tab_id: TAB_ID
        }));
    }
}

/* ================= COUNTDOWN ================= */

function getEarliestMyHoldUntil() {
    let minTs = null;
    Object.keys(seatState).forEach(code => {
        const seat = seatState[code];
        if (seat.status === "holding" && isMySeatHolder(seat.held_by) && seat.hold_until) {
            const ts = new Date(seat.hold_until).getTime();
            if (!Number.isNaN(ts) && (minTs === null || ts < minTs)) minTs = ts;
        }
    });
    return minTs;
}

function syncCountdownFromState() {
    if (selected.length === 0) { resetCountdown(); return; }
    const earliest = getEarliestMyHoldUntil();
    if (!earliest) { resetCountdown(); return; }
    const now = Date.now();
    timeLeft = Math.max(0, Math.floor((earliest - now) / 1000));
    if (timeLeft <= 0) {
        releaseAllMySeats();
        return;
    }
    renderCountdownText();
    if (!countdownInterval) startCountdown();
}

function releaseAllMySeats() {
    const seatsToRelease = [...selected];
    seatsToRelease.forEach(code => {
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({
                type: "RELEASE_SEAT",
                showtime_id: SHOWTIME_ID,
                seat: code,
                user_id: USER_ID,
                session_id: SESSION_ID,
                tab_id: TAB_ID
            }));
        }
    });
    selected = [];
    currentType = null;
    resetCountdown();
    updateText();
}

function renderCountdownText() {
    const min = Math.floor(timeLeft / 60);
    const sec = timeLeft % 60;
    const text = `${min}:${sec.toString().padStart(2, "0")}`;
    if (countdownEl) countdownEl.innerText = "Giữ ghế: " + text;
    if (countdownFooterEl) countdownFooterEl.innerText = text;
}

function startCountdown() {
    if (countdownInterval) return;
    renderCountdownText();
    countdownInterval = setInterval(() => {
        const earliest = getEarliestMyHoldUntil();
        if (!earliest || selected.length === 0) { resetCountdown(); return; }
        timeLeft = Math.max(0, Math.floor((earliest - Date.now()) / 1000));
        renderCountdownText();
        if (timeLeft <= 0) releaseAllMySeats();
    }, 1000);
}

function resetCountdown() {
    clearInterval(countdownInterval);
    countdownInterval = null;
    timeLeft = 15 * 60;
    if (countdownEl) countdownEl.innerText = "";
    if (countdownFooterEl) countdownFooterEl.innerText = "";
}

function addToSelected(code) {
    if (!selected.includes(code)) selected.push(code);
    if (!currentType && seatState[code]) currentType = seatState[code].seat_type;
    updateText();
}

function removeFromSelected(code) {
    selected = selected.filter(s => s !== code);
    if (selected.length === 0) { currentType = null; resetCountdown(); }
    updateText();
}

function isCentralSeat(code) {
    if (!roomCentralMetadata) return false;
    const { row_start, row_end, num_start, num_end } = roomCentralMetadata;
    const row = code[0];
    const num = parseInt(code.slice(1));
    return row >= row_start && row <= row_end && num >= num_start && num <= num_end;
}

/* ================= GHẾ ĐÔI ================= */

function getPairSeat(code) {
    const row = code[0];
    const num = parseInt(code.slice(1), 10);
    return row + (num % 2 === 0 ? num - 1 : num + 1);
}

/* ================= UI ================= */

function updateText() {
    if (selectedSeatsText) {
        selectedSeatsText.innerText = selected.length ? selected.join(", ") : "---";
    }
    let total = 0;
    selected.forEach(code => {
        const type = seatState[code]?.seat_type;
        let price = seatPrices[type] || 0;
        if (isCentralSeat(code)) {
            price = Math.round(price * 1.2 / 1000) * 1000; // Làm tròn đến nghìn
        }
        total += price;
    });
    if (totalPriceEl) totalPriceEl.innerText = total.toLocaleString() + "đ";
}

/* ================= BOOK ================= */

const nextBtn = document.querySelector(".next");

if (nextBtn) {
    nextBtn.addEventListener("click", () => {
        if (selected.length === 0) { alert("Vui lòng chọn ghế!"); return; }

        let seatTotal = 0;
        selected.forEach(code => {
            const type = seatState[code]?.seat_type;
            let price = seatPrices[type] || 0;
            if (isCentralSeat(code)) {
                price = Math.round(price * 1.2 / 1000) * 1000;
            }
            seatTotal += price;
        });

        const earliest = getEarliestMyHoldUntil();
        if (!earliest || earliest <= Date.now()) { alert("⏰ Ghế đã hết thời gian giữ!"); return; }

        const bookingData = {
            showtime_id: SHOWTIME_ID,
            user_id: USER_ID,
            session_id: SESSION_ID,
            tab_id: TAB_ID,
            seats: [...selected],
            seat_total: seatTotal,
            hold_until: earliest,
            combos: [],
            combo_total: 0,
            final_total: seatTotal
        };

        localStorage.setItem("booking_data", JSON.stringify(bookingData));
        console.log("➡️ SEAT DATA:", bookingData);

        // Dùng navigateInternal để chắc chắn không gửi LEAVE
        navigateInternal("index.php?p=Ym9va2luZy1jb21ibw==&showtime_id=" + SHOWTIME_ID);
    });
}
