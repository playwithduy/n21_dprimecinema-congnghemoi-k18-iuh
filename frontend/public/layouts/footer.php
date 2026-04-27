</main>
<footer class="footer">
  <div class="footer-main">
    <div class="container footer-grid">
      
      <!-- BRAND COLUMN -->
      <div class="footer-col brand-col">
        <div class="footer-logo-box">
          <img src="./assets/images/logo.png" alt="DPrime Logo" onerror="this.src='https://ui-avatars.com/api/?name=DP&background=d61f26&color=fff'">
          <div class="logo-glow"></div>
        </div>
        <p class="brand-slogan">Mang cả thế giới điện ảnh đến gần bạn hơn với công nghệ chiếu phim hàng đầu và dịch vụ tận tâm.</p>
        <div class="social-links-pro">
          <a href="#" class="social-btn facebook"><i class="fab fa-facebook-f"></i></a>
          <a href="#" class="social-btn instagram"><i class="fab fa-instagram"></i></a>
          <a href="#" class="social-btn youtube"><i class="fab fa-youtube"></i></a>
          <a href="#" class="social-btn tiktok"><i class="fab fa-tiktok"></i></a>
        </div>
      </div>

      <!-- LINKS COLUMN 1 -->
      <div class="footer-col">
        <h4 class="footer-title" data-i18n="footer_info">THÔNG TIN</h4>
        <ul class="footer-links">
          <li><a href="#"><i class="fas fa-chevron-right"></i> <span data-i18n="footer_intro">Giới Thiệu</span></a></li>
          <li><a href="#"><i class="fas fa-chevron-right"></i> <span data-i18n="footer_jobs">Tuyển Dụng</span></a></li>
          <li><a href="#"><i class="fas fa-chevron-right"></i> <span data-i18n="footer_ads">Liên Hệ Quảng Cáo</span></a></li>
          <li><a href="#"><i class="fas fa-chevron-right"></i> <span data-i18n="footer_terms">Thỏa Thuận Sử Dụng</span></a></li>
        </ul>
      </div>

      <!-- LINKS COLUMN 2 -->
      <div class="footer-col">
        <h4 class="footer-title" data-i18n="footer_support">HỖ TRỢ</h4>
        <ul class="footer-links">
          <li><a href="#"><i class="fas fa-chevron-right"></i> <span data-i18n="footer_faq">Câu Hỏi Thường Gặp</span></a></li>
          <li><a href="#"><i class="fas fa-chevron-right"></i> <span data-i18n="footer_privacy">Chính Sách Bảo Mật</span></a></li>
          <li><a href="#"><i class="fas fa-chevron-right"></i> <span data-i18n="footer_payment">Chính Sách Thanh Toán</span></a></li>
          <li><a href="#"><i class="fas fa-chevron-right"></i> <span data-i18n="footer_cskh">Chăm Sóc Khách Hàng</span></a></li>
        </ul>
      </div>

      <!-- NEWSLETTER & CONTACT -->
      <div class="footer-col contact-col">
        <h4 class="footer-title" data-i18n="footer_connect">KẾT NỐI VỚI DP</h4>
        <p class="newsletter-desc" data-i18n="footer_newsletter">Đăng ký nhận tin để không bỏ lỡ các suất chiếu sớm đặc biệt.</p>
        <div class="subscribe-form-pro">
          <input type="email" placeholder="Nhập email của bạn..." data-i18n="search_placeholder">
          <button type="submit" data-i18n="btn_subscribe">ĐĂNG KÝ</button>
        </div>
        <div class="contact-details">
          <div class="contact-item">
            <i class="fas fa-phone-alt"></i>
            <span>Hotline: <strong>0398.278.164</strong></span>
          </div>
          <div class="contact-item">
            <i class="fas fa-envelope"></i>
            <span>Email: <strong>cskh@dprime.vn</strong></span>
          </div>
        </div>
      </div>

    </div>
  </div>
  
  <div class="footer-bottom">
    <div class="container">
      <div class="footer-bottom-inner">
        <p class="copyright" data-i18n="copyright">&copy; 2026 D PRIME CINEMA. Phát triển với niềm đam mê điện ảnh.</p>
        <div class="footer-badges">
          <img src="https://webchuan.com.vn/wp-content/uploads/2021/07/logo-da-thong-bao-bo-cong-thuong.png" alt="Bộ công thương" class="bct-badge">
        </div>
      </div>
    </div>
  </div>
</footer>

<?php $v = time(); ?>
<script src="./assets/js/search.js?v=<?php echo $v; ?>"></script>
<?php if (isset($page) && $page === 'account'): ?>
<script src="./assets/js/account.js?v=<?php echo $v; ?>"></script>
<?php endif; ?>

</body>
</html>
