<div class="auth-page">
  <div class="auth-card">

    <!-- LOGO -->
    <div class="auth-logo">
      <img src="./assets/images/logo.png" alt="D Prime Cinema">
    </div>

    <h2 class="auth-title">Đăng Nhập</h2>
    <p class="auth-subtitle">Chào mừng trở lại! Vui lòng đăng nhập để tiếp tục.</p>

    <form id="loginForm" class="auth-form">
      <input type="hidden" id="loginType" value="email">

      <!-- Email / Phone -->
      <div class="auth-field">
        <label id="loginLabel"><i class="fa-solid fa-envelope"></i> Email</label>
        <input type="email" id="loginInput" placeholder="Nhập email của bạn" required autocomplete="email">
      </div>

      <!-- Password -->
      <div class="auth-field">
        <label><i class="fa-solid fa-lock"></i> Mật khẩu</label>
        <div class="input-eye-wrap">
          <input type="password" id="password" placeholder="Nhập mật khẩu" required autocomplete="current-password">
          <i class="fa-solid fa-eye toggle-eye" id="eyeLogin"></i>
        </div>
      </div>

      <!-- CAPTCHA -->
      <div class="auth-field">
        <label><i class="fa-solid fa-shield-halved"></i> Mã xác thực</label>
        <div class="captcha-row">
          <canvas id="captchaCanvas" width="160" height="48"></canvas>
          <button type="button" class="captcha-refresh" id="refreshCaptcha" title="Làm mới mã">
            <i class="fa-solid fa-rotate"></i>
          </button>
          <input type="text" id="captchaInput" placeholder="Nhập mã" maxlength="6" autocomplete="off">
        </div>
      </div>

      <!-- Switch login type -->
      <div class="login-switch">
        <span>Đăng nhập bằng</span>
        <a href="#" id="switchLogin">Số điện thoại</a>
      </div>

      <div style="text-align: right; font-size: 13px; margin-bottom: 2px;">
        <a href="index.php?p=Zm9yZ290LXBhc3N3b3Jk" style="color: #7b8099; text-decoration: none; transition: color 0.2s;" onmouseover="this.style.color='#e50914'" onmouseout="this.style.color='#7b8099'">Quên mật khẩu?</a>
      </div>

      <!-- Submit -->
      <button type="submit" class="btn-auth" id="loginSubmitBtn">
        <i class="fa-solid fa-right-to-bracket"></i> Đăng nhập
      </button>

      <!-- Error -->
      <p id="error" class="alert-message error" style="display:none"></p>

      <!-- Register link -->
      <p class="auth-redirect">Chưa có tài khoản? <a href="index.php?p=cmVnaXN0ZXI=">Đăng ký ngay</a></p>
    </form>

  </div>
</div>

<script src="assets/js/auth.js?v=<?php echo time(); ?>"></script>

<script>
/* ===== CAPTCHA ENGINE ===== */
const captchaCanvas  = document.getElementById('captchaCanvas');
const captchaCtx     = captchaCanvas.getContext('2d');
let currentCaptcha   = '';

function randomChar() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  return chars[Math.floor(Math.random() * chars.length)];
}

function generateCaptcha() {
  currentCaptcha = Array.from({length: 5}, randomChar).join('');
  drawCaptcha();
}

