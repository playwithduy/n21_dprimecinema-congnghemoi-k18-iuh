<?php /* Page: schedule-today */ ?>

<link rel="stylesheet" href="./assets/css/schedule-today.css">

<section class="sc-page">

  <div class="sc-hero">
    <div class="sc-container">
      <h1 class="sc-title">
        <i class="fa-solid fa-clapperboard"></i> Lịch Chiếu Phim
      </h1>
      <p class="sc-subtitle" id="scheduleDate"></p>
    </div>
  </div>

  <div class="sc-container sc-body">

    <div class="sc-date-wrapper">
      <div class="sc-date-tabs" id="dateTabs"></div>
    </div>

    <div class="sc-branch-section">
      <div class="sc-branch-label">
        <i class="fa-solid fa-location-dot"></i> Chọn chi nhánh
      </div>
      <div class="sc-branch-tabs" id="branchTabs">
        <div class="sc-loading-sm"><span class="sc-spinner"></span> Đang tải...</div>
      </div>
    </div>

    <div class="sc-content" id="scheduleContent">
      <div class="sc-loading">
        <span class="sc-spinner sc-spinner-lg"></span>
        <p>Đang tải lịch chiếu...</p>
      </div>
    </div>

  </div>
</section>

<script src="./assets/js/schedule-today.js"></script>
