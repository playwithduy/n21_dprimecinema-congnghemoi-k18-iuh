(() => {
  const API_BASE    = window.location.origin + "/api";
  const API_CINEMAS = `${API_BASE}/showtimes/cinemas`;
  const API_BY_DATE = (date) => `${API_BASE}/showtimes/by-date?date=${date}`;
  const MOVIE_BASE  = window.location.origin;

  let allRows        = [];
  let cinemaList     = [];
  let selectedBranch = "all";
  let selectedDate   = todayStr();

  document.addEventListener("DOMContentLoaded", () => {
    buildDateTabs();
    setSubtitle();
    loadAll();
  });

  function todayStr() {
    const d = new Date();
    return [
      d.getFullYear(),
      String(d.getMonth() + 1).padStart(2, "0"),
      String(d.getDate()).padStart(2, "0")
    ].join("-");
  }

  function dateToStr(d) {
    return [
      d.getFullYear(),
      String(d.getMonth() + 1).padStart(2, "0"),
      String(d.getDate()).padStart(2, "0")
    ].join("-");
  }

  function addDaysFrom(base, n) {
    const d = new Date(base + "T00:00:00");
    d.setDate(d.getDate() + n);
    return d;
  }

  function viDay(d) { return ["CN","T2","T3","T4","T5","T6","T7"][d.getDay()]; }

  function ddmm(s) {
    const d = new Date(s + "T00:00:00");
    return `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}`;
  }

  function setSubtitle() {
    const el = document.getElementById("scheduleDate");
    if (!el) return;
    const d = new Date(selectedDate + "T00:00:00");
    el.textContent = d.toLocaleDateString("vi-VN", { weekday:"long", year:"numeric", month:"long", day:"numeric" });
  }

  /* DATE TABS */
  function buildDateTabs() {
    const wrap = document.getElementById("dateTabs");
    if (!wrap) return;
    wrap.innerHTML = "";
    const base = todayStr();
    for (let i = 0; i < 7; i++) {
      const d   = addDaysFrom(base, i);
      const str = dateToStr(d);
      const tab = document.createElement("div");
      tab.className = "sc-date-tab" + (str === selectedDate ? " active" : "");
      tab.dataset.date = str;
      const badge = i === 0 ? `<span class="sc-dt-label">Hôm nay</span>`
                  : i === 1 ? `<span class="sc-dt-label">Ngày mai</span>` : "";
      tab.innerHTML = `<span class="sc-dt-day">${viDay(d)}</span>
                       <span class="sc-dt-date">${ddmm(str)}</span>${badge}`;
      tab.addEventListener("click", () => onDateSelect(str));
      wrap.appendChild(tab);
    }
  }

  function onDateSelect(str) {
    selectedDate = str;
    document.querySelectorAll(".sc-date-tab").forEach(t => t.classList.toggle("active", t.dataset.date === str));
    setSubtitle();
    loadSchedule();
  }

  /* LOAD */
  async function loadAll() { await Promise.all([loadCinemas(), loadSchedule()]); }

  async function loadCinemas() {
    try {
      const res = await fetch(API_CINEMAS);
      if (!res.ok) throw new Error(res.status);
      cinemaList = await res.json();
      buildBranchTabs();
    } catch (e) {
      console.warn("Không tải cinemas:", e);
      cinemaList = [];
      buildBranchTabs();
    }
  }

  async function loadSchedule() {
    const el = document.getElementById("scheduleContent");
    if (el) el.innerHTML = `<div class="sc-loading"><span class="sc-spinner sc-spinner-lg"></span><p>Đang tải lịch chiếu...</p></div>`;
    try {
      const res = await fetch(API_BY_DATE(selectedDate));
      if (!res.ok) throw new Error(res.status);
      allRows = await res.json();
      if (cinemaList.length === 0 && allRows.length > 0) buildCinemasFromRows();
      renderSchedule();
    } catch (e) {
      console.error("Lỗi tải lịch chiếu:", e);
      if (el) el.innerHTML = `<div class="sc-empty">
        <i class="fa-solid fa-triangle-exclamation"></i>
        <p>Không thể tải lịch chiếu. Vui lòng thử lại.</p></div>`;
    }
  }

  function buildCinemasFromRows() {
    const seen = new Map();
    allRows.forEach(r => {
      if (!seen.has(r.cinema_id)) seen.set(r.cinema_id, { id: r.cinema_id, name: r.cinema_name, address: r.cinema_address || "" });
    });
    cinemaList = [...seen.values()];
    buildBranchTabs();
  }

  /* BRANCH TABS */
  function buildBranchTabs() {
    const wrap = document.getElementById("branchTabs");
    if (!wrap) return;
    wrap.innerHTML = "";
    wrap.appendChild(makeTab("all", "⭐ Tất cả chi nhánh", selectedBranch === "all", true));
    cinemaList.forEach(c => {
      const short = c.name.replace(/D\s*Prime\s*Cinema\s*/i, "").trim() || c.name;
      wrap.appendChild(makeTab(String(c.id), short, selectedBranch === String(c.id), false));
    });
  }

  function makeTab(id, label, active, isAll) {
    const tab = document.createElement("div");
    tab.className = `sc-branch-tab${isAll ? " sc-all-tab" : ""}${active ? " active" : ""}`;
    tab.dataset.id = id;
    tab.textContent = label;
    tab.addEventListener("click", () => onBranchSelect(id));
    return tab;
  }

  function onBranchSelect(id) {
    selectedBranch = id;
    document.querySelectorAll(".sc-branch-tab").forEach(t => t.classList.toggle("active", t.dataset.id === id));
    renderSchedule();
  }

  /* RENDER */
  function renderSchedule() {
    const el = document.getElementById("scheduleContent");
    if (!el) return;

    let rows = selectedBranch === "all" ? allRows : allRows.filter(r => String(r.cinema_id) === selectedBranch);

    if (rows.length === 0) {
      el.innerHTML = `<div class="sc-empty"><i class="fa-solid fa-film"></i><p>Không có lịch chiếu nào cho ngày này.</p></div>`;
      return;
    }

    const cinemaMap = new Map();
    rows.forEach(r => {
      if (!cinemaMap.has(r.cinema_id)) cinemaMap.set(r.cinema_id, {
        id: r.cinema_id, name: r.cinema_name, address: r.cinema_address || "", movies: new Map()
      });
      const cinema = cinemaMap.get(r.cinema_id);
      if (!cinema.movies.has(r.movie_id)) cinema.movies.set(r.movie_id, {
        id: r.movie_id, name: r.movie_name, poster: r.poster || "",
        duration: r.duration || "", ageLimit: r.age_limit || "", genre: r.genre || "",
        formats: new Map()
      });
      const movie = cinema.movies.get(r.movie_id);
      const fKey = `${r.format_name}__${r.language}`;
      if (!movie.formats.has(fKey)) movie.formats.set(fKey, {
        format: r.format_name || "", language: r.language || "", room: r.room_name || "", times: []
      });
      movie.formats.get(fKey).times.push({ id: r.showtime_id, time: r.show_time });
    });

    el.innerHTML = "";
    let delay = 0;
    cinemaMap.forEach(cinema => el.appendChild(buildCinemaBlock(cinema, delay++)));
  }

  function buildCinemaBlock(cinema, delay) {
    const block = document.createElement("div");
    block.className = "sc-cinema-group";
    block.style.animationDelay = `${delay * 70}ms`;
    const short = cinema.name.replace(/D\s*Prime\s*Cinema\s*/i, "").trim() || cinema.name;
    block.innerHTML = `
      <div class="sc-cinema-header">
        <div class="sc-cinema-icon"><i class="fa-solid fa-building"></i></div>
        <div>
          <div class="sc-cinema-name">D PRIME CINEMA · ${short}</div>
          ${cinema.address ? `<div class="sc-cinema-address"><i class="fa-solid fa-map-pin"></i> ${cinema.address}</div>` : ""}
        </div>
      </div>`;
    cinema.movies.forEach(movie => block.appendChild(buildMovieRow(movie)));
    return block;
  }

  function buildMovieRow(movie) {
    const row = document.createElement("div");
    row.className = "sc-movie-row";

    const posterSrc = movie.poster
      ? (movie.poster.startsWith("http") ? movie.poster : `${MOVIE_BASE}/${movie.poster}`)
      : "";

    const poster = posterSrc
      ? `<img class="sc-poster" src="${posterSrc}" alt="${movie.name}"
              onerror="this.outerHTML='<div class=\\'sc-poster-placeholder\\'><i class=\\'fa-solid fa-film\\'></i></div>'">`
      : `<div class="sc-poster-placeholder"><i class="fa-solid fa-film"></i></div>`;

    const badges = [
      movie.ageLimit ? `<span class="sc-age">${movie.ageLimit}</span>` : "",
      movie.duration ? `<span class="sc-tag sc-tag-dur"><i class="fa-regular fa-clock"></i> ${movie.duration} phút</span>` : "",
      movie.genre    ? `<span class="sc-tag sc-tag-genre">${movie.genre}</span>` : ""
    ].join("");

    let formatsHtml = "";
    movie.formats.forEach(fmt => {
      const now = new Date();
      const timesHtml = [...fmt.times]
        .sort((a,b) => a.time.localeCompare(b.time))
        .map(t => {
          const past = selectedDate === todayStr() && isTimePast(t.time, now);
          return `<button class="sc-time-btn${past ? " past" : ""}" onclick="goBook(${t.id})">${t.time}</button>`;
        }).join("");

      formatsHtml += `
        <div class="sc-format-row">
          <div class="sc-format-tags">
            ${fmt.format   ? `<span class="sc-tag sc-tag-format">${fmt.format}</span>` : ""}
            ${fmt.language ? `<span class="sc-tag sc-tag-lang">${fmt.language}</span>` : ""}
            ${fmt.room     ? `<span class="sc-tag sc-tag-room"><i class="fa-solid fa-door-open"></i> ${fmt.room}</span>` : ""}
          </div>
          <div class="sc-showtimes">${timesHtml}</div>
        </div>`;
    });

    row.innerHTML = `${poster}
      <div class="sc-movie-info">
        <div class="sc-movie-name">${movie.name}</div>
        <div class="sc-movie-meta">${badges}</div>
        ${formatsHtml}
      </div>`;
    return row;
  }

  function isTimePast(timeStr, now) {
    const [h, m] = timeStr.split(":").map(Number);
    const t = new Date(now); t.setHours(h, m, 0, 0);
    return t < now;
  }

  function goBook(showtimeId) {
    if (typeof openBookingModal === "function") { openBookingModal(showtimeId); return; }
    window.location.href = `index.php?p=Ym9va2luZy1tb2RhbA==&showtime_id=${showtimeId}`;
  }

  window.goBook = goBook;
})();
