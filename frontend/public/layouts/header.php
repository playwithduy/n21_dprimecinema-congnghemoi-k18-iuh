<?php header("X-Frame-Options: SAMEORIGIN"); header("X-Content-Type-Options: nosniff"); ?>
<!DOCTYPE html>
<html lang="vi">
<head>

<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<!-- Security Headers (Handled via PHP/Server) -->


<!-- Performance: Preconnect -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preconnect" href="https://cdnjs.cloudflare.com">

<?php
// Define base URL
$protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off' || $_SERVER['SERVER_PORT'] == 443) ? "https://" : "http://";
$baseUrl = rtrim(dirname($_SERVER['SCRIPT_NAME']), '/\\') . '/';
$fullBaseUrl = $protocol . $_SERVER['HTTP_HOST'] . $baseUrl;

// --- SEO LOGIC ---
$seoTitle = "D PRIME CINEMA - Premium Movie Experience";
$seoDesc  = "Trải nghiệm điện ảnh đỉnh cao tại D PRIME CINEMA. Đặt vé trực tuyến, xem lịch chiếu và cập nhật tin tức phim mới nhất.";
$currentUrl = $protocol . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI'];

$slug = $_GET['slug'] ?? '';
if ($slug) {
    $cleanName = str_replace('-', ' ', $slug);
    $cleanName = ucwords($cleanName);
    $seoTitle = $cleanName . " | D PRIME CINEMA";
    $seoDesc  = "Xem thông tin, lịch chiếu và đặt vé phim " . $cleanName . " tại D PRIME CINEMA. Ưu đãi hấp dẫn mỗi ngày.";
}
?>
<base href="<?php echo $fullBaseUrl; ?>">

<title><?php echo $seoTitle; ?></title>
<meta name="description" content="<?php echo $seoDesc; ?>">

<!-- Canonical Link for SEO -->
<link rel="canonical" href="<?php echo $currentUrl; ?>">

<!-- Open Graph -->
<meta property="og:title" content="<?php echo $seoTitle; ?>">
<meta property="og:description" content="<?php echo $seoDesc; ?>">
<meta property="og:type" content="website">
<meta property="og:url" content="<?php echo $currentUrl; ?>">
<meta property="og:image" content="<?php echo $fullBaseUrl; ?>assets/images/logo.png">

<!-- Instant Language Detection -->
<script>
  (function() {
    const savedLang = localStorage.getItem("lang") || "vi";
    document.documentElement.lang = savedLang;
    if (savedLang === 'en') {
      document.documentElement.classList.add('lang-en-loading');
    }
  })();
</script>

<style>
  /* Prevent Vietnamese flicker when in English mode */
  .lang-en-loading [data-i18n] {
    visibility: hidden;
  }
</style>

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Montserrat:wght@400;600;700;800&display=swap" rel="stylesheet">

<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">

<?php $v = time(); ?>
<link rel="stylesheet" href="./assets/css/style.css?v=<?php echo $v; ?>">
<link rel="stylesheet" href="./assets/css/home.css?v=<?php echo $v; ?>">
<link rel="stylesheet" href="./assets/css/login.css?v=<?php echo $v; ?>">
<link rel="stylesheet" href="./assets/css/account.css?v=<?php echo $v; ?>">
<link rel="stylesheet" href="./assets/css/pages.css?v=<?php echo $v; ?>">
<link rel="stylesheet" href="./assets/css/movies.css?v=<?php echo $v; ?>">
<link rel="stylesheet" href="./assets/css/booking-modal.css?v=<?php echo $v; ?>">
<link rel="stylesheet" href="./assets/css/booking-seat.css?v=<?php echo $v; ?>">
<link rel="stylesheet" href="./assets/css/booking-combo.css?v=<?php echo $v; ?>">
<link rel="stylesheet" href="./assets/css/payment.css?v=<?php echo $v; ?>">
<link rel="stylesheet" href="./assets/css/my-tickets.css?v=<?php echo $v; ?>">
<link rel="stylesheet" href="./assets/css/search.css?v=<?php echo $v; ?>">
<link rel="stylesheet" href="./assets/css/movieall.css?v=<?php echo $v; ?>">
<link rel="stylesheet" href="./assets/css/schedule-today.css?v=<?php echo $v; ?>">
<link rel="stylesheet" href="./assets/css/news-offers.css?v=<?php echo $v; ?>">
<link rel="stylesheet" href="./assets/css/toast.css?v=<?php echo $v; ?>">
<link rel="stylesheet" href="./assets/css/skeleton.css?v=<?php echo $v; ?>">
<link rel="stylesheet" href="./assets/css/chatbot.css?v=<?php echo $v; ?>">
<link id="dynamic-favicon" rel="icon" href="./assets/images/logo.png" type="image/png">

