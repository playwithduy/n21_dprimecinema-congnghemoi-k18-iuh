<?php
// shop.php
?>
<link rel="stylesheet" href="assets/css/shop.css?v=<?php echo time(); ?>">

<div class="shop-container">
    <div class="shop-header">
        <div class="container">
            <h1>D-PRIME <span class="highlight">SHOP ĐIỂM THƯỞNG</span></h1>
            <p>Tích lũy D-Points, đổi ngàn quà tặng hấp dẫn từ D-Prime Cinema.</p>
            
            <div class="user-points-card">
                <div class="points-info">
                    <span class="label">SỐ ĐIỂM HIỆN CÓ</span>
                    <div class="points-value">
                        <i class="fa-solid fa-coins"></i>
                        <span id="shop-user-points">0</span> <small>P</small>
                    </div>
                </div>
                <div class="user-info-mini">
                    <span id="shop-user-name">Đang tải...</span>
                    <span id="shop-user-rank" class="badge">---</span>
                </div>
            </div>
        </div>
    </div>

    <div class="container">
        <div class="shop-filters">
            <button class="filter-btn active" data-category="all">Tất cả</button>
            <button class="filter-btn" data-category="voucher">Voucher</button>
            <button class="filter-btn" data-category="combo">Bắp nước</button>
            <button class="filter-btn" data-category="merch">Quà tặng</button>
            <button class="filter-btn" data-category="ticket">Vé xem phim</button>
        </div>

        <div class="shop-grid" id="shop-items-container">
            <!-- Items will be rendered by JS -->
            <div class="loading-shop">
                <i class="fa-solid fa-circle-notch fa-spin"></i>
                <p>Đang tải gian hàng...</p>
            </div>
        </div>
    </div>
</div>

<!-- Exchange Confirmation Modal -->
<div id="exchange-modal" class="modal">
    <div class="modal-content">
        <div class="modal-header">
            <h3 id="modal-title">XÁC NHẬN ĐỔI QUÀ</h3>
            <span class="close-modal">&times;</span>
        </div>
        <div class="modal-body" id="exchange-modal-body">
            <!-- Content will be rendered by shop.js steps -->
        </div>
        <div class="modal-footer">
            <button class="btn-cancel">HỦY BỎ</button>
            <button class="btn-confirm" id="btn-confirm-exchange">TIẾP TỤC</button>
        </div>
    </div>
</div>

<script src="assets/js/shop.js?v=<?php echo time(); ?>"></script>
