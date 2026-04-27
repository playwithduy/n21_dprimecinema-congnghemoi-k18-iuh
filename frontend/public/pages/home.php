<section class="movie-ads" id="movieAds">
  <div class="ads-track" id="ads-movie-list"></div>
</section>

<section class="trailer-cinema">

  <!-- FILM STRIP LEFT -->
  <div class="film-strip-left">
    <div class="film-perf"></div><div class="film-perf"></div>
    <div class="film-perf"></div><div class="film-perf"></div>
    <div class="film-perf"></div><div class="film-perf"></div>
    <div class="film-perf"></div><div class="film-perf"></div>
    <div class="film-perf"></div><div class="film-perf"></div>
  </div>

  <!-- FILM STRIP RIGHT -->
  <div class="film-strip-right">
    <div class="film-perf"></div><div class="film-perf"></div>
    <div class="film-perf"></div><div class="film-perf"></div>
    <div class="film-perf"></div><div class="film-perf"></div>
    <div class="film-perf"></div><div class="film-perf"></div>
    <div class="film-perf"></div><div class="film-perf"></div>
  </div>

  <div class="trailer-wrapper">
    <button class="trailer-nav" id="prevBtn">&#8592;</button>

    <div class="trailer-screen">
      <iframe
        id="trailer-frame"
        src=""
        title="Trailer phim"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen>
      </iframe>
    </div>

    <button class="trailer-nav" id="nextBtn">&#8594;</button>
  </div>

  <div class="trailer-dots" id="trailer-dots"></div>

</section>

<!-- ============================================================ -->
<!-- KHU VỰC PHIM ĐANG CHIẾU & SẮP CHIẾU (FULL WIDTH) -->
<!-- ============================================================ -->
<section class="movie-lists-section" style="margin-top: 30px;">

  <!-- PHIM ĐANG CHIẾU -->
  <div class="movie-section">
    <div class="section-heading">
      <span class="section-line"></span>
      <h3 data-i18n="now_showing">PHIM ĐANG CHIẾU</h3>
      <span class="section-line"></span>
    </div>
    
    <div class="movie-slider-container">
      <button class="slider-nav prev-movie-btn" id="prevNowBtn"><i class="fa-solid fa-chevron-left"></i></button>
      <div class="movie-track-wrapper">
        <div class="movie-track" id="now-showing-list">
          <div class="skeleton sk-card"></div>
          <div class="skeleton sk-card"></div>
          <div class="skeleton sk-card"></div>
          <div class="skeleton sk-card"></div>
          <div class="skeleton sk-card"></div>
        </div>
      </div>
      <button class="slider-nav next-movie-btn" id="nextNowBtn"><i class="fa-solid fa-chevron-right"></i></button>
    </div>
  </div>

  <!-- PHIM SẮP CHIẾU -->
  <div class="movie-section" style="margin-top: 40px;">
    <div class="section-heading">
      <span class="section-line"></span>
      <h3 data-i18n="coming_soon">PHIM SẮP CHIẾU</h3>
      <span class="section-line"></span>
    </div>
    
    <div class="movie-slider-container">
      <button class="slider-nav prev-movie-btn" id="prevSoonBtn"><i class="fa-solid fa-chevron-left"></i></button>
      <div class="movie-track-wrapper">
        <div class="movie-track coming-soon-grid" id="coming-soon-list">
          <div class="skeleton sk-card"></div>
          <div class="skeleton sk-card"></div>
          <div class="skeleton sk-card"></div>
          <div class="skeleton sk-card"></div>
          <div class="skeleton sk-card"></div>
        </div>
      </div>
      <button class="slider-nav next-movie-btn" id="nextSoonBtn"><i class="fa-solid fa-chevron-right"></i></button>
    </div>
  </div>

</section>

<!-- ============================================================ -->
<!-- EVENT – FULL WIDTH -->
<!-- ============================================================ -->
<section class="event-section container">
  <div class="section-heading">
    <span class="section-line"></span>
    <h3 data-i18n="event_title">EVENT</h3>
    <span class="section-line"></span>
  </div>

  <div class="event-grid">
    <div class="event-card"><img src="./assets/images/event/event1.png"></div>
    <div class="event-card"><img src="./assets/images/event/event2.png"></div>
    <div class="event-card"><img src="./assets/images/event/event3.png"></div>
    <div class="event-card"><img src="./assets/images/event/event4.png"></div>
  </div>
</section>

<script src="./assets/js/home.js?v=<?= time() ?>"></script>
