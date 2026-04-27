<section class="news-offers-page">
    <div class="news-container">
        
        <!-- HEADER -->
        <header class="news-header">
            <h1>TIN MỚI & ƯU ĐÃI</h1>
            <p>Khám phá khuyến mãi hấp dẫn và những thông tin mới nhất từ D Prime Cinema</p>
        </header>

        <!-- TABS -->
        <div class="news-tabs">
            <button class="tab-btn active" data-category="Tin tức">
                <i class="fa-solid fa-newspaper"></i>
                Tin mới
            </button>
            <button class="tab-btn" data-category="Khuyến mãi">
                <i class="fa-solid fa-gift"></i>
                Ưu đãi & Coupon
            </button>
        </div>

        <!-- SEARCH / FILTER (Optional) -->
        <!-- <div class="news-filter">
             <input type="text" id="news-search" placeholder="Tìm kiếm ưu đãi...">
        </div> -->

        <!-- CONTENT GRID -->
        <div id="news-grid" class="news-grid">
            <!-- JS RENDERS CARDS HERE -->
            <div class="loader-container">
                <div class="spinner"></div>
            </div>
        </div>

    </div>
</section>

<!-- SCRIPTS -->
<script src="./assets/js/news-offers.js?v=<?php echo time(); ?>"></script>
