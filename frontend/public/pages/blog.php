<?php
// bG9n = 'blog' in base64 (ví dụ để match với hệ thống hiện tại nếu cần)
?>
<section class="blog-container">
  <div class="container blog-content-wrapper">
    <!-- Nền hiệu ứng nếu cần, sử dụng style chung của rạp phim -->
    
    <div class="blog-header">
      <div class="section-heading">
        <span class="section-line"></span>
        <h3>TIN TỨC & SỰ KIỆN PHIM</h3>
        <span class="section-line"></span>
      </div>
      
      <!-- ADMIN DASHBOARD - CHỈ HIỆN VỚI ADMIN -->
      <div id="admin-action-area" class="admin-dashboard-container" style="display:none;">
        <div class="admin-post-card">
          <div class="admin-user-info">
            <img src="./assets/images/logo.png" class="admin-avatar" id="admin-display-avatar">
            <div class="admin-greeting">
              <span class="greeting-text" data-i18n="login">Xin chào Admin,</span>
              <span class="prompt-text">Hôm nay rạp mình có tin tức gì mới không?</span>
            </div>
          </div>
          <div class="admin-quick-actions">
            <button class="quick-action-btn" id="btnOpenCreateModal">
              <i class="fa-solid fa-pen-to-square"></i> Viết bài mới
            </button>
            <div class="action-divider"></div>
            <div class="action-icons">
              <i class="fa-solid fa-image" title="Thêm ảnh"></i>
              <i class="fa-solid fa-tags" title="Chọn danh mục"></i>
              <i class="fa-solid fa-clock" title="Lên lịch"></i>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Script hiển thị nhanh cho Admin -->
      <script>
        (function() {
          const token = localStorage.getItem("token");
          const user = JSON.parse(localStorage.getItem("user") || "null");
          const role = (user && user.role) ? String(user.role).toLowerCase().trim() : "";
          const name = (user && user.fullname) ? String(user.fullname).toLowerCase() : "";
          
          if (token && (role === "admin" || name.includes("admin"))) {
            const adminArea = document.getElementById("admin-action-area");
            if (adminArea) adminArea.style.display = "block";
          }
        })();
      </script>
    </div>

    <!-- DANH MỤC NGANG (HORIZONTAL FILTER) -->
    <div class="category-strip-container">
      <div class="category-bar">
        <a href="#" class="cat-item active" data-cat="" data-i18n="forum_all">Tất cả</a>
        <a href="#" class="cat-item" data-cat="Tin tức" data-i18n="blog_news">Tin tức</a>
        <a href="#" class="cat-item" data-cat="Review" data-i18n="blog_review">Review</a>
        <a href="#" class="cat-item" data-cat="Khuyến mãi" data-i18n="blog_promotion">Khuyến mãi</a>
        <a href="#" class="cat-item" data-cat="Hướng dẫn">Hướng dẫn</a>
      </div>
    </div>

    <div class="blog-layout full-width">
      <!-- CỘT CHÍNH: DANH SÁCH BÀI VIẾT -->
      <div class="blog-main">
        
        <!-- BÀI VIẾT NỔI BẬT (FEATURED) -->
        <div id="featured-posts" class="featured-grid">
          <!-- JS Render -->
        </div>

        <div class="separator-text">
          <span data-i18n="blog_latest">Bài viết mới nhất</span>
        </div>

        <!-- DANH SÁCH BÀI VIẾT PHỔ BIẾN -->
        <div id="blog-list" class="blog-list">
          <!-- JS Render -->
        </div>

        <div class="pagination" id="blog-pagination"></div>
      </div>
    </div>
  </div>
</section>

<!-- MODAL ĐĂNG BÀI (CHỈ ADMIN) -->
<div id="createPostModal" class="modal">
  <div class="modal-content blog-modal">
    <span class="close-modal">&times;</span>
    <h2>ĐĂNG BÀI VIẾT MỚI</h2>
    <form id="createPostForm">
      <div class="form-group">
        <label>Tiêu đề</label>
        <input type="text" id="postTitle" required placeholder="Nhập tiêu đề bài viết...">
      </div>
      <div class="form-group">
        <label>Tóm tắt bài viết</label>
        <textarea id="postSummary" rows="2" placeholder="Nhập tóm tắt ngắn..."></textarea>
      </div>
      <div class="form-group">
        <label>Nội dung chi tiết</label>
        <textarea id="postContent" rows="10" required placeholder="Nội dung bài viết..."></textarea>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Tải lên hình ảnh</label>
          <div class="file-upload-wrapper">
            <input type="file" id="postImage" accept="image/*" hidden>
            <button type="button" class="btn-file-custom" onclick="document.getElementById('postImage').click()">
              <i class="fa-solid fa-cloud-arrow-up"></i> Chọn ảnh từ máy tính
            </button>
            <span id="file-chosen">Chưa chọn ảnh nào</span>
          </div>
        </div>
        <div class="form-group">
          <label>Danh mục</label>
          <select id="postCategory">
            <option value="Tin tức">Tin tức</option>
            <option value="Review">Review</option>
            <option value="Khuyến mãi">Khuyến mãi</option>
            <option value="Hướng dẫn">Hướng dẫn</option>
          </select>
        </div>
      </div>
      <button type="submit" class="btn-submit-post">CÔNG BỐ BÀI VIẾT</button>
    </form>
  </div>
</div>

<link rel="stylesheet" href="./assets/css/blog.css?v=<?php echo time(); ?>">
<script src="./assets/js/blog.js?v=<?php echo time(); ?>"></script>
