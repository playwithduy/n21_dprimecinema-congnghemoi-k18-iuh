<div class="page-content">

<div class="booking-wrapper">

<!-- HEADER -->
<div class="booking-header-wrap">

    <div class="booking-header-title">
        BOOKING COMBO ONLINE
    </div>

    <div class="booking-header-bar">

        <div class="booking-header-left">
            <h3 id="movie-name">Đang tải phim...</h3>
            <p id="cinema-info">Đang tải thông tin suất chiếu...</p>
        </div>

        <div class="booking-header-right">
            <div class="booking-header-countdown">
                <span data-i18n="step_combo">⏳ Giữ combo:</span>
                <span id="countdown">5:00</span>
            </div>
        </div>

    </div>

</div>

<!-- COMBO -->
<div class="combo-section">

    <h2 class="combo-title" data-i18n="step_combo">🍿 Chọn bắp nước</h2>

    <!-- load dynamic -->
    <div class="combo-grid" id="combo-grid"></div>

</div>

<!-- FOOTER -->
<div class="booking-footer-wrap">

    <div class="booking-footer-left">
        <img id="movie-poster" class="booking-footer-poster" src="">
        <div class="booking-footer-info">
            <div id="movie-name-footer">Tên phim</div>
            <div id="cinema-info-footer">Rạp • Phòng • Giờ</div>
            <div id="countdown-footer"></div>
        </div>
    </div>

    <div class="booking-footer-center">
        <div><span data-i18n="selected_seats">Ghế</span>: <b id="selected-seats">---</b></div>
        <div><span data-i18n="total_money">Tổng tiền</span>: <b id="total-price">0đ</b></div>
    </div>

    <div class="booking-footer-actions">
        <button class="booking-footer-back" onclick="history.back()"><span data-i18n="btn_back">← Quay lại</span></button>
        <button class="booking-footer-next"><span data-i18n="btn_next">Tiếp tục →</span></button>
    </div>

</div>

</div>
</div>
<script>
window.SHOWTIME_ID_GLOBAL = <?php echo isset($_GET['showtime_id']) ? (int)$_GET['showtime_id'] : 'parseInt(new URLSearchParams(window.location.search).get(\'showtime_id\') || 0)'; ?>;

if (!window.SHOWTIME_ID_GLOBAL) {
  const pending = localStorage.getItem('pending_booking');
  if (pending) {
    try {
      const parsed = JSON.parse(pending);
      window.SHOWTIME_ID_GLOBAL = parseInt(parsed.showtime_id) || 0;
    } catch (err) {
      window.SHOWTIME_ID_GLOBAL = 0;
    }
  }
}

// Nếu vẫn không có, thử lấy từ URL search params (phòng trường hợp legacy URL)
if (!window.SHOWTIME_ID_GLOBAL) {
    window.SHOWTIME_ID_GLOBAL = parseInt(new URLSearchParams(window.location.search).get('showtime_id') || 0);
}

if (window.SHOWTIME_ID_GLOBAL > 0) {
  localStorage.removeItem('pending_booking');
}
</script>
<script src="./assets/js/booking-combo-v3.js?v=<?php echo time(); ?>"></script>