function drawCaptcha() {
  const W = captchaCanvas.width;
  const H = captchaCanvas.height;
  captchaCtx.clearRect(0, 0, W, H);

  /* nền gradient */
  const bg = captchaCtx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, '#1c2133');
  bg.addColorStop(1, '#0b0f19');
  captchaCtx.fillStyle = bg;
  captchaCtx.fillRect(0, 0, W, H);

  /* đường nhiễu */
  for (let i = 0; i < 5; i++) {
    captchaCtx.beginPath();
    captchaCtx.moveTo(Math.random()*W, Math.random()*H);
    captchaCtx.lineTo(Math.random()*W, Math.random()*H);
    captchaCtx.strokeStyle = `rgba(${rand(80,200)},${rand(80,200)},${rand(80,200)},0.45)`;
    captchaCtx.lineWidth = 1;
    captchaCtx.stroke();
  }

  /* điểm nhiễu */
  for (let i = 0; i < 40; i++) {
    captchaCtx.beginPath();
    captchaCtx.arc(Math.random()*W, Math.random()*H, 1, 0, 2*Math.PI);
    captchaCtx.fillStyle = `rgba(255,255,255,${Math.random()*0.35})`;
    captchaCtx.fill();
  }

  /* vẽ từng ký tự */
  const fonts = ['Georgia','Courier New','Arial Black','Trebuchet MS'];
  currentCaptcha.split('').forEach((ch, i) => {
    captchaCtx.save();
    const x = 18 + i * 28;
    const y = H/2 + rand(-4, 4);
    captchaCtx.translate(x, y);
    captchaCtx.rotate((Math.random()-0.5) * 0.55);
    captchaCtx.font = `bold ${rand(20,26)}px ${fonts[Math.floor(Math.random()*fonts.length)]}`;
    captchaCtx.fillStyle = `hsl(${rand(0,360)},90%,72%)`;
    captchaCtx.fillText(ch, 0, 8);
    captchaCtx.restore();
  });
}

function rand(min, max) { return Math.floor(Math.random()*(max-min+1))+min; }

generateCaptcha();
document.getElementById('refreshCaptcha').addEventListener('click', () => {
  document.getElementById('captchaInput').value = '';
  generateCaptcha();
});

/* ===== SHOW/HIDE PASSWORD ===== */
document.getElementById('eyeLogin').addEventListener('click', function(){
  const inp = document.getElementById('password');
  if (inp.type === 'password') { inp.type = 'text'; this.classList.replace('fa-eye','fa-eye-slash'); }
  else                         { inp.type = 'password'; this.classList.replace('fa-eye-slash','fa-eye'); }
});

/* ===== SWITCH EMAIL / PHONE ===== */
const switchBtn  = document.getElementById("switchLogin");
const loginInput = document.getElementById("loginInput");
const loginLabel = document.getElementById("loginLabel");
const loginType  = document.getElementById("loginType");
let isPhone = false;

switchBtn.addEventListener("click", e => {
  e.preventDefault();
  loginInput.value = "";
  if (!isPhone) {
    loginLabel.innerHTML = '<i class="fa-solid fa-phone"></i> Số điện thoại';
    loginInput.type = "tel"; loginInput.placeholder = "Nhập số điện thoại";
    loginInput.pattern = "[0-9]{9,11}"; loginType.value = "phone"; switchBtn.innerText = "Email";
  } else {
    loginLabel.innerHTML = '<i class="fa-solid fa-envelope"></i> Email';
    loginInput.type = "email"; loginInput.placeholder = "Nhập email của bạn";
    loginInput.removeAttribute("pattern"); loginType.value = "email"; switchBtn.innerText = "Số điện thoại";
  }
  isPhone = !isPhone;
});

/* ===== SUBMIT + VALIDATE CAPTCHA ===== */
document.getElementById('loginForm').addEventListener('submit', async function(e) {
  e.preventDefault();

  // 1. Kiểm tra CAPTCHA TRƯỚC — bắt buộc
  const userCaptcha = document.getElementById('captchaInput').value.trim();
  if (!userCaptcha) {
    const err = document.getElementById('error');
    err.style.display = 'block';
    err.innerText = '❌ Vui lòng nhập mã xác thực.';
    return;
  }
  if (userCaptcha.toLowerCase() !== currentCaptcha.toLowerCase()) {
    const err = document.getElementById('error');
    err.style.display = 'block';
    err.innerText = '❌ Mã xác thực không đúng. Vui lòng thử lại.';
    generateCaptcha();
    document.getElementById('captchaInput').value = '';
    return;
  }

  // 2. Gọi API đăng nhập
  const btn = document.getElementById('loginSubmitBtn');
  btn.disabled = true;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Đang xử lý...';

  try {
    await doLogin(); // từ auth.js
  } catch(err2) {
    const errEl = document.getElementById('error');
    errEl.style.display = 'block';
    errEl.innerText = '❌ ' + err2.message;
    generateCaptcha();
    document.getElementById('captchaInput').value = '';
    btn.disabled = false;
    btn.innerHTML = '<i class="fa-solid fa-right-to-bracket"></i> Đăng nhập';
  }
});
</script>