<!-- Favicon Animation Script -->
<script>
  (function() {
    let currentIcon = 0;
    const icons = ["./assets/images/logo.png", "./assets/images/logo2.png"];
    const favicon = document.getElementById("dynamic-favicon");
    
    setInterval(() => {
      currentIcon = (currentIcon + 1) % icons.length;
      favicon.href = icons[currentIcon];
    }, 3000); // 3 seconds to match header
  })();
</script>

<?php $js_v = time(); ?>
<script src="./assets/js/url-helper.js?v=<?php echo $js_v; ?>"></script>
<script src="./assets/js/i18n.js?v=<?php echo $js_v; ?>"></script>
<script src="./assets/js/toast.js?v=<?php echo $js_v; ?>"></script>
<script src="./assets/js/gemini-bot.js?v=<?php echo $js_v; ?>"></script>
</head>


<body>

<!-- POPUP BANNER -->
<div class="popup-overlay" id="popupBanner">
  <div class="popup-box">
    <button class="popup-close" id="popupClose">✕</button>
    <a href="index.php?p=bW92aWVz">
      <img src="./assets/images/banner-quangcao.png" alt="Khuyến mãi"
           onerror="this.src='https://placehold.co/480x640/0b0f19/e50914?text=D+PRIME+CINEMA'">
    </a>
  </div>
</div>

<header class="header">

<!-- TOPBAR -->
<div class="topbar">
<div class="container topbar-flex">

<div class="topbar-left">
<a href="index.php?p=bmV3cy1vZmZlcnM=" style="color: inherit; text-decoration: none;">
  <i class="fa-solid fa-bullhorn"></i> <span data-i18n="top_news">Tin mới & ưu đãi</span>
</a>
</div>

<div class="topbar-search">
<input type="text" id="searchMovie" placeholder="Tìm kiếm phim..." data-i18n="search_placeholder">
<i class="fa-solid fa-magnifying-glass"></i>
<div class="search-result" id="searchResult"></div>
</div>

<div class="topbar-right" id="auth-area">
<a href="index.php?p=bXktdGlja2V0cw=="><i class="fa-solid fa-ticket"></i> <span data-i18n="my_tickets">Vé của tôi</span></a>
<div class="header-icons">
  <i class="fa-solid fa-moon" id="darkToggle"></i>
  <div class="notify">
    <i class="fa-solid fa-bell"></i>
    <span class="badge" style="display:none">0</span>
  </div>
</div>
<a href="index.php?p=bG9naW4="><i class="fa-solid fa-user"></i> <span data-i18n="login">Đăng nhập</span></a>
/
<a href="index.php?p=cmVnaXN0ZXI=" data-i18n="register">Đăng ký</a>
<div class="lang-switch">
  <button class="lang-btn active">VN</button>
  <button class="lang-btn">EN</button>
</div>
</div>

</div>
</div>

<!-- MAIN HEADER -->
<div class="main-header">
<div class="container header-content">

<div class="logo">
  <div class="logo-slider">
    <img src="./assets/images/logo.png" class="logo-item active" loading="eager">
    <img src="./assets/images/logo2.png" class="logo-item" loading="lazy">
  </div>
</div>

<nav class="nav">
<a href="index.php"><i class="fa-solid fa-house"></i></a>
<a href="index.php?p=bW92aWVz"><i class="fa-solid fa-film"></i> <span data-i18n="nav_movies">PHIM</span></a>
<div class="nav-dropdown">
<a href="#" class="nav-dropdown-toggle"><i class="fa-solid fa-calendar"></i> <span data-i18n="nav_schedule">LỊCH CHIẾU</span></a>
<div class="nav-dropdown-menu">
<a href="index.php?p=c2NoZWR1bGUtdG9kYXk=" data-i18n="nav_schedule_today">Lịch chiếu hôm nay</a>
<a href="index.php?p=bm93LXNob3dpbmc=" data-i18n="nav_now_showing">Phim đang chiếu</a>
<a href="index.php?p=Y29taW5nLXNvb24=" data-i18n="nav_coming_soon">Phim sắp chiếu</a>
</div>
</div>
<a href="index.php?p=YmxvZw=="><i class="fa-solid fa-blog"></i> <span data-i18n="nav_blog">BLOG</span></a>
<a href="index.php?p=Zm9ydW0="><i class="fa-solid fa-comments"></i> <span data-i18n="nav_forum">DIỄN ĐÀN</span></a>
</nav>

<div class="buy-ticket">
  <button class="btn-ticket" onclick="window.location.href='index.php?p=bW92aWVz'">
    <i class="fa-solid fa-ticket"></i> <span data-i18n="btn_buy_ticket">MUA VÉ NGAY</span>
  </button>
</div>

</div>
</div>

</header>

<script>
window.APP_CONFIG = { 
  API_BASE: window.location.protocol + '//' + window.location.hostname + ':3000/api',
  WS_URL: 'ws://' + window.location.hostname + ':3005',
  UPLOAD_BASE: window.location.protocol + '//' + window.location.hostname + ':3000/uploads'
};

