<?php
require_once __DIR__ . "/includes/RateLimiter.php";
RateLimiter::check();

if (function_exists('opcache_reset')) {
    opcache_reset();
}

require_once __DIR__ . "/includes/UrlService.php";

$v = $_GET['v'] ?? '';
$decoded = null;
if ($v) {
    $decoded = UrlService::decode($v);
}

// 0. SANITIZE ALL INPUTS (XSS PROTECTION)
foreach ($_GET as $key => $value) {
    if (is_string($value)) {
        $_GET[$key] = htmlspecialchars(strip_tags($value), ENT_QUOTES, 'UTF-8');
    }
}

if ($decoded) {
    foreach ($decoded as $key => $val) {
        if (is_string($val)) {
            $_GET[$key] = htmlspecialchars(strip_tags($val), ENT_QUOTES, 'UTF-8');
        } else {
            $_GET[$key] = $val;
        }
    }
}

$search = $_GET['search'] ?? '';

$p = $_GET['p'] ?? '';
if ($v && isset($decoded['p'])) {
    // If coming from 'v', 'p' is already decoded
    $page = $decoded['p'];
} elseif ($p) {
    // Legacy support for base64 encoded 'p'
    $decoded_p = base64_decode($p, true);
    if ($decoded_p && base64_encode($decoded_p) === $p) {
        $page = $decoded_p;
    } else {
        $page = $p;
    }
} else {
    $page = $_GET['page'] ?? 'home';
}



$allowedPages = ['home', 'login', 'register', 'forgot-password', 'account', 'movie', 'movies', 'schedule-today', 'booking-seat', 'admin', 'booking-combo', 'payment','my-tickets', 'forum', 'thread', 'blog', 'blog-detail', 'news-offers', 'now-showing', 'coming-soon', 'shop' ];

require __DIR__ . "/layouts/header.php";

if ($search != '') {

    require __DIR__ . "/pages/search.php";

} else {

    if (!in_array($page, $allowedPages)) {
        require __DIR__ . "/pages/404.php";
        exit;
    }

    include __DIR__ . "/pages/booking-modal.php";

    if ($page === 'admin') {
        require __DIR__ . "/admin/admin.php";
    } else {
        require __DIR__ . "/pages/$page.php";
    }

}

require __DIR__ . "/layouts/footer.php";
