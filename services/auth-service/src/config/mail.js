const nodemailer = require('nodemailer');

let transporter;

function initMailer() {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) {
    console.warn("⚠️ CẢNH BÁO: Chưa cấu hình GMAIL_USER và GMAIL_PASS trong file .env. Email sẽ không được gửi đi.");
    return;
  }

  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS, // Mật khẩu ứng dụng (App Password)
    },
  });
  
  console.log("Nodemailer initiated with Gmail account:", process.env.GMAIL_USER);
}

// Gọi hàm init
initMailer();

const sendResetEmail = async (toEmail, token) => {
  if (!transporter) {
    throw new Error("Mailer is not ready");
  }

  // The link points directly to the API endpoint which will do the reset and return an HTML response
  const resetLink = `http://127.0.0.1:3000/api/auth/reset-password/confirm?token=${token}`;

  const mailOptions = {
    from: '"D PRIME CINEMA" <no-reply@dprimecinema.vn>',
    to: toEmail,
    subject: "Hỗ Trợ Khôi Phục Mật Khẩu - D PRIME CINEMA",
    html: `
      <h2>Xin chào bạn,</h2>
      <p>Chúng tôi nhận được yêu cầu khôi phục mật khẩu cho tài khoản <b>${toEmail}</b>.</p>
      <p>Để hoàn tất quá trình thiết lập lại mật khẩu tự động, vui lòng nhấn vào đường dẫn xác nhận bên dưới:</p>
      <div style="margin: 20px 0;">
        <a href="${resetLink}" style="background-color: #e50914; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">CẬP NHẬT MẬT KHẨU MỚI</a>
      </div>
      <p><i>Link này sẽ hết hạn trong 15 phút.</i></p>
      <p>Nếu bạn không yêu cầu thao tác này, vui lòng bỏ qua email.</p>
      <hr>
      <small>D PRIME CINEMA Support Team</small>
    `,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log("Đã gửi email khôi phục thành công tới:", toEmail);
  return info;
};

module.exports = {
  sendResetEmail,
};
