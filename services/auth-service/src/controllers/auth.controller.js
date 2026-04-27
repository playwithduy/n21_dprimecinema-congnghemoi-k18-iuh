const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/user.model");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const { sendResetEmail } = require("../config/mail");

/* ================= REGISTER ================= */
exports.register = async (req, res) => {
  try {
    const {
      fullname,
      phone,
      email,
      password,
      birthday,
      gender,
      region,
      favorite_cinema
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Thiếu thông tin" });
    }

    const exists = await User.findByEmail(email);
    if (exists) {
      return res.status(409).json({ message: "Email đã tồn tại" });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    await User.create({
      fullname,
      phone,
      email,
      password: hashPassword,
      birthday,
      gender,
      region,
      favorite_cinema
    });

    res.status(201).json({ message: "Đăng ký thành công" });

  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
};


/* ================= LOGIN ================= */
exports.login = async (req, res) => {
  try {
    const { login, login_type, password } = req.body;

    if (!login || !password) {
      return res.status(400).json({ message: "Thiếu thông tin đăng nhập" });
    }

    let user;

    if (login_type === "phone") {
      user = await User.findByPhone(login);
    } else {
      user = await User.findByEmail(login);
    }

    if (!user) {
      return res.status(401).json({ message: "Tài khoản không tồn tại" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Sai mật khẩu" });
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET undefined");
      return res.status(500).json({ message: "Server config error" });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        fullname: user.fullname,
        avatar: user.avatar ? (user.avatar.includes('http') ? `/uploads/avatars/${user.avatar.split('/').pop().split('?')[0]}` : user.avatar) : null,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Đăng nhập thành công",
      token,
      user: {
        id: user.id,
        fullname: user.fullname,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar ? (user.avatar.includes('http') ? `/uploads/avatars/${user.avatar.split('/').pop().split('?')[0]}` : user.avatar) : null
      }
    });

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
};


/* ================= GET CURRENT USER ================= */
exports.me = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User không tồn tại" });
    }

    // loại bỏ password an toàn
    const { password, ...safeUser } = user;
    if (safeUser.avatar && safeUser.avatar.includes('http')) {
        safeUser.avatar = `/uploads/avatars/${safeUser.avatar.split('/').pop().split('?')[0]}`;
    }

    res.json(safeUser);

  } catch (err) {
    console.error("ME ERROR:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
};


/* ================= UPLOAD AVATAR ================= */
exports.uploadAvatar = async (req, res) => {
  try {

    if (!req.file) {
      return res.status(400).json({ message: "Chưa chọn file" });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User không tồn tại" });
    }

    // Xoá avatar cũ nếu có
    if (user.avatar) {

      const oldPath = path.join(
        __dirname,
        "../../",
        user.avatar.replace("/uploads/", "uploads/")
      );

      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    const avatarPath = `/uploads/avatars/${req.file.filename}`;

    await User.updateAvatar(req.user.id, avatarPath);

    res.json({
      message: "Upload avatar success",
      avatar: avatarPath
    });

  } catch (err) {
    console.error("UPLOAD AVATAR ERROR:", err);
    res.status(500).json({ message: "Upload avatar failed" });
  }
};

/* ================= FORGOT PASSWORD ================= */
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Vui lòng cung cấp email." });
    }

    const user = await User.findByEmail(email);
    if (!user) {
      // Vì lý do bảo mật, không báo lỗi nếu email không tồn tại
      return res.status(200).json({ message: "Đã gửi hướng dẫn! Vui lòng kiểm tra email." });
    }

    // Tạo token ngẫu nhiên
    const token = crypto.randomBytes(32).toString('hex');
    
    // Hạn sử dụng 15 phút (theo format MySQL DATETIME)
    const expiry = new Date(Date.now() + 15 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ');

    await User.setResetToken(email, token, expiry);

    // Gửi thư xác nhận
    await sendResetEmail(email, token);

    res.status(200).json({ message: "Đã gửi hướng dẫn! Vui lòng kiểm tra email." });
  } catch (err) {
    console.error("FORGOT PASSWORD ERROR:", err);
    res.status(500).json({ message: "Lỗi server khi gửi yêu cầu." });
  }
};

/* ================= CONFIRM RESET (1-CLICK) ================= */
exports.resetPasswordConfirm = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) {
      return res.send("<h2>Lỗi: Link không hợp lệ.</h2>");
    }

    const user = await User.findByResetToken(token);
    if (!user) {
      return res.send("<h2>Lỗi: Link đã hết hạn hoặc không tồn tại.</h2>");
    }

    if (new Date() > new Date(user.reset_token_expiry)) {
      return res.send("<h2>Lỗi: Link đã hết hạn (chỉ có hiệu lực trong 15 phút). Vui lòng yêu cầu lại.</h2>");
    }

    // Tự động sinh password ngẫu nhiên mới
    const randomStr = crypto.randomBytes(3).toString('hex').toUpperCase(); // 6 chars
    const newPassword = `DPrime@${randomStr}`;

    const hashPassword = await bcrypt.hash(newPassword, 10);
    await User.resetPassword(user.id, hashPassword);

    const htmlResponse = `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <title>Khôi phục mật khẩu thành công</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { background: #0b0f19; color: #fff; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; text-align: center; padding: 50px 20px; margin: 0; }
        .card { background: #1c2133; padding: 40px 30px; border-radius: 12px; border: 1px solid #ff2d2d; max-width: 450px; margin: 0 auto; box-shadow: 0 8px 30px rgba(229,9,20,0.25); }
        .success-icon { color: #00fa9a; font-size: 60px; margin-bottom: 20px; line-height: 1; }
        h1 { color: #e50914; margin-top: 0; font-size: 26px; font-weight: 800; letter-spacing: 1px;}
        p { color: #c8cdd8; font-size: 15px; line-height: 1.5; margin-bottom: 20px; }
        .pass-box { background: #080b12; padding: 15px 25px; font-size: 28px; font-weight: bold; color: #00fa9a; letter-spacing: 3px; border-radius: 8px; margin: 20px 0; border: 2px dashed #e50914; display: inline-block; user-select: all; }
        a.btn { display: inline-block; margin-top: 25px; padding: 14px 30px; background: #e50914; color: #fff; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; transition: all 0.3s ease; text-transform: uppercase; letter-spacing: 1px; }
        a.btn:hover { background: #ff2d2d; transform: translateY(-2px); box-shadow: 0 4px 15px rgba(229,9,20,0.4); }
        .hint { color: #7b8099; font-size: 13px; margin-top: 25px; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="success-icon">✓</div>
        <h1>XÁC NHẬN THÀNH CÔNG</h1>
        <p>Hệ thống đã tự động thay đổi mật khẩu cho tài khoản <b>${user.email}</b> của bạn.</p>
        <p>Mật khẩu mới của bạn là:</p>
        <div class="pass-box">${newPassword}</div>
        <p class="hint">Vui lòng copy mật khẩu này và đổi lại mật khẩu cá nhân ngay ở lần đăng nhập tiếp theo để đảm bảo an toàn.</p>
        <a href="http://localhost/index.php?page=login" class="btn">Đến trang đăng nhập</a>
      </div>
    </body>
    </html>
    `;

    res.send(htmlResponse);
  } catch (err) {
    console.error("RESET CONFIRM ERROR:", err);
    res.send("<h2>Lỗi server khi đổi mật khẩu. Vui lòng thử lại sau.</h2>");
  }
};

/* ================= UPDATE PROFILE ================= */
exports.updateProfile = async (req, res) => {
  try {
    const {
      fullname,
      phone,
      birthday,
      gender,
      region,
      favorite_cinema,
      old_password,
      new_password
    } = req.body;

    if (!old_password) {
      return res.status(400).json({ message: "Vui lòng nhập mật khẩu hiện tại để xác nhận" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại" });
    }

    // Kiểm tra mật khẩu cũ
    const isMatch = await bcrypt.compare(old_password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Mật khẩu hiện tại không chính xác" });
    }

    let hashNewPassword = null;
    if (new_password && new_password.trim() !== "") {
      hashNewPassword = await bcrypt.hash(new_password, 10);
    }

    await User.updateProfile(req.user.id, {
      fullname,
      phone,
      birthday,
      gender,
      region,
      favorite_cinema,
      password: hashNewPassword
    });

    res.json({ message: "Cập nhật thông tin thành công" });

  } catch (err) {
    console.error("UPDATE PROFILE ERROR:", err);
    res.status(500).json({ message: "Lỗi server khi cập nhật thông tin" });
  }
};