<?php
// Mật khẩu bảo vệ file script này
$secret_key = 'dprime@2026';

if (!isset($_GET['key']) || $_GET['key'] !== $secret_key) {
    die("<h1>Access Denied</h1>");
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = $_POST['email'] ?? '';
    if (empty($email)) {
        die("Error: Email is required.");
    }

    try {
        $pdo = new PDO('mysql:host=127.0.0.1;dbname=auth_db;charset=utf8mb4', 'root', '');
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        $stmt = $pdo->prepare("UPDATE users SET role = 'admin' WHERE email = :email");
        $stmt->execute(['email' => $email]);

        if ($stmt->rowCount() > 0) {
            echo "<div style='color:green; padding: 20px; font-size: 18px;'>✅ Đã phân quyền ADMIN thành công cho: <b>$email</b></div>";
            echo "<a href='index.php?page=login'>Go to Login</a>";
            exit;
        } else {
            echo "<div style='color:red; padding: 20px; font-size: 18px;'>❌ Không tìm thấy user nào với email: <b>$email</b></div>";
        }
    } catch (PDOException $e) {
        die("Database error: " . $e->getMessage());
    }
}
?>

<!DOCTYPE html>
<html>
<head>
    <title>Make Me Admin</title>
</head>
<body style="font-family: sans-serif; background: #111; color: #fff; padding: 50px;">
    <h2>D PRIME - Cấp Quyền Admin Tự Động</h2>
    <p>Script dùng để vượt rào cấp quyền trực tiếp vào Database cho nhanh.</p>
    <form method="POST">
        <input type="email" name="email" placeholder="Nhập email tài khoản của bạn..." required style="padding: 10px; width: 300px;">
        <button type="submit" style="padding: 10px; background: red; color: white; border: none; cursor: pointer;">Cấp Quyền Admin</button>
    </form>
</body>
</html>
