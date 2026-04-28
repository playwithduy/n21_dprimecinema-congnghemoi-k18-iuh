document.addEventListener("DOMContentLoaded", () => {

  /* ================= API ================= */

  // KHÔNG dùng :3000 khi chạy ngrok
  const API = window.location.origin + "/api/movies";

  /* ================= BIẾN LƯU DATA ================= */

  let nowMovies = [];
  let soonMovies = [];

  /* ================= TRAILER FROM API ================= */

  let trailers = [];
  let currentTrailer = 0;

  function getYoutubeId(url) {
    if (!url) return "";

    const regExp = /(?:youtube\.com.*v=|youtu\.be\/)([^&]+)/;
    const match = url.match(regExp);

    return match ? match[1] : "";
  }

  function renderDots() {
    const dots = document.getElementById("trailer-dots");
    if (!dots) return;

    dots.innerHTML = "";

    trailers.forEach((_, index) => {
      const dot = document.createElement("span");
      dot.className =
        "trailer-dot" + (index === currentTrailer ? " active" : "");

      dot.onclick = () => {
        currentTrailer = index;
        updateTrailer();
      };

      dots.appendChild(dot);
    });
  }

  function updateTrailer() {
    const frame = document.getElementById("trailer-frame");

    if (!frame || trailers.length === 0) return;

    frame.src = `https://www.youtube.com/embed/${trailers[currentTrailer].id}`;

    renderDots();
  }

  /* ================= LOAD TRAILER ================= */

  fetch(`${API}/now-showing`)
    .then(res => res.json())
    .then(movies => {

      trailers = movies
        .filter(m => m.trailer_url)
        .map(m => ({
          id: getYoutubeId(m.trailer_url),
          title: m.title
        }))
        .filter(t => t.id);

      if (trailers.length > 0) {
        updateTrailer();
      }

    })
    .catch(err => console.error("TRAILER ERROR:", err));

  /* ================= BUTTON ================= */

  document.getElementById("nextBtn")?.addEventListener("click", () => {
    currentTrailer = (currentTrailer + 1) % trailers.length;
    updateTrailer();
  });

  document.getElementById("prevBtn")?.addEventListener("click", () => {
    currentTrailer =
      (currentTrailer - 1 + trailers.length) % trailers.length;

    updateTrailer();
  });

  /* ================= HELPER ================= */

  function getMockCategory(id) {
    const cats = [
      "Hành Động, Phiêu Lưu",
      "Kinh Dị, Giật Gân",
      "Tâm Lý, Tình Cảm",
      "Hài, Gia Đình",
      "Khoa Học Viễn Tưởng"
    ];

    return cats[id % cats.length];
  }

  function getMockTag(id) {

    if (id % 3 === 0) {
      return `
        <div class="tag-special">
          <i class="fa-solid fa-video"></i>
          SNEAKSHOW
        </div>
      `;
    }

    if (id % 4 === 0) {
      return `
        <div class="tag-special pre-order">
          <i class="fa-solid fa-ticket"></i>
          ĐẶT TRƯỚC
        </div>
      `;
    }

    if (id % 5 === 0) {
      return `<div class="tag-special hot">HOT</div>`;
    }

    return "";
  }

  /* ================= RENDER MOVIE ================= */

  function renderMovieTrack(movies, elementId) {

    const box = document.getElementById(elementId);

    if (!box) return;

    box.innerHTML = "";

    box.style.overflowX = "auto";
    box.style.scrollbarWidth = "none";
    box.style.scrollBehavior = "smooth";

    movies.forEach((m, index) => {

      const link = window.encodeLink("movie", m.slug);

      const mockCat = getMockCategory(m.id || index);
      const mockTag = getMockTag(m.id || index);

      let ageClass = "age-13";

      const ageString = String(
        m.age_limit || "T13"
      ).toUpperCase();

      if (ageString.includes("18") || ageString.includes("T18")) {
        ageClass = "age-18";
      } else if (
        ageString.includes("16") ||
        ageString.includes("T16")
      ) {
        ageClass = "age-16";
      }

      const releaseDate = m.release_date
        ? new Date(m.release_date).toLocaleDateString("vi-VN")
        : t("Đang cập nhật");

      const subtext =
        elementId === "now-showing-list"
          ? mockCat
          : `${t("movie_release")}: ${releaseDate}`;

      const rankNum =
        elementId === "now-showing-list"
          ? `<div class="movie-rank-num">${index + 1}</div>`
          : `<div class="movie-coming-soon-tag">Coming Soon</div>`;

      const ratingValue = (
        m.rating ||
        m.avg_rating ||
        0
      ).toFixed(1);

      const showRating =
        elementId === "now-showing-list" || ratingValue > 0
          ? `
            <div class="movie-rating">
              <i class="fa-solid fa-star"></i>
              ${ratingValue}
            </div>
          `
          : "";

      box.innerHTML += `
        <a href="${link}" class="movie-card">

          <div class="movie-poster-wrap">

            <img
              src="${getAssetUrl(m.poster)}"
              alt="${getMovieTitle(m)}"
              loading="lazy"
            >

            <div class="play-overlay">
              <i class="fa-solid fa-play"></i>
            </div>

            <div class="movie-tags">

              <div class="tag-age ${ageClass}">
                ${m.age_limit || "T13"}
              </div>

              ${mockTag}

            </div>

          </div>

          ${rankNum}

          <div class="movie-info">

            <div
              class="movie-title"
              data-movie-title="${m.title}"
              data-movie-original="${m.original_title || m.title}"
            >
              ${getMovieTitle(m)}
            </div>

            <div class="movie-meta">
              ${subtext}
            </div>

            ${showRating}

          </div>

        </a>
      `;
    });
  }

  /* ================= SLIDER NAV ================= */

  function initSliderNav(trackId, prevBtnId, nextBtnId) {

    const track = document.getElementById(trackId);
    const prevBtn = document.getElementById(prevBtnId);
    const nextBtn = document.getElementById(nextBtnId);

    if (!track || !prevBtn || !nextBtn) return;

    function updateButtons() {

      if (track.scrollLeft <= 5) {
        prevBtn.style.display = "none";
      } else {
        prevBtn.style.display = "flex";
      }

      if (
        track.scrollLeft + track.clientWidth >=
        track.scrollWidth - 5
      ) {
        nextBtn.style.display = "none";
      } else {
        nextBtn.style.display = "flex";
      }
    }

    setTimeout(updateButtons, 150);

    track.addEventListener("scroll", updateButtons);

    prevBtn.addEventListener("click", () => {
      track.scrollBy({
        left: -track.clientWidth * 0.6,
        behavior: "smooth"
      });
    });

    nextBtn.addEventListener("click", () => {
      track.scrollBy({
        left: track.clientWidth * 0.6,
        behavior: "smooth"
      });
    });
  }

  /* ================= NOW SHOWING ================= */

  fetch(`${API}/now-showing`)
    .then(res => res.json())
    .then(movies => {

      nowMovies = movies;

      renderMovieTrack(
        nowMovies,
        "now-showing-list"
      );

      initSliderNav(
        "now-showing-list",
        "prevNowBtn",
        "nextNowBtn"
      );

    })
    .catch(err =>
      console.error("NOW SHOWING ERROR:", err)
    );

  /* ================= COMING SOON ================= */

  fetch(`${API}/coming-soon`)
    .then(res => res.json())
    .then(movies => {

      soonMovies = movies;

      renderMovieTrack(
        soonMovies,
        "coming-soon-list"
      );

      initSliderNav(
        "coming-soon-list",
        "prevSoonBtn",
        "nextSoonBtn"
      );

    })
    .catch(err =>
      console.error("COMING SOON ERROR:", err)
    );

  /* ================= ADS ================= */

  function renderAdsBar(movies) {

    const box = document.getElementById("ads-movie-list");

    if (!box) return;

    let html = "";

    movies.forEach(m => {

      const link = window.encodeLink(
        "movie",
        m.slug
      );

      html += `
        <a href="${link}" class="ads-item">

          <img
            src="${m.poster.startsWith("http")
          ? m.poster
          : window.location.origin + m.poster
        }"
            alt="${getMovieTitle(m)}"
            loading="lazy"
          >

          <span class="ads-tag">HOT</span>

          <span
            data-movie-title="${m.title}"
            data-movie-original="${m.original_title || m.title}"
          >
            ${getMovieTitle(m)}
          </span>

        </a>
      `;
    });

    box.innerHTML = html + html;
  }

  fetch(`${API}/now-showing`)
    .then(res => res.json())
    .then(movies => {
      renderAdsBar(movies);
    })
    .catch(err =>
      console.error("ADS ERROR:", err)
    );

  /* ================= LANG CHANGE ================= */

  window.addEventListener("langChanged", () => {

    renderMovieTrack(
      nowMovies,
      "now-showing-list"
    );

    renderMovieTrack(
      soonMovies,
      "coming-soon-list"
    );

    fetch(`${API}/now-showing`)
      .then(res => res.json())
      .then(movies => renderAdsBar(movies));
  });

});