document.addEventListener("DOMContentLoaded", function(){

  /* ===== LOGO DIRTY STYLE (2 ảnh) ===== */
  const logos = document.querySelectorAll(".logo-item");
  let current = 0;

  if (logos.length === 2) {
    setInterval(() => {

      logos[current].classList.add("out");

      setTimeout(() => {
        logos[current].classList.remove("active", "out");

        current = current === 0 ? 1 : 0;

        logos[current].classList.add("active");
      }, 400); 

    }, 3000);
  }

  /* ===== POPUP BANNER ===== */
  const popup    = document.getElementById("popupBanner");
  const closeBtn = document.getElementById("popupClose");

  if (!sessionStorage.getItem("popup_shown")) {
    setTimeout(() => popup.classList.add("show"), 500);
    sessionStorage.setItem("popup_shown", "1");
  }

  closeBtn.addEventListener("click", () => popup.classList.remove("show"));

  popup.addEventListener("click", (e) => {
    if (e.target === popup) popup.classList.remove("show");
  });

  /* ===== AUTH ===== */
  const token    = localStorage.getItem("token");
  const userData = localStorage.getItem("user");
  const authArea = document.getElementById("auth-area");

  if (!authArea) return;

  let user = null;
  try { user = JSON.parse(userData); } catch(e) { user = null; }

  if (token && user) {

    let avatarHtml = `<i class="fa-solid fa-circle-user user-avatar-icon"></i>`;
    if (user.avatar) {
      const avatarUrl = getAssetUrl(user.avatar);
      avatarHtml = `<img src="${avatarUrl}" class="user-avatar" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullname)}&background=e71a0f&color=fff'">`;
    }

    authArea.innerHTML = `
      <a href="index.php?p=bXktdGlja2V0cw=="><i class="fa-solid fa-ticket"></i> Vé của tôi</a>

      <div class="header-icons">
        <i class="fa-solid fa-moon" id="darkToggle"></i>
        <div class="notify">
          <i class="fa-solid fa-bell"></i>
          <span class="badge" style="display:none">0</span>
        </div>
      </div>

      <div class="account-link">
        ${avatarHtml}
        <span>${user.fullname}</span>
        <div class="user-dropdown">
          <a href="index.php?p=YWNjb3VudA=="><i class="fa-solid fa-user"></i> Hồ sơ</a>
          <a href="index.php?p=bXktdGlja2V0cw=="><i class="fa-solid fa-ticket"></i> Vé của tôi</a>
          <a href="#" id="logoutBtn"><i class="fa-solid fa-right-from-bracket"></i> Đăng xuất</a>
        </div>
      </div>

      <div class="lang-switch">
  <button class="lang-btn active">VN</button>
  <button class="lang-btn">EN</button>
</div>
    `;

    // initNotify(); // Xoá bỏ hàm gây lỗi ReferenceError

    // Sử dụng Ủy thác sự kiện (Event Delegation) để xử lý Dropdown và Đăng xuất
    document.addEventListener("click", function(e) {
        const accountLink = e.target.closest(".account-link");
        const logoutBtn = e.target.closest("#logoutBtn");
        const userDropdown = document.querySelector(".user-dropdown");
        const isLinkInside = e.target.closest(".user-dropdown a");

        // 1. Xử lý Đăng xuất
        if (logoutBtn) {
            e.preventDefault();
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            localStorage.removeItem("chat_history");
            location.reload();
            return;
        }

        // 2. Nếu click vào link trong dropdown (Hồ sơ, Vé của tôi) -> để nó chạy tự nhiên
        if (isLinkInside) {
            return;
        }

        // 3. Xử lý Toggle Dropdown khi click vào phần Avatar/Tên
        if (accountLink) {
            e.preventDefault();
            e.stopPropagation();
            if (userDropdown) userDropdown.classList.toggle("show");
            return;
        }

        // 4. Đóng dropdown khi click ra ngoài
        if (userDropdown && !e.target.closest(".account-link")) {
            userDropdown.classList.remove("show");
        }
    });
  }

  // Dropdown nav
  document.querySelectorAll('.nav-dropdown-toggle').forEach(toggle => {
    toggle.addEventListener('click', function(e) {
      e.preventDefault();
      const dropdown = this.closest('.nav-dropdown');
      const isOpen   = dropdown.classList.contains('open');
      document.querySelectorAll('.nav-dropdown.open').forEach(el => el.classList.remove('open'));
      if (!isOpen) dropdown.classList.add('open');
    });
  });

  document.addEventListener('click', function(e) {
    if (!e.target.closest('.nav-dropdown')) {
      document.querySelectorAll('.nav-dropdown.open').forEach(el => el.classList.remove('open'));
    }
  });

});
</script>

<main>
