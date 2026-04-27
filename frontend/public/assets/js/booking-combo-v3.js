// ===== LẤY DATA =====
const bookingData = JSON.parse(localStorage.getItem("booking_data") || "{}");

if (!bookingData || !bookingData.seats || bookingData.seats.length === 0) {
    alert("Không có dữ liệu ghế!");
    window.location.href = "index.php?p=Ym9va2luZy1zZWF0";
}

// ===== SHOWTIME =====
const SHOWTIME_ID = bookingData.showtime_id || window.SHOWTIME_ID_GLOBAL || 0;

// ===== GLOBAL =====
let comboTotal = 0;
let comboList = [];
let countdownInterval = null;

function navigateInternal(url) {
    // Dùng sessionStorage làm backup phòng race condition
    sessionStorage.setItem("INTERNAL_NAVIGATION", "true");
    window.location.href = url;
}

// ===== FORMAT =====
function formatPrice(num) {
    return Number(num).toLocaleString("vi-VN") + "đ";
}

// ===== DOM READY =====
document.addEventListener("DOMContentLoaded", () => {

    const totalEl = document.getElementById("total-price");
    const seatsEl = document.getElementById("selected-seats");
    const movieNameEl = document.getElementById("movie-name");
    const cinemaInfoEl = document.getElementById("cinema-info");
    const movieNameFooterEl = document.getElementById("movie-name-footer");
    const cinemaInfoFooterEl = document.getElementById("cinema-info-footer");
    const posterEl = document.getElementById("movie-poster");
    const countdownEl = document.getElementById("countdown");
    const countdownFooterEl = document.getElementById("countdown-footer");

    const seatPrice = parseInt(bookingData.seat_total || 0);

    // ===== CHECK HOLD =====
    if (bookingData.hold_until) {
        const now = Date.now();
        const end = new Date(bookingData.hold_until).getTime();
        if (end <= now) {
            alert("Ghế đã hết thời gian giữ!");
            // Dùng navigateInternal khi redirect về seat để giữ ghế
            navigateInternal("index.php?p=Ym9va2luZy1zZWF0&showtime_id=" + SHOWTIME_ID);
            return;
        }
    } else {
        alert("Không có thời gian giữ ghế!");
        window.location.href = "index.php?p=Ym9va2luZy1zZWF0";
        return;
    }

    // ===== HIỂN THỊ =====
    if (totalEl) totalEl.innerText = formatPrice(seatPrice);
    if (seatsEl && bookingData.seats) seatsEl.innerText = bookingData.seats.join(", ");

    // ===== LOAD =====
    loadCombos();
    loadShowtimeInfo();
    startCountdown();

    // ===== BACK BUTTON =====
    // FIX: Phải set INTERNAL_NAVIGATION trước khi quay về booking-seat
    // để booking-seat biết đây là navigate nội bộ, không gửi LEAVE_SHOWTIME
    const backBtn = document.querySelector(".back");
    if (backBtn) {
        backBtn.addEventListener("click", () => {
            navigateInternal("index.php?p=Ym9va2luZy1zZWF0&showtime_id=" + SHOWTIME_ID);
        });
    }

    // ===== NEXT =====
    const nextBtn = document.querySelector(".booking-footer-next");
    if (nextBtn) {
        nextBtn.addEventListener("click", () => {
            const now = Date.now();
            const end = new Date(bookingData.hold_until).getTime();
            if (end <= now) {
                alert("⏰ Hết thời gian giữ ghế!");
                navigateInternal("index.php?p=Ym9va2luZy1zZWF0&showtime_id=" + SHOWTIME_ID);
                return;
            }

            const finalData = {
                ...bookingData,
                combos: comboList,
                combo_total: comboTotal,
                final_total: seatPrice + comboTotal
            };

            localStorage.setItem("booking_final", JSON.stringify(finalData));
            
            navigateInternal("index.php?p=cGF5bWVudA==&showtime_id=" + SHOWTIME_ID);
        });
    }

    /* ================= COUNTDOWN ================= */

    function startCountdown() {
        function updateCountdown() {
            const now = Date.now();
            const end = new Date(bookingData.hold_until).getTime();
            const timeLeft = Math.floor((end - now) / 1000);

            if (timeLeft <= 0) {
                clearInterval(countdownInterval);
                alert("⏰ Hết thời gian giữ ghế!");
                // Khi timeout, quay về seat để re-chọn — KHÔNG gửi LEAVE (ghế đã expire)
                navigateInternal("index.php?p=Ym9va2luZy1zZWF0&showtime_id=" + SHOWTIME_ID);
                return;
            }

            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            const format = `${minutes}:${seconds.toString().padStart(2, "0")}`;

            if (countdownEl) countdownEl.innerText = format;
            if (countdownFooterEl) countdownFooterEl.innerText = "⏳ " + format;
        }

        updateCountdown();
        if (countdownInterval) clearInterval(countdownInterval);
        countdownInterval = setInterval(updateCountdown, 1000);
    }

    /* ================= LOAD COMBO ================= */

    async function loadCombos() {
        try {
            const res = await fetch(`${window.APP_CONFIG.API_BASE}/booking/combos/${SHOWTIME_ID}`);
            const combos = await res.json();
            const grid = document.getElementById("combo-grid");
            if (!grid) return;
            grid.innerHTML = "";

            combos.forEach(combo => {
                const div = document.createElement("div");
                div.className = "combo-item";
                div.dataset.price = combo.price;
                const desc = combo.description.replace(/\n/g, "<br>");
                div.innerHTML = `
                    <img src="./assets/images/combo/${combo.image}" class="combo-img">
                    <div class="combo-content">
                        <h3 class="combo-name">${combo.name}</h3>
                        <p class="combo-desc">${desc}</p>
                        <div class="combo-price">${formatPrice(combo.price)}</div>
                        <div class="combo-qty">
                            <button class="combo-minus">-</button>
                            <span class="combo-count">0</span>
                            <button class="combo-plus">+</button>
                        </div>
                    </div>
                `;
                grid.appendChild(div);
            });

            bindComboEvents();
        } catch (err) {
            console.error("❌ Lỗi load combo:", err);
        }
    }

    /* ================= EVENT COMBO ================= */

    function bindComboEvents() {
        document.querySelectorAll(".combo-item").forEach(item => {
            const plus = item.querySelector(".combo-plus");
            const minus = item.querySelector(".combo-minus");
            const qtyEl = item.querySelector(".combo-count");
            if (!plus || !minus || !qtyEl) return;

            const name = item.querySelector(".combo-name").innerText;
            const price = parseInt(item.dataset.price);
            let qty = 0;

            plus.onclick = () => {
                qty++;
                qtyEl.innerText = qty;
                comboTotal += price;
                updateComboList(name, price, qty);
                updateTotal();
            };

            minus.onclick = () => {
                if (qty > 0) {
                    qty--;
                    qtyEl.innerText = qty;
                    comboTotal -= price;
                    updateComboList(name, price, qty);
                    updateTotal();
                }
            };
        });
    }

    function updateComboList(name, price, qty) {
        const index = comboList.findIndex(c => c.name === name);
        if (qty === 0) {
            if (index !== -1) comboList.splice(index, 1);
        } else {
            if (index !== -1) { comboList[index].qty = qty; }
            else { comboList.push({ name, price, qty }); }
        }
    }

    function updateTotal() {
        const total = seatPrice + comboTotal;
        if (totalEl) totalEl.innerText = formatPrice(total);
    }

    /* ================= LOAD SHOWTIME ================= */

    async function loadShowtimeInfo() {
        if (!SHOWTIME_ID) return;
        try {
            const res = await fetch(`${window.APP_CONFIG.API_BASE}/booking/showtimes/${SHOWTIME_ID}`);
            const data = await res.json();
            const movieName = data.movie_name || "";
            const info = `${data.cinema_name || ""} • ${data.room_name || ""} • ${data.show_time || ""}`;
            
            if (movieNameEl) movieNameEl.innerText = movieName;
            if (cinemaInfoEl) cinemaInfoEl.innerText = info;
            if (movieNameFooterEl) movieNameFooterEl.innerText = movieName;
            if (cinemaInfoFooterEl) cinemaInfoFooterEl.innerText = info;

            if (posterEl && data.poster) {
                // FIX: data.poster đã chứa "uploads/posters/" từ DB
                const root = window.APP_CONFIG.API_BASE.replace('/api', '');
                const posterUrl = data.poster.startsWith('http') ? data.poster : `${root}/${data.poster}`;
                
                posterEl.src = posterUrl;
                posterEl.onerror = () => {
                    posterEl.src = "https://placehold.co/300x450/0b0f19/e50914?text=No+Poster";
                };
            }
        } catch (err) {
            console.error("Lỗi showtime:", err);
        }
    }

});
