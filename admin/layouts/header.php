<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>D PRIME - Admin Dashboard</title>

    <!-- Favicon -->
    <link rel="icon" type="image/png" href="assets/images/favicon.png">

    <!-- Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&family=Be+Vietnam+Pro:wght@400;500;600;700&display=swap" rel="stylesheet">
    <!-- FontAwesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    
    <style>
        :root {
            --bg-dark: #0f1118;
            --bg-darker: #0a0c10;
            --surface: #1a1d29;
            --surface-hover: #262b3d;
            --primary: #e50914;
            --primary-hover: #ff1f2a;
            --text-main: #f1f5f9;
            --text-muted: #94a3b8;
            --border-color: rgba(255, 255, 255, 0.08);
            --sidebar-width: 260px;
        }

        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background-color: var(--bg-dark); color: var(--text-main); font-family: 'Be Vietnam Pro', sans-serif; }
        
        /* Layout */
        .admin-layout { display: flex; min-height: 100vh; }
        
        /* Sidebar */
        .sidebar {
            width: var(--sidebar-width);
            background-color: var(--bg-darker);
            border-right: 1px solid var(--border-color);
            display: flex;
            flex-direction: column;
            position: fixed;
            height: 100vh;
            overflow-y: auto;
            z-index: 100;
        }
        
        /* Logo */
        .sidebar-logo {
            padding: 24px;
            display: flex;
            align-items: center;
            gap: 12px;
            border-bottom: 1px solid var(--border-color);
        }
        .sidebar-logo img { height: 35px; }
        .sidebar-logo span { font-family: 'Montserrat', sans-serif; font-weight: 800; font-size: 18px; color: #fff; letter-spacing: 1px; }
        .sidebar-logo span .highlight { color: var(--primary); }

        /* Navigation */
        .sidebar-nav { padding: 20px 0; flex: 1; }
        .nav-label { padding: 0 24px 10px; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: var(--text-muted); font-weight: 600; }
        
        .nav-item {
            display: flex;
            align-items: center;
            padding: 12px 24px;
            color: var(--text-muted);
            text-decoration: none;
            transition: all 0.2s;
            margin: 4px 12px;
            border-radius: 8px;
            font-weight: 500;
            font-size: 14px;
        }
        
        .nav-item i { margin-right: 14px; width: 20px; text-align: center; font-size: 16px; }
        .nav-item:hover { background-color: rgba(255,255,255,0.05); color: #fff; }
        .nav-item.active { background: linear-gradient(90deg, var(--primary) 0%, #a2060e 100%); color: #fff; box-shadow: 0 4px 15px rgba(229, 9, 20, 0.3); }

        /* Main Content */
        .main-content {
            flex: 1;
            margin-left: var(--sidebar-width);
            display: flex;
            flex-direction: column;
        }
        
        /* Top Header */
        .top-header {
            height: 70px;
            background-color: var(--surface);
            border-bottom: 1px solid var(--border-color);
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 32px;
            position: sticky;
            top: 0;
            z-index: 50;
        }
        
        .header-title { font-size: 20px; font-weight: 700; font-family: 'Montserrat', sans-serif; }
        
        .header-user { display: flex; align-items: center; gap: 16px; position: relative; cursor: pointer; }
        .user-avatar { width: 36px; height: 36px; border-radius: 50%; background: #222; border: 2px solid var(--primary); object-fit: cover; }
        .user-info { display: flex; flex-direction: column; }
        .user-name { font-size: 14px; font-weight: 600; }
        .user-role { font-size: 11px; color: var(--primary); text-transform: uppercase; font-weight: 700; }
        
        /* Page Body */
        .page-body { padding: 32px; flex: 1; background: var(--bg-dark); }
        
        .header-actions {
            display: flex;
            gap: 16px;
            align-items: center;
            flex-wrap: wrap;
            justify-content: flex-end;
        }
        
        /* Utils */
        .btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; border: none; border-radius: 8px; padding: 10px 20px; font-weight: 600; cursor: pointer; transition: all 0.2s; font-size: 14px; }
        .btn-primary { background: var(--primary); color: #fff; }
        .btn-primary:hover { background: var(--primary-hover); transform: translateY(-1px); }
        .btn-logout { background: transparent; color: #ff4757; border: 1px solid rgba(255,71,87,0.3); }
        .btn-logout:hover { background: rgba(255,71,87,0.1); }
        
        /* JWT Auth check logic (Prevent rendering if not admin) */
        #app-wrapper { display: none; }
    </style>
    <?php require_once __DIR__ . '/api-helper.php'; ?>
</head>
<body>

<!-- JS Kiểm tra quyền hạn TRƯỚC KHI RENDER -->
<script>
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    
    if (!token || !userStr) {
        window.location.href = "index.php?page=login";
    } else {
        const user = JSON.parse(userStr);
        if (user.role !== 'admin') {
            alert("🔒 Access Denied! Khu vực này chỉ dành cho Quản Trị Viên.");
            window.location.href = window.location.protocol + "//" + window.location.hostname;
        } else {
            // Allow render
            document.addEventListener("DOMContentLoaded", () => {
                document.getElementById('app-wrapper').style.display = 'flex';
                document.getElementById('admin-fullname').innerText = user.fullname || 'Administrator';
                if(user.avatar) {
                    document.getElementById('admin-avatar').src = API.getAssetUrl(user.avatar);
                }
            });
        }
    }

    function logoutAdmin() {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "index.php?page=login";
    }
</script>

<div class="admin-layout" id="app-wrapper">
    <!-- SIDEBAR -->
    <aside class="sidebar">
        <div class="sidebar-logo">
            <!-- Reuse frontend logo -->
            <img src="assets/images/logo.png" alt="Logo">
            <span>D PRIME <span class="highlight">ADMIN</span></span>
        </div>
        
        <div class="sidebar-nav">
            <div class="nav-label">Main Menu</div>
            <a href="index.php?page=dashboard" class="nav-item <?php echo $page == 'dashboard' ? 'active' : ''; ?>">
                <i class="fa-solid fa-border-all"></i> Dashboard
            </a>
            
            <div class="nav-label" style="margin-top: 20px;">Cinema Ops</div>
            <a href="index.php?page=movies" class="nav-item <?php echo $page == 'movies' ? 'active' : ''; ?>">
                <i class="fa-solid fa-film"></i> Quản lý Phim
            </a>
            <a href="index.php?page=showtimes" class="nav-item <?php echo $page == 'showtimes' ? 'active' : ''; ?>">
                <i class="fa-regular fa-calendar-check"></i> Suất chiếu
            </a>
            <a href="index.php?page=rooms" class="nav-item <?php echo $page == 'rooms' ? 'active' : ''; ?>">
                <i class="fa-solid fa-couch"></i> Phòng & Ghế
            </a>
            
            <div class="nav-label" style="margin-top: 20px;">Sales & Users</div>
            <a href="index.php?page=bookings" class="nav-item <?php echo $page == 'bookings' ? 'active' : ''; ?>">
                <i class="fa-solid fa-ticket-simple"></i> Đặt vé
            </a>
            <a href="index.php?page=reward-exchanges" class="nav-item <?php echo $page == 'reward-exchanges' ? 'active' : ''; ?>">
                <i class="fa-solid fa-gift"></i> Quản lý Đổi quà
            </a>
            <a href="index.php?page=users" class="nav-item <?php echo $page == 'users' ? 'active' : ''; ?>">
                <i class="fa-solid fa-users"></i> Khách hàng
            </a>
            <a href="index.php?page=promotions" class="nav-item <?php echo $page == 'promotions' ? 'active' : ''; ?>">
                <i class="fa-solid fa-tag"></i> Khuyến mãi
            </a>
            <a href="index.php?page=inventory" class="nav-item <?php echo $page == 'inventory' ? 'active' : ''; ?>">
                <i class="fa-solid fa-warehouse"></i> Quản lý Kho (F&B)
            </a>
            <a href="index.php?page=reports" class="nav-item <?php echo $page == 'reports' ? 'active' : ''; ?>">
                <i class="fa-solid fa-chart-line"></i> Thống kê / Báo cáo
            </a>
            <a href="index.php?page=checkin" class="nav-item <?php echo $page == 'checkin' ? 'active' : ''; ?>">
                <i class="fa-solid fa-qrcode"></i> QR Check-in
            </a>
            <a href="index.php?page=tickets" class="nav-item <?php echo $page == 'tickets' ? 'active' : ''; ?>">
                <i class="fa-solid fa-list-check"></i> Lịch sử Vé
            </a>

            <div class="nav-label" style="margin-top: 20px;">Systems</div>
            <a href="index.php?page=notifications" class="nav-item <?php echo $page == 'notifications' ? 'active' : ''; ?>">
                <i class="fa-solid fa-bell"></i> Thông báo
            </a>
            <a href="index.php?page=settings" class="nav-item <?php echo $page == 'settings' ? 'active' : ''; ?>">
                <i class="fa-solid fa-gear"></i> Cấu hình
            </a>
        </div>
    </aside>

    <!-- MAIN CONTENT -->
    <main class="main-content">
        <!-- TOP HEADER -->
        <header class="top-header">
            <div class="header-title">
                <?php 
                    $titles = [
                        'dashboard' => 'Dashboard Tổng Quan',
                        'movies' => 'Quản Lý Phim Điện Ảnh',
                        'showtimes' => 'Lịch Chiếu & Khung Giờ',
                        'rooms' => 'Sơ Đồ Phòng Chiếu',
                        'bookings' => 'Giao Dịch Bán Vé',
                        'reward-exchanges' => 'Quản Lý Đổi Quà Tặng',
                        'users' => 'Tài Khoản Người Dùng',
                        'promotions' => 'Mã Giảm Giá & Combo',
                        'inventory' => 'Quản Lý Kho Nguyên Liệu',
                        'reports' => 'Báo cáo & Thống kê Chi tiết',
                        'checkin' => 'Soát vé QR Code',
                        'tickets' => 'Quản Lý Lịch Sử Vé',
                        'notifications' => 'Broadcast & Alerts',
                        'settings' => 'System Settings'
                    ];
                    echo $titles[$page] ?? 'Control Panel';
                ?>
            </div>
            
            <div class="header-user">
                <div class="user-info" style="text-align: right;">
                    <span class="user-name" id="admin-fullname">Loading...</span>
                    <span class="user-role">System Admin</span>
                </div>
                <img src="https://ui-avatars.com/api/?name=Admin&background=random" id="admin-avatar" class="user-avatar" alt="Avatar">
                
                <button class="btn btn-logout" onclick="logoutAdmin()" style="margin-left: 15px; padding: 6px 14px;">
                    <i class="fa-solid fa-power-off"></i>
                </button>
            </div>
        </header>

        <!-- Dynamic Body Page Content starts here -->
        <div class="page-body">
