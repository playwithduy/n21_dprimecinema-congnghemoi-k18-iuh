<?php
$slug = $_GET['slug'] ?? null;
if (!$slug) {
    echo "<h2 style='padding:40px;text-align:center'>Không tìm thấy phim</h2>";
    return;
}
?>

<link rel="stylesheet" href="assets/css/movies.css">
<link rel="stylesheet" href="assets/css/review.css">

<div class="page-content dark-cinema-bg">
  
  <!-- KHỐI 1: MAIN HERO INFO -->
  <div class="cinema-hero">
    <div class="cinema-hero-content">
      
      <div class="cinema-hero-poster">
        <div id="moviePosterSkeleton" class="skeleton sk-poster"></div>
        <img id="moviePoster" alt="Poster phim" style="display:none">
      </div>

      <div class="cinema-hero-info">
        <div class="movie-title-row">
            <span id="movieAge" class="age-badge" style="display:none">P</span>
            <h1 id="movieTitleDetail" class="skeleton sk-title"></h1>
        </div>
        
        <div class="cinema-hero-meta" id="movieMetaRow">
          <span class="skeleton sk-meta"></span>
          <span class="skeleton sk-meta"></span>
        </div>

        <div class="cinema-hero-rating">
          <div class="star-group">
            <i class="fa-solid fa-star"></i>
            <span class="rating-score">9.4</span>
            <span class="rating-sub">từ <b>2231</b> đánh giá</span>
          </div>
        </div>

        <div class="cinema-slogan">Có những lời yêu chỉ được nói khi thời gian quay lại.</div>

        <div class="cinema-hero-desc">
          <h4 data-i18n="movie_synopsis">Nội dung</h4>
          <div id="movieDescSkeleton">
            <div class="skeleton sk-text"></div>
            <div class="skeleton sk-text"></div>
            <div class="skeleton sk-text-short"></div>
          </div>
          <p id="movieDescription" class="short" style="display:none"></p>
          <span id="toggleDescription" class="toggle-more" style="display:none">...<span data-i18n="load_more">Xem thêm</span></span>
        </div>
        
        <div class="cinema-hero-compact-info">
            <div class="info-item"><span data-i18n="movie_release">Ngày chiếu:</span> <b id="movieRelease">--/--/----</b></div>
            <div class="info-item"><span data-i18n="movie_genre">Thể loại:</span> <b id="movieGenre">Đang cập nhật</b></div>
            <div class="info-item"><span data-i18n="movie_duration">Thời lượng:</span> <b id="movieDurationCompact">0 phút</b></div>
            <div class="info-item"><span data-i18n="movie_language">Ngôn ngữ:</span> <b id="movieLanguage">Đang cập nhật</b></div>
        </div>

        <div class="cinema-hero-actions">
          <button id="btnTrailer" class="action-btn"><i class="fa-regular fa-circle-play"></i> <span data-i18n="btn_watch_trailer">Xem trailer</span></button>
          <button class="action-btn" onclick="alert('Tính năng đang phát triển!')"><i class="fa-regular fa-star"></i> <span data-i18n="btn_view_review">Xem review</span></button>
        </div>

      </div>
    </div>
  </div>

  <!-- KHỐI 2: SHOWTIMES & NOW SHOWING -->
  <div class="cinema-bottom container">
    
    <div class="cinema-showtimes-col">
      <div class="section-title-row">
        <h2 class="sect-title"><span data-i18n="showtime_for">Lịch chiếu</span> <span id="stMovieTitle"></span></h2>
        <div class="filter-group">
          <select><option>Hồ Chí Minh</option></select>
          <button><i class="fa-solid fa-location-crosshairs"></i> Gần bạn</button>
        </div>
      </div>
      
      <!-- INLINE SHOWTIME LIST -->
      <div class="inline-showtimes-wrapper">
        <div class="date-list-scrollable" id="inlineDateList"></div>
        <div id="inlineBookingContent" class="inline-booking-content">
            <div style="padding: 40px; text-align: center; color: #888;">
                <i class="fa-solid fa-circle-notch fa-spin fa-2x"></i><br><br><span data-i18n="movie_loading_showtimes">Đang tải lịch chiếu...</span>
            </div>
        </div>
      </div>
      <!-- KHỐI 3: REVIEW BÌNH LUẬN -->
      <div class="review-section">
        <div class="review-header">
          <h2 data-i18n="movie_reviews">Bình luận từ người xem</h2>
          <div class="review-score-overall">
            <i class="fa-solid fa-star star"></i>
            <div class="big-score" id="overallRating">9.4</div>
            <div class="small-score">/10 • <span id="totalReviewsCount">0</span> đánh giá</div>
          </div>
        </div>

        <!-- FORM ĐÁNH GIÁ -->
        <div class="write-review-box">
          <h4 data-i18n="movie_write_review">Viết đánh giá của bạn</h4>
          <div class="rating-picker" id="ratingPicker">
            <i class="fa-solid fa-star" data-rating="1"></i>
            <i class="fa-solid fa-star" data-rating="2"></i>
            <i class="fa-solid fa-star" data-rating="3"></i>
            <i class="fa-solid fa-star" data-rating="4"></i>
            <i class="fa-solid fa-star" data-rating="5"></i>
            <i class="fa-solid fa-star" data-rating="6"></i>
            <i class="fa-solid fa-star" data-rating="7"></i>
            <i class="fa-solid fa-star" data-rating="8"></i>
            <i class="fa-solid fa-star" data-rating="9"></i>
            <i class="fa-solid fa-star" data-rating="10"></i>
          </div>
          <textarea id="reviewContent" class="review-input" placeholder="Bạn cảm thấy trọn vẹn nhất điều gì ở bộ phim này? Chia sẻ nha..."></textarea>
          
          <div class="review-tags-picker" id="reviewTagsPicker">
            <span class="tag-btn" data-tag="Tuyệt vời">Tuyệt vời</span>
            <span class="tag-btn" data-tag="Hài lòng">Hài lòng</span>
            <span class="tag-btn" data-tag="Cảm động">Cảm động</span>
            <span class="tag-btn" data-tag="Đáng xem">Đáng xem</span>
            <span class="tag-btn" data-tag="Hài hước">Hài hước</span>
            <span class="tag-btn" data-tag="Khóc trôi rạp">Khóc trôi rạp</span>
          </div>

          <div class="clearfix">
            <button id="btnSubmitReview" class="submit-review-btn" data-i18n="btn_send_review">Gửi đánh giá</button>
          </div>
        </div>

        <!-- DANH SÁCH BÌNH LUẬN -->
        <div class="review-list" id="reviewList">
          <div style="text-align: center; color: #888;" data-i18n="movie_loading_reviews">Đang tải bình luận...</div>
        </div>
      </div>

    </div>

    <div class="cinema-sidebar-col">
      <h2 class="sect-title" data-i18n="now_showing">Phim đang chiếu</h2>
      <div id="now-showing-sidebar-list" class="sidebar-movie-list">
        <div class="skeleton sk-text" style="height: 120px; margin-bottom: 15px;"></div>
        <div class="skeleton sk-text" style="height: 120px; margin-bottom: 15px;"></div>
        <div class="skeleton sk-text" style="height: 120px;"></div>
      </div>
    </div>

  </div>

</div>

<!-- MODAL TRAILER -->
<div class="mv-trailer-overlay" id="mvTrailerOverlay">
  <div class="mv-trailer-box">
    <button class="mv-trailer-close" id="mvTrailerClose">✕</button>
    <iframe id="mvTrailerFrame" allowfullscreen></iframe>
  </div>
</div>

<!-- BOOKING MODAL -->
<?php include 'booking-modal.php'; ?>

<script>
  const slug = "<?= htmlspecialchars($slug) ?>";
</script>

<!-- booking-modal.js TRƯỚC, movie.js SAU -->
<?php $v_js = time(); ?>
<script src="assets/js/booking-modal.js?v=<?= $v_js ?>"></script>
<script src="assets/js/movie.js?v=<?= $v_js ?>"></script>
