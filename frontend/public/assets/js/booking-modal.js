
var BOOKING_API = window.location.protocol + "//" + window.location.hostname + ":3000/api/showtimes";

console.log("booking-modal.js LOADED");

let CURRENT_MOVIE_ID = null;

/* ================== TIME VIETNAM ================== */
function getTodayVN() {
  const now = new Date();
  const vn = new Date(
    now.toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" })
  );
  vn.setHours(0, 0, 0, 0);
  return vn;
}

function getCurrentTimeVN() {
  return new Date(
    new Date().toLocaleString("en-US", {
      timeZone: "Asia/Ho_Chi_Minh"
    })
  );
}

/* ================== GENERATE 7 DAYS ================== */
function generateRolling7Days() {
  const today = getTodayVN();
  const days = [];

  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);

    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");

    days.push(`${yyyy}-${mm}-${dd}`);
  }

  return days;
}

/* ================== FORMAT DATE ================== */
function formatDateVN(dateStr) {
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}`;
}

/* ================== RENDER DATE LIST ================== */
async function renderDates(movieId) {
  const dateList = document.getElementById("dateList");
  const content = document.getElementById("bookingContent");
  if (!dateList || !content) return;

  dateList.innerHTML = `⏳ ${t('Đang tải...')}`;
  content.innerHTML = "";

  try {
    const res = await fetch(`${BOOKING_API}/movie/${movieId}`);

    if (!res.ok) throw new Error("API lỗi");

    const data = await res.json();
    console.log("🎬 SHOWTIME DATA:", data);

    // ❌ FIX crash nếu API sai format
    if (!data || !data.dates) {
      throw new Error("Sai format dữ liệu");
    }

    const showtimeMap = {};
    data.dates.forEach(d => {
      showtimeMap[d.date] = d;
    });

    const rollingDays = generateRolling7Days();
    dateList.innerHTML = "";

    let anyShowtime = data.dates.some(d => d.cities.length > 0);

    if (!anyShowtime) {
      content.innerHTML = `<p>⚠️ ${t('Không có suất chiếu') || 'Không có suất chiếu'}</p>`;
      return;
    }

    rollingDays.forEach((dateStr) => {
      const btn = document.createElement("button");
      btn.className = "date-btn";
      btn.innerText = formatDateVN(dateStr);

      btn.onclick = () => {
        document
          .querySelectorAll(".date-btn")
          .forEach(b => b.classList.remove("active"));

        btn.classList.add("active");

        if (showtimeMap[dateStr]) {
          renderShowtimes(showtimeMap[dateStr]);
        } else {
          content.innerHTML =
            "<p>⚠️ Chưa có suất chiếu cho ngày này</p>";
        }
      };

      dateList.appendChild(btn);
    });

    // ✅ AUTO chọn ngày đầu có suất
    const firstAvailable = rollingDays.find(d => showtimeMap[d]);
    if (firstAvailable) {
      const firstBtn = Array.from(dateList.children).find(
        b => b.innerText === formatDateVN(firstAvailable)
      );
      firstBtn?.click();
    }

  } catch (err) {
    console.error("❌ FETCH ERROR:", err);
    dateList.innerHTML = "❌ Lỗi tải lịch chiếu";
  }
}

/* ================== CHECK PAST TIME ================== */
function isPastTime(dateStr, timeStr) {
  const now = getCurrentTimeVN();
  const showDateTime = new Date(`${dateStr} ${timeStr} GMT+0700`);
  return showDateTime < now;
}

/* ================== RENDER SHOWTIMES ================== */
function renderShowtimes(day) {
  const content = document.getElementById("bookingContent");

  if (!day || !day.cities || day.cities.length === 0) {
    content.innerHTML = "<p>Không có suất chiếu</p>";
    return;
  }

  let html = `<h3 class="show-date">📅 ${day.date}</h3>`;
  let hasAnyTime = false;

  day.cities.forEach(city => {
    html += `<h4 class="city-name">${city.name}</h4>`;

    city.cinemas.forEach(cinema => {
      html += `
        <div class="cinema-name-row">
            <div class="dp-logo">D</div>
            <div class="dp-info">
                <h5>${cinema.name}</h5>
                <p>Địa chỉ đang cập nhật</p>
            </div>
        </div>
      `;

      cinema.formats.forEach(f => {
        const mappedTimes = f.times.map(t => {
          const isPast = isPastTime(day.date, t.time);
          return { ...t, isPast };
        });

        if (mappedTimes.length === 0) return;

        if (mappedTimes.some(t => !t.isPast)) hasAnyTime = true;

        html += `
          <div class="format-block">
            <b>${f.name} – ${f.language}</b>
            <div class="time-list">
              ${mappedTimes.map(t => `
                <button 
                  class="time-btn ${t.isPast ? 'disabled' : ''}" 
                  data-showtime="${t.id}"
                  ${t.isPast ? 'disabled' : ''}>
                  ${t.time} ${t.isPast ? `(${t('Đã qua') || 'Đã qua'})` : ''}
                </button>
              `).join("")}
            </div>
          </div>
        `;
      });
    });
  });

  if (!hasAnyTime) {
    html += "<p>⚠️ Tất cả suất đã qua. Chọn ngày khác.</p>";
  }

  content.innerHTML = html;
}

/* ================== MODAL ================== */
window.openBookingModal = function (movieId) {
  CURRENT_MOVIE_ID = movieId;
  document.getElementById("bookingModal").style.display = "flex";
  renderDates(movieId);
};

window.closeBookingModal = function () {
  document.getElementById("bookingModal").style.display = "none";
};

/* ================== EVENTS ================== */
document.addEventListener("click", e => {

  const buyBtn = e.target.closest(".btn-buy");
  if (buyBtn) openBookingModal(buyBtn.dataset.id);

  if (
    e.target.classList.contains("close-booking") ||
    e.target.id === "bookingModal"
  ) {
    closeBookingModal();
  }

  const timeBtn = e.target.closest(".time-btn");

  if (timeBtn && !timeBtn.classList.contains("disabled")) {

    const showtimeId = timeBtn.dataset.showtime;

    localStorage.setItem(
      "pending_booking",
      JSON.stringify({ showtime_id: showtimeId })
    );

    const BASE_URL =
      window.location.origin + "/index.php";

    if (localStorage.getItem("token")) {
      window.location.href = window.encodeLink("booking-seat", "selection", { showtime_id: showtimeId });
    } else {
      window.location.href = window.encodeLink("login", "auth", { redirect: "booking-seat", showtime_id: showtimeId });
    }

  }
});
