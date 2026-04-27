<div class="movies-page container">

  <!-- TABS -->
  <div class="movies-tabs">
    <button class="tab-btn active" data-tab="now" data-i18n="tab_now">Đang chiếu</button>
    <button class="tab-btn" data-tab="soon" data-i18n="tab_soon">Sắp chiếu</button>
  </div>

  <!-- GRID ĐANG CHIẾU -->
  <div class="movies-grid" id="tab-now">
    <div class="movies-grid-inner" id="now-list"></div>
    <button class="movies-load-more" id="more-now-page" data-i18n="load_more">Xem thêm</button>
  </div>

  <!-- GRID SẮP CHIẾU -->
  <div class="movies-grid" id="tab-soon" style="display:none">
    <div class="movies-grid-inner" id="soon-list"></div>
    <button class="movies-load-more" id="more-soon-page" data-i18n="load_more">Xem thêm</button>
  </div>

</div>

<!-- BOOKING MODAL -->
<script>
const API_MOVIES = "http://127.0.0.1:3000/api/movies";

let nowData = [], soonData = [];
let nowLimitPage = 12, soonLimitPage = 12;

/* ===== RENDER ===== */
function renderNow() {
  const box = document.getElementById("now-list");
  if (!box) return;
  box.innerHTML = "";
  nowData.slice(0, nowLimitPage).forEach(m => {
    const link = window.encodeLink("movie", m.slug);
    box.innerHTML += `
      <div class="mv-card">
        <a href="${link}" class="mv-card-poster">
          <img src="${getAssetUrl(m.poster)}" alt="${getMovieTitle(m)}">
          <div class="mv-card-overlay">
            <span class="mv-age">${m.age_limit || 'P'}</span>
          </div>
        </a>
        <div class="mv-card-info">
          <div class="mv-card-title">${getMovieTitle(m)}</div>
          <div class="mv-card-meta">⭐ ${m.rating || 0} • ${m.duration} ${t('movie_duration')}</div>
        </div>
        <div class="mv-card-actions">
          <a href="${link}" class="mv-btn-detail">${t('btn_detail')}</a>
          <button class="mv-btn-buy btn-buy" data-id="${m.id}">${t('btn_buy')}</button>
        </div>
      </div>`;
  });
  document.getElementById("more-now-page").style.display =
    nowData.length > nowLimitPage ? "block" : "none";
}

function renderSoon() {
  const box = document.getElementById("soon-list");
  if (!box) return;
  box.innerHTML = "";
  soonData.slice(0, soonLimitPage).forEach(m => {
    const link = window.encodeLink("movie", m.slug);
    box.innerHTML += `
      <div class="mv-card">
        <a href="${link}" class="mv-card-poster">
          <img src="${getAssetUrl(m.poster)}" alt="${getMovieTitle(m)}">
          <div class="mv-card-overlay">
            <span class="mv-badge-soon" data-i18n="tab_soon">${t('tab_soon')}</span>
          </div>
        </a>
        <div class="mv-card-info">
          <div class="mv-card-title">${getMovieTitle(m)}</div>
          <div class="mv-card-meta">📅 ${t('movie_release')}: ${new Date(m.release_date).toLocaleDateString('vi-VN')}</div>
        </div>
        <div class="mv-card-actions">
          <a href="${link}" class="mv-btn-detail">${t('btn_detail')}</a>
        </div>
      </div>`;
  });
  document.getElementById("more-soon-page").style.display =
    soonData.length > soonLimitPage ? "block" : "none";
}

/* ===== LOAD ===== */
fetch(`${API_MOVIES}/now-showing`)
  .then(r => r.json())
  .then(d => { nowData = d; renderNow(); });

fetch(`${API_MOVIES}/coming-soon`)
  .then(r => r.json())
  .then(d => { soonData = d; renderSoon(); });

/* ===== TABS ===== */
document.querySelectorAll(".tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    const tab = btn.dataset.tab;
    document.getElementById("tab-now").style.display  = tab === "now"  ? "" : "none";
    document.getElementById("tab-soon").style.display = tab === "soon" ? "" : "none";
  });
});

/* ===== XEM THÊM ===== */
document.getElementById("more-now-page").addEventListener("click", () => {
  nowLimitPage += 12; renderNow();
});
document.getElementById("more-soon-page").addEventListener("click", () => {
  soonLimitPage += 12; renderSoon();
});

/* ===== LANG CHANGE RE-RENDER ===== */
window.addEventListener("langChanged", () => {
    renderNow();
    renderSoon();
});
</script>
