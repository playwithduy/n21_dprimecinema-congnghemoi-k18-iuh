<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>D PRIME ADMIN - Secure Login</title>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;700;800&family=Be+Vietnam+Pro:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #07090e; color: #f1f5f9; font-family: 'Be Vietnam Pro', sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; overflow: hidden; }
        
        /* Particle Background */
        .bg-layer { position: absolute; inset: 0; background: radial-gradient(circle at 50% 50%, rgba(229, 9, 20, 0.08) 0%, rgba(0,0,0,1) 100%); z-index: 1; }
        
        /* Login Card */
        .login-box {
            position: relative;
            z-index: 2;
            width: 100%;
            max-width: 420px;
            background: #11141d;
            border: 1px solid rgba(229, 9, 20, 0.3);
            border-radius: 16px;
            padding: 40px;
            box-shadow: 0 20px 50px rgba(0,0,0,0.8), 0 0 40px rgba(229, 9, 20, 0.1) inset;
        }

        .logo-area { text-align: center; margin-bottom: 30px; }
        .logo-area img { height: 60px; margin-bottom: 10px; }
        .logo-area h2 { font-family: 'Montserrat', sans-serif; font-size: 22px; font-weight: 800; letter-spacing: 2px; }
        .logo-area h2 span { color: #e50914; }
        .logo-area p { color: #8892b0; font-size: 13px; margin-top: 5px; text-transform: uppercase; letter-spacing: 1px; }

        .input-group { margin-bottom: 24px; position: relative; }
        .input-group label { display: block; font-size: 12px; font-weight: 600; color: #a8b2d1; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 1px; }
        .input-group input { width: 100%; padding: 14px 16px 14px 44px; background: #0a0c10; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: #fff; font-size: 15px; outline: none; transition: all 0.2s; }
        .input-group input:focus { border-color: #e50914; box-shadow: 0 0 10px rgba(229,9,20,0.2); }
        .input-group i.icon { position: absolute; left: 16px; top: 40px; color: #64748b; font-size: 14px; }
        
        .btn-submit {
            width: 100%;
            padding: 14px;
            background: linear-gradient(90deg, #e50914 0%, #a2060e 100%);
            color: #fff;
            border: none;
            border-radius: 8px;
            font-size: 15px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
            cursor: pointer;
            transition: all 0.3s;
            margin-top: 10px;
        }
        .btn-submit:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(229,9,20,0.4); }
        
        .error-msg { background: rgba(229,9,20,0.1); color: #ff4757; padding: 12px; border-radius: 8px; font-size: 13px; border: 1px solid rgba(229,9,20,0.3); margin-bottom: 20px; text-align: center; display: none; }
    </style>
</head>
<body>

<div class="bg-layer"></div>

<div class="login-box">
    <div class="logo-area">
        <img src="assets/images/logo.png" alt="D Prime">
        <h2>D PRIME <span>SYSTEM</span></h2>
        <p>Restricted Operations Portal</p>
    </div>

    <div id="errorBox" class="error-msg"></div>

    <form id="adminLoginForm">
        <div class="input-group">
            <label>Administrator Email</label>
            <i class="fa-solid fa-envelope icon"></i>
            <input type="email" id="email" placeholder="admin@dprime.vn" required>
        </div>
        
        <div class="input-group">
            <label>Master Password</label>
            <i class="fa-solid fa-key icon"></i>
            <input type="password" id="password" placeholder="••••••••" required>
        </div>

        <button type="submit" class="btn-submit" id="submitBtn">
            <i class="fa-solid fa-shield-halved"></i> Verify Identity
        </button>
    </form>
</div>

<script>
    // Kiểm tra xem đã đăng nhập với vai trò Admin chưa
    if (localStorage.getItem("token") && localStorage.getItem("user")) {
        const user = JSON.parse(localStorage.getItem("user"));
        if (user.role === 'admin') {
            window.location.href = "index.php?page=dashboard";
        }
    }

    document.getElementById("adminLoginForm").addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        const btn = document.getElementById("submitBtn");
        const errBox = document.getElementById("errorBox");
        
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Authenticating...';
        btn.disabled = true;
        errBox.style.display = "none";
        
        try {
            const response = await fetch(window.location.protocol + "//" + window.location.hostname + ":3000/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ login_type: "email", login: email, password: password })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                errBox.innerText = data.message || "Tài khoản hoặc mật khẩu không đúng.";
                errBox.style.display = "block";
                btn.innerHTML = '<i class="fa-solid fa-shield-halved"></i> Verify Identity';
                btn.disabled = false;
                return;
            }
            
            // 🔥 KIỂM TRA ROLE ADMIN CHUẨN XÁC
            if (data.user.role !== 'admin') {
                errBox.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> <b>CẢNH BÁO BẢO MẬT</b><br>Tài khoản này không có quyền hạn Quản trị viên hệ thống.';
                errBox.style.display = "block";
                btn.innerHTML = '<i class="fa-solid fa-shield-halved"></i> Verify Identity';
                btn.disabled = false;
                return;
            }
            
            // Xac thuc thanh cong
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));
            
            errBox.style.display = "block";
            errBox.style.background = "rgba(46, 204, 113, 0.1)";
            errBox.style.borderColor = "#2ecc71";
            errBox.style.color = "#2ecc71";
            errBox.innerHTML = '<i class="fa-solid fa-check"></i> Truy cập thành công. Đang chuyển hướng...';
            
            setTimeout(() => {
                window.location.href = "index.php?page=dashboard";
            }, 1000);
            
        } catch(error) {
            errBox.innerText = "Lỗi kết nối đến máy chủ quản trị.";
            errBox.style.display = "block";
            btn.innerHTML = '<i class="fa-solid fa-shield-halved"></i> Verify Identity';
            btn.disabled = false;
        }
    });
</script>

</body>
</html>
