<div class="page-content">

<div class="booking-wrapper">

    <!-- TOP TITLE -->
    <div class="booking-title">
        BOOKING ONLINE
    </div>

    <!-- INFO BAR -->
    <div class="booking-header">

        <div class="left">
            <h3 id="movie-name">Đang tải phim...</h3>
            <p id="cinema-info">
                Đang tải thông tin suất chiếu...
            </p>
        </div>

        <div class="right">
            <div class="countdown-box">
                <span data-i18n="step_seat">⏳ Giữ ghế:</span>
                <span id="countdown">15:00</span>
            </div>
        </div>

    </div>

    <!-- SCREEN -->
    <div class="screen"></div>

    <!-- SEAT MAP -->
    <div id="seat-map" class="seat-loading">
        <div id="central-zone-overlay"></div>
        <div class="loading-text">Đang tải sơ đồ ghế...</div>
    </div>

    <!-- LEGEND -->
    <div class="legend">
        <div><span class="box green"></span> Thường</div>
        <div><span class="box red"></span> VIP</div>
        <div><span class="box pink"></span> Sweetbox</div>
        <div><span class="box selected"></span> Đã chọn</div>
        <div><span class="box disabled"></span> Đã bán</div>
        <div><span class="box central"></span> Vùng trung tâm</div>
    </div>

    <div class="booking-footer">

    <!-- LEFT: POSTER + INFO -->
    <div class="footer-left">

        <img id="movie-poster" src="" alt="poster">

        <div class="footer-info">
            <div id="movie-name-footer">Tên phim</div>
            <div id="cinema-info-footer">Rạp • Phòng • Giờ</div>
            <div id="countdown-footer"></div>
        </div>

    </div>

    <!-- CENTER: GHẾ + TIỀN -->
    <div class="footer-center">
        <div><span data-i18n="selected_seats">Ghế</span>: <b id="selected-seats">---</b></div>
        <div><span data-i18n="total_money">Tổng tiền</span>: <b id="total-price">0đ</b></div>
    </div>

    <!-- RIGHT: BUTTON -->
    <div class="footer-actions">
        <button class="back" onclick="history.back()"><span data-i18n="btn_back">← Quay lại</span></button>
        <button class="next"><span data-i18n="btn_next">Tiếp tục →</span></button>
    </div>

</div>

</div>
</div>
<script>
let SHOWTIME_ID = <?php 
    $sid = isset($_GET['showtime_id']) ? (int)$_GET['showtime_id'] : 0;
    echo $sid;
?>;

if (!SHOWTIME_ID) {
  const pending = localStorage.getItem('pending_booking');
  if (pending) {
    try {
      const parsed = JSON.parse(pending);
      SHOWTIME_ID = parseInt(parsed.showtime_id) || 0;
    } catch (err) {
      SHOWTIME_ID = 0;
    }
  }
}

// Nếu vẫn không có (phòng trường hợp legacy URL), thử lấy từ URL search params
if (!SHOWTIME_ID) {
    SHOWTIME_ID = parseInt(new URLSearchParams(window.location.search).get('showtime_id') || 0);
}

if (SHOWTIME_ID > 0) {
  localStorage.removeItem('pending_booking');
}
</script>
<script src="./assets/js/booking-seat.js?v=<?php echo time(); ?>"></script>

