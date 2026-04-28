<div class="auth-page">
  <div class="auth-card">

    <!-- LOGO -->
    <div class="auth-logo">
      <a href="index.php"><img src="./assets/images/logo.png" alt="D Prime Cinema"></a>
    </div>

    <h2 class="auth-title">Khôi Phục Mật Khẩu</h2>
    <p class="auth-subtitle" style="margin-bottom: 20px;">Vui lòng nhập địa chỉ email bạn đã dùng để đăng ký. Chúng tôi sẽ gửi Link khôi phục mật khẩu.</p>

    <form id="forgotForm" class="auth-form">

      <!-- Email -->
      <div class="auth-field">
        <label><i class="fa-solid fa-envelope"></i> Email của bạn</label>
        <input type="email" id="forgotEmail" placeholder="Nhập địa chỉ email" required autocomplete="email">
      </div>

      <!-- Submit -->
      <button type="submit" class="btn-auth" id="forgotSubmitBtn" style="margin-top: 10px;">
        <i class="fa-solid fa-paper-plane"></i> Gửi yêu cầu
      </button>

      <!-- Alert -->
      <p id="forgotAlert" class="alert-message" style="display:none"></p>

      <div style="text-align: center; margin-top: 10px;">
          <!-- Back link -->
          <p class="auth-redirect">Nhớ mật khẩu? <a href="index.php?p=bG9naW4=">Đăng nhập</a></p>
      </div>
    </form>

  </div>
</div>

<script>
document.getElementById('forgotForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  
  const email = document.getElementById('forgotEmail').value.trim();
  const alertBox = document.getElementById('forgotAlert');
  const btn = document.getElementById('forgotSubmitBtn');
  
  if (!email) {
    alertBox.className = 'alert-message error';
    alertBox.innerText = '❌ Vui lòng nhập địa chỉ email.';
    alertBox.style.display = 'block';
    return;
  }
  
  // Hiệu ứng Loading
  btn.disabled = true;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Đang xử lý...';
  alertBox.style.display = 'none';

  try {
    const API_BASE = window.location.origin + "/api";
    const res = await fetch(`${API_BASE}/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });
    const result = await res.json();

    if (!res.ok) {
        alertBox.className = 'alert-message error';
        alertBox.innerText = '❌ ' + (result.message || 'Lỗi hệ thống');
        alertBox.style.display = 'block';
        btn.disabled = false;
        btn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Gửi yêu cầu';
        return;
    }

    alertBox.className = 'alert-message success';
    alertBox.innerHTML = '✅ <b>Đã gửi hướng dẫn!</b><br>Vui lòng kiểm tra hộp thư email (hoặc thư mục Spam) của bạn.';
    alertBox.style.display = 'block';
    
    // Chuyển nút bấm thành nút về login
    btn.innerHTML = '<i class="fa-solid fa-right-to-bracket"></i> Trở về đăng nhập';
    btn.disabled = false;
    
    document.getElementById('forgotForm').onsubmit = function(ev) {
        ev.preventDefault();
        window.location.href = 'index.php?p=bG9naW4=';
    };
  } catch (error) {
    alertBox.className = 'alert-message error';
    alertBox.innerText = '❌ Không thể kết nối tới máy chủ.';
    alertBox.style.display = 'block';
    
    btn.disabled = false;
    btn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Gửi lại yêu cầu';
  }
});
</script>
