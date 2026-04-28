/* ===================================================================
   VOICE ASSISTANT CORE JS (BLACK & GOLD PREMIUM) - D-PRIME CINEMA
   =================================================================== */

document.addEventListener("DOMContentLoaded", () => {
    // 1. Inject HTML for wide dashboard layout
    const html = `
    <div class="voice-trigger-btn" id="voiceTrigger" title="Trợ lý giọng nói">
        <img src="https://cdn-icons-png.flaticon.com/512/709/709682.png" alt="Voice" class="voice-trigger-icon">
    </div>

    <div id="voice-assistant-overlay">
        <div class="voice-card" id="voiceCard">
            <button class="voice-close" id="voiceClose">&times;</button>
            
            <!-- Progress Steps (5 Steps) -->
            <div class="voice-progress-container" id="voiceProgressSteps"></div>

            <!-- Two-Column Premium Dashboard Layout -->
            <div class="voice-dashboard-grid">
                <!-- Left Panel: Robot Mascot Character & AI Speech Bubble -->
                <div class="voice-left-panel">
                    <div class="voice-mascot-container">
                        <img id="voiceMascot" src="assets/images/dprime_mascot_standard.png" class="voice-mascot-img" alt="Mascot">
                    </div>
                    <div class="voice-dialog-bubble">
                        <div class="voice-status" id="voiceStatus">Đang chờ...</div>
                        <div class="voice-dialog-bubble-text" id="voiceReply">Tôi là trợ lý ảo D-Prime Cinema. Bạn có thể nói 'Đặt vé Avengers' hoặc 'Hôm nay có phim gì' nhé!</div>
                    </div>
                    <!-- Moved Mic Button and Visualizer here -->
                    <div class="voice-mic-glow-circle" id="voiceMicBtn" style="margin-top: 20px;">
                        <i class="fa-solid fa-microphone"></i>
                    </div>
                    <div class="voice-wave-visualizer" id="voiceWaveVisualizer" style="margin-top: 10px; margin-bottom: 0;">
                        <span></span><span></span><span></span><span></span><span></span><span></span><span></span>
                    </div>
                </div>

                <!-- Right Panel: Interactive Panel depending on the Step -->
                <div class="voice-right-panel" id="voiceRightPanel">
                    <!-- Loaded dynamically via renderActiveStep -->
                </div>
            </div>

            <!-- Suggestions Tags -->
            <div class="voice-suggestions-wrapper">
                <div class="voice-suggestions-title">Gợi ý lệnh giọng nói:</div>
                <div class="voice-suggestions-list" id="voiceSuggestions"></div>
            </div>
        </div>
    </div>
    `;
    document.body.insertAdjacentHTML('beforeend', html);

    const trigger = document.getElementById("voiceTrigger");
    const overlay = document.getElementById("voice-assistant-overlay");
    const closeBtn = document.getElementById("voiceClose");
    const status = document.getElementById("voiceStatus");
    const reply = document.getElementById("voiceReply");
    const rightPanel = document.getElementById("voiceRightPanel");
    const card = document.getElementById("voiceCard");
    const mascot = document.getElementById("voiceMascot");

    // 2. Speech Configuration
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = SpeechRecognition ? new SpeechRecognition() : null;
    
    let isListening = false;
    let isSpeechEngineActive = false;
    let silenceTimer = null;
    let shouldAutoRestart = false; // Controls auto-reconnect loop
    let networkRetryCount = 0;
    const MAX_NETWORK_RETRIES = 3;
    const SILENCE_TIMEOUT_MS = 2000; // 2 seconds silence timeout
    let lastTranscript = ''; // Accumulates text across short sessions

    if (recognition) {
        recognition.lang = 'vi-VN';
        recognition.interimResults = true;
        recognition.continuous = false; // Short stable sessions, auto-reconnect instead
        recognition.maxAlternatives = 1;
    }

    let sessionData = {
        next_action: "SELECT_MOVIE"
    };
    let conversationHistory = [];
    let seatRefreshInterval = null;
    let currentAIResponse = null; // Store last full response

    // 3. TTS Speak Function
    window.speechSynthesis.getVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = window.speechSynthesis.getVoices;
    }

    function speak(text, callback) {
        if (!window.speechSynthesis) return;
        
        window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        const voices = window.speechSynthesis.getVoices();
        const viVoice = voices.find(v => v.lang.toLowerCase().includes('vi-vn')) || 
                        voices.find(v => v.lang.toLowerCase().includes('vi'));
        
        if (viVoice) {
            utterance.voice = viVoice;
        }
        
        utterance.lang = 'vi-VN';
        utterance.rate = 1.05;

        if (callback) {
            utterance.onend = callback;
        }

        window.speechSynthesis.speak(utterance);
    }

    /**
     * Real-time seat map polling inside right panel
     */
    async function refreshSeatMap(showtimeId, recommendedSeats = []) {
        try {
            const res = await fetch(`${window.APP_CONFIG.API_BASE}/voice/seat-map/${showtimeId}`);
            if (!res.ok) return;
            const seatMap = await res.json();
            
            renderSeatGrid(seatMap, recommendedSeats);
        } catch (err) {
            console.error("Refresh seat map error:", err);
        }
    }

    function renderSeatGrid(seatMap, recommendedSeats = []) {
        const gridArea = document.getElementById("voiceSeatGridInline");
        if (!gridArea) return;

        let html = '';
        const recommendedCodes = recommendedSeats.map(s => s.seat_code || s);

        Object.keys(seatMap).forEach(row => {
            html += `<div style="display: flex; gap: 6px; align-items: center; justify-content: center;">`;
            html += `<span style="font-size: 10px; color: #888; width: 14px; font-weight: bold; text-align: center;">${row}</span>`;
            seatMap[row].forEach(seat => {
                let bgColor = "rgba(255, 255, 255, 0.05)"; 
                let border = "1px solid rgba(255,255,255,0.1)";
                let color = "#666";
                let animation = "none";
                
                if (seat.status !== 'available') {
                    bgColor = "rgba(255, 255, 255, 0.01)";
                    border = "1px solid rgba(255, 255, 255, 0.02)";
                    color = "transparent";
                } else if (recommendedCodes.includes(seat.seat_code)) {
                    bgColor = "#f39c12";
                    border = "1px solid #f39c12";
                    color = "#000";
                    animation = "pulse-seat-gold 1.5s infinite";
                } else if (seat.seat_type === 'vip') {
                    border = "1px solid #d35400";
                    color = "#d35400";
                } else if (seat.seat_type === 'sweetbox') {
                    border = "1px solid #f368e0";
                    color = "#f368e0";
                }

                html += `
                    <div title="${seat.seat_code}" style="
                        width: 20px; height: 20px; 
                        background: ${bgColor}; 
                        border: ${border}; 
                        border-radius: 4px; 
                        animation: ${animation};
                        display: flex; align-items: center; justify-content: center;
                        font-size: 8px; font-weight: 800; color: ${color};
                    ">
                        ${seat.seat_number}
                    </div>`;
            });
            html += `</div>`;
        });
        gridArea.innerHTML = html;
    }

    function syncParentStateToSession() {
        const userId = localStorage.getItem("USER_ID") || "anonymous";
        sessionData.user_id = userId;

        if (typeof window.SHOWTIME_ID !== 'undefined' && window.SHOWTIME_ID) {
            sessionData.showtime_id = window.SHOWTIME_ID;
        } else if (typeof window.SHOWTIME_ID_GLOBAL !== 'undefined' && window.SHOWTIME_ID_GLOBAL) {
            sessionData.showtime_id = window.SHOWTIME_ID_GLOBAL;
        }

        if (typeof window.selected !== 'undefined' && Array.isArray(window.selected) && window.selected.length > 0) {
            sessionData.recommended_seats = window.selected.map(code => {
                const type = window.seatState?.[code]?.seat_type || "normal";
                const price = window.seatPrices?.[type] || 0;
                return {
                    seat_id: code,
                    seat_code: code,
                    seat_type: type,
                    price: price
                };
            });
            sessionData.next_action = "CONFIRM_BOOKING";
        }

        if (typeof window.comboList !== 'undefined' && Array.isArray(window.comboList) && window.comboList.length > 0) {
            sessionData.selected_combos = window.comboList.map(c => ({
                id: c.name,
                name: c.name,
                price: c.price,
                qty: c.qty
            }));
            sessionData.next_action = "SELECT_COMBO";
        }
    }

    function syncCombosToParent(selectedCombos) {
        if (!selectedCombos || !Array.isArray(selectedCombos)) return;
        const comboGrid = document.getElementById("combo-grid");
        if (!comboGrid) return;

        if (typeof window.comboList !== 'undefined') {
            window.comboList = [];
            window.comboTotal = 0;
        }

        document.querySelectorAll(".combo-item").forEach(item => {
            const nameEl = item.querySelector(".combo-name");
            const qtyEl = item.querySelector(".combo-count");
            const priceVal = parseInt(item.dataset.price || "0");
            if (!nameEl || !qtyEl) return;

            const comboName = nameEl.innerText.trim();
            const matchVoice = selectedCombos.find(vc => 
                comboName.toLowerCase().includes(vc.name.toLowerCase()) || 
                vc.name.toLowerCase().includes(comboName.toLowerCase())
            );

            const newQty = matchVoice ? matchVoice.qty : 0;
            qtyEl.innerText = newQty;

            if (newQty > 0 && typeof window.comboList !== 'undefined') {
                window.comboList.push({
                    name: comboName,
                    price: priceVal,
                    qty: newQty
                });
                window.comboTotal += priceVal * newQty;
            }
        });

        if (typeof window.updateTotal === 'function') {
            window.updateTotal();
        } else {
            const totalEl = document.getElementById("total-price");
            if (totalEl) {
                const bookingData = JSON.parse(localStorage.getItem("booking_data") || "{}");
                const seatPrice = parseInt(bookingData.seat_total || 0);
                const total = seatPrice + (window.comboTotal || 0);
                totalEl.innerText = Number(total).toLocaleString("vi-VN") + "đ";
            }
        }
    }

    function getCurrentStepNumber() {
        const nextAction = sessionData.next_action;
        let currentStep = 1;

        if (nextAction === "SELECT_SHOWTIME") {
            currentStep = 2;
        } else if (nextAction === "CONFIRM_BOOKING" || nextAction === "SELECT_SEAT") {
            currentStep = 3;
        } else if (nextAction === "SELECT_COMBO") {
            currentStep = 4;
        } else if (nextAction === "SHOW_PAYMENT_QR" || nextAction === "REDIRECT_TO_PAYMENT") {
            currentStep = 5;
        } else if (sessionData.movie_id) {
            currentStep = 2;
        }
        return currentStep;
    }

    function updateProgressSteps() {
        const stepsContainer = document.getElementById("voiceProgressSteps");
        if (!stepsContainer) return;

        const currentStep = getCurrentStepNumber();
        const steps = [
            { num: 1, label: "Phim" },
            { num: 2, label: "Suất" },
            { num: 3, label: "Ghế" },
            { num: 4, label: "Combo" },
            { num: 5, label: "Thanh toán" }
        ];

        stepsContainer.innerHTML = steps.map((s, index) => {
            let statusClass = "";
            if (s.num < currentStep) statusClass = "completed";
            else if (s.num === currentStep) statusClass = "active";
            
            const line = index > 0 ? `<div class="step-line ${s.num <= currentStep ? 'active' : ''}"></div>` : '';
            return `
                ${line}
                <div class="progress-step ${statusClass}">
                    <div class="step-dot">${s.num < currentStep ? '✓' : s.num}</div>
                    <div class="step-label">${s.label}</div>
                </div>
            `;
        }).join('');
    }

    function updateSuggestions() {
        const suggContainer = document.getElementById("voiceSuggestions");
        const wrapper = document.querySelector(".voice-suggestions-wrapper");
        if (!suggContainer) return;

        const nextAction = sessionData.next_action;
        let list = [];

        if (nextAction === "SELECT_MOVIE" || !sessionData.movie_id) {
            list = [
                "Tìm phim hành động",
                "Có phim gì đang chiếu?",
                "Đặt phim Avengers",
                "Xem lịch chiếu tối nay"
            ];
        } else if (nextAction === "SELECT_SHOWTIME") {
            list = [
                "Suất chiếu tối nay",
                "Xem lúc 19:30",
                "Chọn suất chiếu số 1",
                "Đổi phim khác"
            ];
        } else if (nextAction === "CONFIRM_BOOKING" || nextAction === "SELECT_SEAT") {
            list = [
                "Chọn ghế F4 và F5",
                "Đặt 2 ghế VIP ở giữa",
                "Tôi đồng ý đặt",
                "Chọn ghế khác"
            ];
        } else if (nextAction === "SELECT_COMBO") {
            list = [
                "Lấy combo VIP",
                "Thêm 1 combo đôi",
                "Thanh toán luôn",
                "Hủy bỏ"
            ];
        } else if (nextAction === "SHOW_PAYMENT_QR" || nextAction === "REDIRECT_TO_PAYMENT") {
            list = [
                "Hủy vé này",
                "Quay lại bước trước",
                "Đặt vé mới"
            ];
        } else {
            list = [
                "Đặt vé xem phim",
                "Hôm nay có phim gì?",
                "Xem lịch chiếu"
            ];
        }

        // Hide bottom suggestions in Step 1 if no movies are loaded (as they are displayed inline)
        if (wrapper) {
            const currentStep = getCurrentStepNumber();
            const hasMovies = currentAIResponse?.data?.movies && currentAIResponse.data.movies.length > 0;
            if (currentStep === 1 && !hasMovies) {
                wrapper.style.display = "none";
            } else {
                wrapper.style.display = "block";
            }
        }

        suggContainer.innerHTML = list.map(item => `
            <button class="voice-suggestion-tag" onclick="window.processVoice('${item}')">${item}</button>
        `).join('');
    }

    function openAssistant() {
        overlay.classList.add("open");
        trigger.style.display = "none";
        syncParentStateToSession();
        updateProgressSteps();
        updateSuggestions();
        renderActiveStep();
        startListening();
    }

    function closeAssistant() {
        overlay.classList.remove("open");
        trigger.style.display = "flex";
        stopListening();
        window.speechSynthesis.cancel();
        if (seatRefreshInterval) {
            clearInterval(seatRefreshInterval);
            seatRefreshInterval = null;
        }
    }

    function startListening() {
        if (!recognition) {
            console.warn("Speech recognition not supported in this browser.");
            return;
        }
        if (isSpeechEngineActive) return;
        
        shouldAutoRestart = true;
        lastTranscript = '';
        networkRetryCount = 0;
        
        try {
            recognition.start();
        } catch (e) {
            console.error("Mic start error:", e);
            try {
                recognition.abort();
                setTimeout(() => {
                    try { recognition.start(); } catch(err) { console.error("Mic retry failed:", err); }
                }, 300);
            } catch (err) {
                console.error("Mic abort failed:", err);
            }
        }
    }

    function stopListening() {
        if (!recognition) return;
        
        shouldAutoRestart = false; // Stop the auto-reconnect loop
        
        if (silenceTimer) {
            clearTimeout(silenceTimer);
            silenceTimer = null;
        }

        if (isListening || isSpeechEngineActive) {
            try {
                recognition.abort();
            } catch (e) {
                console.error("Mic stop error:", e);
            }
            isListening = false;
            isSpeechEngineActive = false;
            const waveCircle = document.getElementById("voiceMicBtn");
            if (waveCircle) waveCircle.classList.remove("listening");
        }
    }

    async function processVoice(text) {
        status.innerText = "Đang phân tích...";
        syncParentStateToSession();
        
        try {
            sessionData.user_id = localStorage.getItem("USER_ID") || "anonymous";
            const res = await fetch(`${window.APP_CONFIG.API_BASE}/voice/process`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    text, 
                    history: conversationHistory,
                    session_data: sessionData 
                })
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                reply.innerText = `Lỗi ${res.status}: ${errorData.message || 'Server không phản hồi'}`;
                status.innerText = "Lỗi kết nối";
                return;
            }

            const data = await res.json();
            currentAIResponse = data;
            
            conversationHistory.push({ role: "user", text: text });
            conversationHistory.push({ role: "assistant", text: data.reply });
            if (conversationHistory.length > 10) conversationHistory.shift();
            
            if (data.data) {
                if (data.data.movies) sessionData.last_movies = data.data.movies;
                if (data.data.movie) sessionData.movie_id = data.data.movie.id;
                if (data.data.showtime) sessionData.showtime_id = data.data.showtime.showtime_id;
                if (data.data.recommended_seats) sessionData.recommended_seats = data.data.recommended_seats;
                if (data.data.quantity) sessionData.quantity = data.data.quantity;
                if (data.data.selected_combos) sessionData.selected_combos = data.data.selected_combos;
                if (data.data.booking_date) sessionData.booking_date = data.data.booking_date;
                if (data.next_action) sessionData.next_action = data.next_action;
            }

            displayReply(data);
            
        } catch (err) {
            console.error("Process error:", err);
            reply.innerText = "Lỗi mạng: Không thể kết nối tới API Gateway.";
            status.innerText = "Lỗi kết nối";
        }
    }

    window.processVoice = processVoice;

    function displayReply(data) {
        status.innerText = "D-Prime Assistant";
        reply.innerText = data.reply;
        
        if (data.data) {
            if (data.data.movie) sessionData.movie_id = data.data.movie.id;
            if (data.data.showtime) sessionData.showtime_id = data.data.showtime.showtime_id;
            if (data.data.quantity) sessionData.quantity = data.data.quantity;
            if (data.data.seat_preference) sessionData.preference = data.data.seat_preference;
            if (data.data.selected_combos) sessionData.selected_combos = data.data.selected_combos;
            if (data.data.combo_offered !== undefined) sessionData.combo_offered = data.data.combo_offered;
            if (data.data.booking_date) sessionData.booking_date = data.data.booking_date;
            if (data.next_action) sessionData.next_action = data.next_action;
        }

        // Mascot State Dynamic
        if (data.next_action === "SHOW_PAYMENT_QR" || (data.intent === "CONFIRM" && data.next_action !== "SELECT_COMBO")) {
            mascot.src = "assets/images/dprime_mascot_success.png";
        } else {
            mascot.src = "assets/images/dprime_mascot_standard.png";
        }

        // Synchronize seats to parent if on booking-seat.php
        if (data.data && data.data.recommended_seats && typeof window.selectSeat === 'function') {
            const newCodes = data.data.recommended_seats.map(s => s.seat_code);
            if (typeof window.selected !== 'undefined' && Array.isArray(window.selected)) {
                const toRelease = window.selected.filter(c => !newCodes.includes(c));
                toRelease.forEach(code => {
                    window.selectSeat(code);
                });
                newCodes.forEach(code => {
                    if (!window.selected.includes(code)) {
                        window.selectSeat(code);
                    }
                });
            }
        }

        // Synchronize combos to parent if on booking-combo.php
        if (sessionData.selected_combos && sessionData.selected_combos.length > 0) {
            syncCombosToParent(sessionData.selected_combos);
        }

        updateProgressSteps();
        updateSuggestions();
        renderActiveStep();

        speak(data.reply, () => {
            if (data.next_action !== "REDIRECT_TO_PAYMENT" && data.next_action !== "SHOW_PAYMENT_QR") {
                setTimeout(startListening, 500); 
            }
        });
    }

    /**
     * Render dynamic visual components in the right-hand panel
     */
    function renderActiveStep() {
        if (!rightPanel) return;

        const currentStep = getCurrentStepNumber();
        let finalHtml = '';

        // 1. STEP 1: CHỌN PHIM
        if (currentStep === 1) {
            const movies = currentAIResponse?.data?.movies || [];
            
            if (movies.length > 0) {
                finalHtml = `
                    <div class="voice-step-title">BƯỚC 1: CHỌN PHIM</div>
                    <p class="voice-step-subtitle">Bấm vào phim hoặc nói theo số thứ tự để chọn</p>
                    <div class="voice-movie-list" style="max-height: 310px; overflow-y: auto; padding-right: 5px;">
                `;
                movies.forEach((m, index) => {
                    const posterUrl = m.poster ? (m.poster.startsWith('http') ? m.poster : (typeof window.getAssetUrl === 'function' ? window.getAssetUrl(m.poster) : `assets/images/${m.poster}`)) : 'https://placehold.co/100x140?text=Poster';
                    finalHtml += `
                        <div class="voice-recommendation-card" style="position: relative;" onclick="window.processVoice('Chọn phim số ${index + 1}')">
                            <div style="position: absolute; top: -5px; left: -5px; width: 22px; height: 22px; background: #f39c12; color: black; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 11px; box-shadow: 0 4px 10px rgba(243, 156, 18, 0.4); z-index: 2;">${index + 1}</div>
                            <img src="${posterUrl}" class="voice-rec-poster" onerror="this.src='https://placehold.co/100x140?text=Poster'">
                            <div class="voice-rec-info">
                                <div class="voice-rec-title">${m.title}</div>
                                <div class="voice-rec-details">${m.duration ? m.duration + ' phút' : 'Hành động, Phiêu lưu'} • <span style="color: #2ecc71; font-weight: bold;">Đang chiếu</span></div>
                                <div style="font-size: 9px; color: #f39c12; font-weight: 800; margin-top: 5px; text-transform: uppercase; letter-spacing: 1px;">Nói "Chọn phim số ${index + 1}"</div>
                            </div>
                        </div>
                    `;
                });
                finalHtml += `</div>`;
            } else {
                finalHtml = `
                    <div class="voice-mic-hero-container" style="justify-content: flex-start; padding-top: 25px;">
                        <h3 class="voice-step-title">BƯỚC 1: CHỌN PHIM</h3>
                        <p class="voice-step-subtitle" style="margin-bottom: 25px;">Hãy nói tên phim bạn muốn xem hoặc chọn các gợi ý bên dưới</p>
                        
                        <div class="voice-transcript" id="voiceTranscript" style="font-size: 15px; color: #f39c12; margin-bottom: 30px; font-weight: 800; min-height: 45px; text-align: center; background: rgba(0,0,0,0.2); padding: 12px; border-radius: 12px; border: 1px dashed rgba(243, 156, 18, 0.25); width: 100%; max-width: 440px;">Hãy nói yêu cầu của bạn...</div>
                        
                        <!-- Inline Premium suggestions -->
                        <div class="voice-inline-suggestions" style="margin-top: 10px;">
                            <div class="voice-inline-sugg-title">Gợi ý tìm kiếm nhanh:</div>
                            <div class="voice-inline-sugg-grid">
                                <button class="voice-sugg-btn" onclick="window.processVoice('Tìm phim hành động')">🔍 Tìm phim hành động</button>
                                <button class="voice-sugg-btn" onclick="window.processVoice('Có phim gì đang chiếu?')">🎬 Phim đang chiếu</button>
                                <button class="voice-sugg-btn" onclick="window.processVoice('Đặt phim Avengers')">🎟️ Đặt phim Avengers</button>
                                <button class="voice-sugg-btn" onclick="window.processVoice('Xem lịch chiếu tối nay')">📅 Lịch chiếu tối nay</button>
                            </div>
                        </div>
                    </div>
                `;
            }
        }
        // 2. STEP 2: CHỌN SUẤT CHIẾU
        else if (currentStep === 2) {
            const movie = currentAIResponse?.data?.movie || {};
            const showtimes = currentAIResponse?.data?.showtimes || [];
            const posterUrl = movie.poster ? (movie.poster.startsWith('http') ? movie.poster : (typeof window.getAssetUrl === 'function' ? window.getAssetUrl(movie.poster) : `assets/images/${movie.poster}`)) : 'https://placehold.co/100x140?text=Poster';

            let showtimesHtml = '';
            if (showtimes.length > 0) {
                showtimes.forEach((st, index) => {
                    showtimesHtml += `
                        <div class="voice-showtime-item" onclick="window.processVoice('Chọn suất chiếu số ${index + 1}')">
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <div style="width: 22px; height: 22px; background: rgba(243, 156, 18, 0.2); color: #f39c12; border: 1px solid #f39c12; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: bold;">${index + 1}</div>
                                <span class="voice-st-time">${st.show_time}</span>
                            </div>
                            <div class="voice-st-details">
                                <span class="voice-st-cinema">${st.cinema_name}</span>
                                <span class="voice-st-seats-badge">Phòng: ${st.room_name} • Còn ghế</span>
                            </div>
                        </div>
                    `;
                });
            } else {
                showtimesHtml = `<div style="color: #888; text-align: center; padding: 20px;">Hãy hỏi "Suất chiếu tối nay" để tải lịch chiếu</div>`;
            }

            finalHtml = `
                <div class="voice-step-title">BƯỚC 2: CHỌN SUẤT CHIẾU</div>
                <p class="voice-step-subtitle">Dprime AI đã tìm thấy các suất chiếu phù hợp</p>
                <div style="display: flex; gap: 20px; flex-wrap: wrap; margin-bottom: 15px;">
                    <img src="${posterUrl}" style="width: 90px; height: 125px; border-radius: 8px; object-fit: cover; border: 1px solid rgba(255,255,255,0.08);" onerror="this.src='https://placehold.co/100x140?text=Poster'">
                    <div style="flex: 1; min-width: 200px;">
                        <div style="font-size: 16px; font-weight: 800; color: #fff; margin-bottom: 4px;">${movie.title || 'Đang chọn phim...'}</div>
                        <div style="font-size: 12px; color: var(--voice-text-muted); margin-bottom: 12px;">Thời lượng: ${movie.duration || '---'} phút</div>
                        <div class="voice-showtime-list" style="max-height: 180px; overflow-y: auto;">
                            ${showtimesHtml}
                        </div>
                    </div>
                </div>
                <div class="voice-nav-buttons">
                    <button class="voice-nav-btn back" onclick="window.processVoice('Đổi phim khác')">Quay lại</button>
                    <button class="voice-nav-btn next" onclick="window.processVoice('Chọn suất chiếu số 1')">Chọn suất 1</button>
                </div>
            `;
        }
        // 3. STEP 3: CHỌN GHẾ
        else if (currentStep === 3) {
            const seats = currentAIResponse?.data?.recommended_seats || [];
            const seatCodes = seats.map(s => s.seat_code || s);

            finalHtml = `
                <div class="voice-step-title">BƯỚC 3: CHỌN GHẾ</div>
                <p class="voice-step-subtitle">Dprime AI gợi ý những ghế đẹp nhất cho bạn</p>
                <div style="text-align: center; color: #888; font-size: 9px; margin-bottom: 5px; font-weight: bold; letter-spacing: 2px;">MÀN HÌNH</div>
                <div style="width: 60%; height: 2px; background: var(--voice-primary); margin: 0 auto 10px; box-shadow: 0 0 10px var(--voice-primary-glow);"></div>
                <div class="voice-theater-seat-grid" id="voiceSeatGridInline">
                    <!-- Loaded dynamically via refreshSeatMap -->
                    <div style="color: #888; padding: 15px;">Đang tải sơ đồ ghế...</div>
                </div>
                
                <div class="voice-seat-info-card">
                    <div style="font-size: 11px; color: var(--voice-text-muted); font-weight: 800; letter-spacing: 1px;">GHẾ ĐƯỢC CHỌN</div>
                    <div class="voice-selected-seat-badge-container">
                        ${seatCodes.length > 0 ? seatCodes.map(code => `<span class="voice-selected-seat-badge">${code}</span>`).join('') : '<span style="color:#666; font-size:13px;">Chưa chọn ghế</span>'}
                    </div>
                    <ul class="voice-seat-bullet-list">
                        <li><i class="fa-solid fa-check" style="color: #2ecc71;"></i> Vị trí trung tâm</li>
                        <li><i class="fa-solid fa-check" style="color: #2ecc71;"></i> Tầm nhìn tốt</li>
                        <li><i class="fa-solid fa-check" style="color: #2ecc71;"></i> Khoảng cách lý tưởng</li>
                    </ul>
                </div>
                <div class="voice-nav-buttons">
                    <button class="voice-nav-btn back" onclick="window.processVoice('Chọn ghế khác')">Ghế khác</button>
                    <button class="voice-nav-btn next" onclick="window.processVoice('Tôi đồng ý đặt')">Đồng ý đặt</button>
                </div>
            `;

            // Start seat map polling
            const stId = currentAIResponse?.data?.showtime?.showtime_id || sessionData.showtime_id;
            if (stId) {
                if (seatRefreshInterval) clearInterval(seatRefreshInterval);
                setTimeout(() => refreshSeatMap(stId, seats), 100);
                seatRefreshInterval = setInterval(() => {
                    refreshSeatMap(stId, seats);
                }, 3000);
            }
        }
        // 4. STEP 4: CHỌN COMBO
        else if (currentStep === 4) {
            const combos = currentAIResponse?.data?.combos || [];
            const selectedCombos = sessionData.selected_combos || [];
            const seatTotal = (sessionData.recommended_seats || []).reduce((sum, s) => sum + (Number(s.price) || 0), 0);
            const comboTotal = selectedCombos.reduce((sum, c) => sum + (c.price * c.qty), 0);
            const grandTotal = seatTotal + comboTotal;

            let combosHtml = '';
            if (combos.length > 0) {
                combos.forEach((c, index) => {
                    const isSelected = selectedCombos.some(sc => sc.name.toLowerCase().includes(c.name.toLowerCase()) && sc.qty > 0);
                    const qty = selectedCombos.find(sc => sc.name.toLowerCase().includes(c.name.toLowerCase()))?.qty || 0;
                    combosHtml += `
                        <div class="voice-combo-package-card ${isSelected ? 'selected' : ''}" onclick="window.processVoice('Chọn combo số ${index + 1}')">
                            <div class="voice-combo-icon-wrap">
                                <img src="assets/images/combo/${c.image}" class="voice-combo-img-fallback" onerror="this.src='https://placehold.co/60x60?text=Combo'">
                            </div>
                            <div class="voice-combo-pkg-name">${c.name}</div>
                            <div class="voice-combo-pkg-price">${c.price.toLocaleString()}đ</div>
                            ${qty > 0 ? `<div style="font-size:11px; color:#2ecc71; font-weight:bold; margin-top:5px;">Số lượng: ${qty}</div>` : ''}
                        </div>
                    `;
                });
            } else {
                combosHtml = `<div style="color: #888; text-align: center; padding: 20px; width: 100%;">Không có combo khả dụng</div>`;
            }

            finalHtml = `
                <div class="voice-step-title">BƯỚC 4: CHỌN COMBO</div>
                <p class="voice-step-subtitle">Chọn combo yêu thích để có trải nghiệm trọn vẹn</p>
                <div class="voice-combos-grid">
                    ${combosHtml}
                </div>
                
                <div class="voice-order-summary-card">
                    <div class="voice-summary-title">Thông tin đơn hàng</div>
                    <div class="voice-summary-rows">
                        <div class="voice-summary-row"><span class="label">Ghế đã chọn:</span><span class="val">${(sessionData.recommended_seats || []).map(s => s.seat_code).join(', ')}</span></div>
                        <div class="voice-summary-row"><span class="label">Tiền ghế:</span><span class="val">${seatTotal.toLocaleString()}đ</span></div>
                        <div class="voice-summary-row"><span class="label">Tiền combo:</span><span class="val">${comboTotal.toLocaleString()}đ</span></div>
                    </div>
                    <div class="voice-summary-divider"></div>
                    <div class="voice-summary-grand-total">
                        <span class="voice-grand-total-label">TỔNG CỘNG</span>
                        <span class="voice-grand-total-val">${grandTotal.toLocaleString()}đ</span>
                    </div>
                </div>

                <div class="voice-nav-buttons">
                    <button class="voice-nav-btn back" onclick="window.processVoice('Hủy bỏ')">Không, bỏ qua</button>
                    <button class="voice-nav-btn next" onclick="window.processVoice('Thanh toán luôn')">Thanh toán luôn</button>
                </div>
            `;
        }
        // 5. STEP 5: THANH TOÁN
        else if (currentStep === 5) {
            const payMethods = currentAIResponse?.data?.payment_methods || [
                { id: "momo", name: "MOMO", desc: "Ví điện tử", active: true },
                { id: "zalopay", name: "ZaloPay", desc: "Ví điện tử", active: false },
                { id: "bank_transfer", name: "Thẻ ngân hàng", desc: "Visa, Mastercard, JCB", active: false },
                { id: "vnpay", name: "VNPay", desc: "Ví điện tử", active: false }
            ];
            const userInfo = currentAIResponse?.data?.user_info || { fullname: "Khách hàng", phone: "", rank: "Đồng" };
            const isQRShowing = currentAIResponse?.next_action === "SHOW_PAYMENT_QR";

            if (isQRShowing && currentAIResponse?.data) {
                const amount = currentAIResponse.data.final_total || 0;
                const content = currentAIResponse.data.booking_code || "DPRIME_VOICE";
                const qrUrl = `https://img.vietqr.io/image/970422-131020047979-compact2.jpg?amount=${amount}&addInfo=${encodeURIComponent(content)}&accountName=NGUYEN%20VAN%20DUY`;

                finalHtml = `
                    <div class="voice-success-card">
                        <div class="voice-success-icon"><i class="fa-solid fa-circle-check"></i></div>
                        <div class="voice-success-title">Đặt Vé Thành Công!</div>
                        <p class="voice-success-desc">Chúc bạn xem phim vui vẻ tại D-Prime Cinema. Quét mã QR bên dưới để thanh toán.</p>
                        <div class="voice-success-qr-wrap">
                            <img src="${qrUrl}" class="voice-success-qr-img" alt="QR Code">
                        </div>
                        <div style="text-align: left; font-size: 13px; color: #a0aec0; background: rgba(0,0,0,0.4); padding: 12px; border-radius: 8px;">
                            <div style="margin-bottom: 5px;">Mã đặt vé: <span style="color: #fff; float: right; font-weight: 800;">${content}</span></div>
                            <div style="margin-bottom: 5px;">Số tiền: <span style="color: #f39c12; font-weight: 800; float: right;">${amount.toLocaleString()}đ</span></div>
                            <div style="margin-bottom: 5px;">Khách hàng: <span style="color: #fff; float: right;">${userInfo.fullname}</span></div>
                        </div>
                    </div>
                `;

                // Set localStorage and redirect
                const bookingData = {
                    showtime_id: currentAIResponse.data.showtime_id || sessionData.showtime_id,
                    seats: (sessionData.recommended_seats || []).map(s => s.seat_code),
                    seat_total: currentAIResponse.data.seat_total || 0,
                    combos: sessionData.selected_combos || [],
                    combo_total: currentAIResponse.data.combo_total || 0,
                    final_total: currentAIResponse.data.final_total || amount,
                    hold_until: currentAIResponse.data.hold_until,
                    booking_code: content,
                    user_id: localStorage.getItem("USER_ID") || "anonymous",
                    voice_booking: true
                };
                localStorage.setItem("booking_final", JSON.stringify(bookingData));

                setTimeout(() => {
                    window.location.href = `index.php?p=cGF5bWVudA==&showtime_id=${bookingData.showtime_id}`;
                }, 4000);
            } else {
                let pmHtml = '';
                payMethods.forEach(pm => {
                    const isSelected = pm.id === "momo"; // Default Momo selected in UI
                    pmHtml += `
                        <div class="voice-pm-item ${isSelected ? 'selected' : ''}" onclick="window.processVoice('Xác nhận đặt vé')">
                            <div class="voice-pm-icon">
                                ${pm.id === 'momo' ? '<i class="fa-solid fa-wallet"></i>' : pm.id === 'bank_transfer' ? '<i class="fa-solid fa-building-columns"></i>' : '<i class="fa-solid fa-credit-card"></i>'}
                            </div>
                            <div class="voice-pm-details">
                                <span class="voice-pm-name">${pm.name}</span>
                                <span class="voice-pm-desc">Khách hàng: ${userInfo.fullname} • ${pm.desc}</span>
                            </div>
                            <div class="voice-pm-check"></div>
                        </div>
                    `;
                });

                finalHtml = `
                    <div class="voice-step-title">BƯỚC 5: THANH TOÁN</div>
                    <p class="voice-step-subtitle">Xác nhận phương thức thanh toán của bạn</p>
                    <div class="voice-pm-list">
                        ${pmHtml}
                    </div>
                    <button class="voice-pay-confirm-btn" onclick="window.processVoice('Xác nhận đặt vé')">
                        <i class="fa-solid fa-lock"></i> XÁC NHẬN & THANH TOÁN
                    </button>
                    <div class="voice-nav-buttons">
                        <button class="voice-nav-btn back" onclick="window.processVoice('Quay lại bước trước')">Quay lại</button>
                    </div>
                `;
            }
        }

        rightPanel.innerHTML = finalHtml;

    }

    // 4. Event Listeners
    if (recognition) {
        recognition.onstart = () => {
            isSpeechEngineActive = true;
            isListening = true;
            networkRetryCount = 0; // Reset on successful start
            status.innerText = "Hệ thống đang nghe...";
            const waveCircle = document.getElementById("voiceMicBtn");
            if (waveCircle) waveCircle.classList.add("listening");
        };

        recognition.onend = () => {
            isSpeechEngineActive = false;
            isListening = false;
            const waveCircle = document.getElementById("voiceMicBtn");
            if (waveCircle) waveCircle.classList.remove("listening");
            
            if (silenceTimer) {
                clearTimeout(silenceTimer);
                silenceTimer = null;
            }

            // Auto-reconnect: restart mic if user hasn't explicitly stopped
            if (shouldAutoRestart) {
                setTimeout(() => {
                    if (shouldAutoRestart && !isSpeechEngineActive) {
                        try {
                            recognition.start();
                        } catch(e) {
                            console.error("Auto-reconnect failed:", e);
                        }
                    }
                }, 250);
            }
        };

        recognition.onresult = (event) => {
            let interimText = '';
            let finalText = '';
            
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalText += transcript;
                } else {
                    interimText += transcript;
                }
            }

            // Accumulate final text across reconnections
            if (finalText) {
                lastTranscript = (lastTranscript + ' ' + finalText).trim();
            }
            
            const displayText = lastTranscript + (interimText ? ' ' + interimText : '');
            const transcriptEl = document.getElementById("voiceTranscript");
            if (transcriptEl) transcriptEl.innerText = displayText.trim() || "Hãy nói yêu cầu của bạn...";
            
            // Reset silence timer — process after user stops speaking
            if (silenceTimer) clearTimeout(silenceTimer);
            silenceTimer = setTimeout(() => {
                const textToSend = lastTranscript.trim() || interimText.trim();
                if (textToSend) {
                    stopListening();
                    processVoice(textToSend);
                }
            }, SILENCE_TIMEOUT_MS);
        };

        recognition.onerror = (event) => {
            console.error("Speech recognition error:", event.error);
            isSpeechEngineActive = false;
            
            if (silenceTimer) {
                clearTimeout(silenceTimer);
                silenceTimer = null;
            }
            
            const waveCircle = document.getElementById("voiceMicBtn");
            if (waveCircle) waveCircle.classList.remove("listening");

            if (event.error === 'no-speech') {
                // Silently auto-retry, don't bother the user
                return; // onend will auto-reconnect
            }
            
            if (event.error === 'not-allowed') {
                shouldAutoRestart = false;
                isListening = false;
                status.innerText = "Lỗi: Mic bị chặn";
                const transcriptEl = document.getElementById("voiceTranscript");
                if (transcriptEl) transcriptEl.innerText = "Hãy cho phép trình duyệt truy cập Microphone (hoặc dùng HTTPS).";
                return;
            }

            if (event.error === 'network') {
                networkRetryCount++;
                if (networkRetryCount <= MAX_NETWORK_RETRIES) {
                    console.log(`Network error, auto-retry ${networkRetryCount}/${MAX_NETWORK_RETRIES}...`);
                    status.innerText = `Đang kết nối lại... (${networkRetryCount}/${MAX_NETWORK_RETRIES})`;
                    // onend will auto-reconnect via shouldAutoRestart
                    return;
                } else {
                    shouldAutoRestart = false;
                    isListening = false;
                    status.innerText = "Lỗi: Mất kết nối";
                    const transcriptEl = document.getElementById("voiceTranscript");
                    if (transcriptEl) transcriptEl.innerText = "Không thể kết nối Google Speech. Hãy kiểm tra mạng rồi bấm mic để thử lại.";
                    return;
                }
            }
            
            if (event.error === 'aborted') {
                return; // Silent — user intentionally stopped
            }

            isListening = false;
            status.innerText = "Lỗi: " + event.error;
        };
    }

    trigger.addEventListener("click", openAssistant);
    closeBtn.addEventListener("click", closeAssistant);
    
    // Bind click event to Mic permanently in left panel
    const mainMicBtn = document.getElementById("voiceMicBtn");
    if (mainMicBtn) {
        mainMicBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            if (isListening) {
                stopListening();
            } else {
                startListening();
            }
        });
    }

    // Clicking anywhere on card (except interactive areas) triggers microphone recording at any step
    card.addEventListener("click", (e) => {
        if (e.target.closest("#voiceRightPanel") || e.target.closest("#voiceSuggestions") || e.target.closest("#voiceClose") || e.target.closest("#voiceMicBtn")) return;
        if (!isListening) startListening();
    });

    overlay.addEventListener("click", (e) => {
        if (e.target === overlay) closeAssistant();
    });
});
