<?php
session_start();

$page = $_GET['page'] ?? 'dashboard';

// Nếu chưa đăng nhập (không có token trong localStorage)
// Hệ thống sẽ được kiểm tra ở phía Client Side (JS) trước tiên,
// nhưng PHP router vẫn sẽ chứa file layout gốc.

$allowedPages = [
    'login', 
    'dashboard', 
    'movies', 
    'showtimes', 
    'rooms', 
    'bookings', 
    'users', 
    'promotions',
    'reports',
    'checkin',
    'notifications',
    'settings'
];

if (!in_array($page, $allowedPages)) {
    $page = 'dashboard';
}

if ($page === 'login') {
    require __DIR__ . '/pages/login.php';
} else {
    // Các trang cần Auth sẽ dùng chung layout
    require __DIR__ . '/layouts/header.php';
    require __DIR__ . '/pages/' . $page . '.php';
    require __DIR__ . '/layouts/footer.php';
}
