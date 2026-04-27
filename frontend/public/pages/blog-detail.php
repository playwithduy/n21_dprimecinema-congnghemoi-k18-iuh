<section class="blog-detail-container">
  <div class="container blog-content-wrapper">
    <div class="breadcrumb">
      <a href="index.php">Trang chủ</a> <i class="fa-solid fa-chevron-right"></i> 
      <a href="index.php?p=YmxvZw==">Blog</a> <i class="fa-solid fa-chevron-right"></i> 
      <span id="breadcrumb-category">...</span> <i class="fa-solid fa-chevron-right"></i> 
      <span id="breadcrumb-title" class="active">...</span>
    </div>

    <div class="blog-layout full-width">
      <!-- CỘT CHÍNH: NỘI DUNG CHI TIẾT -->
      <article class="blog-detail-main blog-detail-card">
        <div id="post-header" class="post-header">
          <div id="post-meta-top" class="post-meta-top">...</div>
          <h1 id="post-title" class="post-title">...</h1>
          <div class="post-author-info">
            <img src="./assets/images/logo.png" id="author-avatar" class="author-avatar">
            <div class="author-details">
              <strong id="author-name">...</strong>
              <span id="post-date">...</span>
            </div>
          </div>
        </div>

        <div id="post-hero" class="post-hero">
          <!-- JS Render Image -->
        </div>

        <div id="post-content" class="post-content-body">
          <!-- JS Render Content -->
        </div>

        <div class="post-footer">
          <div class="share-box">
            <span>Chia sẻ:</span>
            <a href="#"><i class="fa-brands fa-facebook"></i></a>
            <a href="#"><i class="fa-brands fa-twitter"></i></a>
            <a href="#"><i class="fa-brands fa-linkedin"></i></a>
          </div>
          <div class="post-tags" id="post-tags">
            <!-- JS Render Category if needed -->
          </div>
        </div>
      </article>
    </div>
  </div>
</section>

<!-- Link CSS specific for blog detail if needed, but it's already in blog.css -->
<link rel="stylesheet" href="./assets/css/blog.css?v=<?php echo time(); ?>">
<script src="./assets/js/blog-detail.js?v=<?php echo time(); ?>"></script>
