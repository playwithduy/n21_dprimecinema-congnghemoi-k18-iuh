<div class="auth-page">
  <div class="auth-card auth-card--wide">

    <!-- LOGO -->
    <div class="auth-logo">
      <img src="./assets/images/logo.png" alt="D Prime Cinema">
    </div>

    <h2 class="auth-title">Đăng Ký Thành Viên</h2>
    <p class="auth-subtitle">Tạo tài khoản để đặt vé nhanh hơn và nhận ưu đãi đặc biệt!</p>

    <form id="registerForm" class="auth-form">

      <!-- 2-column row -->
      <div class="auth-row">
        <div class="auth-field">
          <label><i class="fa-solid fa-user"></i> Họ tên *</label>
          <input type="text" name="fullname" placeholder="Nhập họ và tên" required>
        </div>
        <div class="auth-field">
          <label><i class="fa-solid fa-phone"></i> Số điện thoại *</label>
          <input type="tel" name="phone" placeholder="Nhập số điện thoại" required>
        </div>
      </div>

      <div class="auth-field">
        <label><i class="fa-solid fa-envelope"></i> Email *</label>
        <input type="email" name="email" placeholder="Nhập địa chỉ email" required>
      </div>

      <div class="auth-field">
        <label><i class="fa-solid fa-lock"></i> Mật khẩu *</label>
        <div class="input-eye-wrap">
          <input type="password" name="password" id="regPassword" placeholder="Tối thiểu 6 ký tự" required>
          <i class="fa-solid fa-eye toggle-eye" id="eyeReg"></i>
        </div>
        <!-- Strength bar -->
        <div class="pwd-strength-bar"><div id="pwdBar"></div></div>
        <span class="pwd-strength-label" id="pwdLabel"></span>
      </div>

      <div class="auth-row">
        <div class="auth-field">
          <label><i class="fa-solid fa-cake-candles"></i> Ngày sinh *</label>
          <input type="date" name="birthday" required>
        </div>
        <div class="auth-field">
          <label><i class="fa-solid fa-venus-mars"></i> Giới tính *</label>
          <div class="gender-group">
            <label class="gender-opt"><input type="radio" name="gender" value="Nam" required> <span>Nam</span></label>
            <label class="gender-opt"><input type="radio" name="gender" value="Nữ"> <span>Nữ</span></label>
            <label class="gender-opt"><input type="radio" name="gender" value="Khác"> <span>Khác</span></label>
          </div>
        </div>
      </div>

      <div class="auth-row">
        <div class="auth-field">
          <label><i class="fa-solid fa-map-location-dot"></i> Khu vực *</label>
          <select name="region" id="regionSelect" required>
            <option value="">-- Chọn khu vực --</option>
            <option value="HCM">TP. Hồ Chí Minh</option>
            <option value="HN">Hà Nội</option>
          </select>
        </div>
        <div class="auth-field">
          <label><i class="fa-solid fa-film"></i> Rạp yêu thích *</label>
          <select name="favorite_cinema" id="cinemaSelect" required>
            <option value="">-- Chọn rạp --</option>
          </select>
        </div>
      </div>

      <!-- CAPTCHA -->
      <div class="auth-field">
        <label><i class="fa-solid fa-shield-halved"></i> Mã xác thực *</label>
        <div class="captcha-row">
          <canvas id="captchaCanvasReg" width="160" height="48"></canvas>
          <button type="button" class="captcha-refresh" id="refreshCaptchaReg" title="Làm mới mã">
            <i class="fa-solid fa-rotate"></i>
          </button>
          <input type="text" id="captchaInputReg" placeholder="Nhập mã" maxlength="6" autocomplete="off">
        </div>
      </div>

      <!-- Terms -->
      <label class="auth-terms">
        <input type="checkbox" id="agreeTerms" required>
        <span>Tôi đồng ý với <a href="#">Điều khoản dịch vụ</a> và <a href="#">Chính sách bảo mật</a></span>
      </label>

      <button type="submit" class="btn-auth" id="regSubmitBtn">
        <i class="fa-solid fa-user-plus"></i> Đăng ký ngay
      </button>

      <div id="error"   class="alert-message error"   style="display:none"></div>
      <div id="success" class="alert-message success" style="display:none"></div>

      <p class="auth-redirect">Đã có tài khoản? <a href="index.php?p=bG9naW4=">Đăng nhập</a></p>

    </form>
  </div>
</div>

<script>
/* ===== DATA RẠP ===== */
const cinemaData = {
  HCM: [
    "D Prime Cinema Số 12 Nguyễn Văn Bảo, P. Hạnh Thông, TP.HCM",
    "D Prime Cinema Số 20 Đường số 53, Phường An Hội Tây, TP.HCM",
    "D Prime Cinema Số 10 Nguyễn Văn Dung, Phường An Nhơn, TP.HCM"
  ],
  HN: ["D Prime Cầu Giấy", "D Prime Hai Bà Trưng", "D Prime Hà Đông"]
};

const regionSelect = document.getElementById("regionSelect");
const cinemaSelect = document.getElementById("cinemaSelect");

regionSelect.addEventListener("change", function () {
  cinemaSelect.innerHTML = '<option value="">-- Chọn rạp --</option>';
  (cinemaData[this.value] || []).forEach(c => {
    const o = document.createElement("option"); o.value = c; o.textContent = c;
    cinemaSelect.appendChild(o);
  });
});

/* ===== SHOW/HIDE PASSWORD ===== */
document.getElementById('eyeReg').addEventListener('click', function(){
  const inp = document.getElementById('regPassword');
  if (inp.type === 'password') { inp.type = 'text'; this.classList.replace('fa-eye','fa-eye-slash'); }
  else                         { inp.type = 'password'; this.classList.replace('fa-eye-slash','fa-eye'); }
});

/* ===== PASSWORD STRENGTH ===== */
document.getElementById('regPassword').addEventListener('input', function(){
  const val = this.value;
  const bar = document.getElementById('pwdBar');
  const lbl = document.getElementById('pwdLabel');
  let score = 0;
  if (val.length >= 6)  score++;
  if (val.length >= 10) score++;
  if (/[A-Z]/.test(val)) score++;
  if (/[0-9]/.test(val)) score++;
  if (/[^A-Za-z0-9]/.test(val)) score++;
  const levels = ['','Rất yếu','Yếu','Trung bình','Mạnh','Rất mạnh'];
  const colors = ['','#e53935','#fb8c00','#fdd835','#43a047','#00897b'];
  bar.style.width  = (score * 20) + '%';
  bar.style.background = colors[score] || 'transparent';
  lbl.textContent  = levels[score] || '';
  lbl.style.color  = colors[score] || '';
});

/* ===== CAPTCHA ENGINE ===== */
const cvs = document.getElementById('captchaCanvasReg');
const ctx = cvs.getContext('2d');
let currentCaptcha = '';

function rnd(a,b){ return Math.floor(Math.random()*(b-a+1))+a; }
function randomChar(){
  const c='ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  return c[Math.floor(Math.random()*c.length)];
}

function generateCaptcha(){
  currentCaptcha = Array.from({length:5}, randomChar).join('');
  drawCaptcha();
}

function drawCaptcha(){
  const W=cvs.width, H=cvs.height;
  ctx.clearRect(0,0,W,H);
  const bg=ctx.createLinearGradient(0,0,W,H);
  bg.addColorStop(0,'#1c2133'); bg.addColorStop(1,'#0b0f19');
  ctx.fillStyle=bg; ctx.fillRect(0,0,W,H);

  for(let i=0;i<5;i++){
    ctx.beginPath();
    ctx.moveTo(Math.random()*W, Math.random()*H);
    ctx.lineTo(Math.random()*W, Math.random()*H);
    ctx.strokeStyle=`rgba(${rnd(80,200)},${rnd(80,200)},${rnd(80,200)},0.45)`;
    ctx.lineWidth=1; ctx.stroke();
  }
  for(let i=0;i<40;i++){
    ctx.beginPath();
    ctx.arc(Math.random()*W, Math.random()*H, 1, 0, 2*Math.PI);
    ctx.fillStyle=`rgba(255,255,255,${Math.random()*0.35})`; ctx.fill();
  }

  const fonts=['Georgia','Courier New','Arial Black','Trebuchet MS'];
  currentCaptcha.split('').forEach((ch,i)=>{
    ctx.save();
    ctx.translate(18+i*28, H/2+rnd(-4,4));
    ctx.rotate((Math.random()-0.5)*0.55);
    ctx.font=`bold ${rnd(20,26)}px ${fonts[Math.floor(Math.random()*fonts.length)]}`;
    ctx.fillStyle=`hsl(${rnd(0,360)},90%,72%)`;
    ctx.fillText(ch,0,8);
    ctx.restore();
  });
}

generateCaptcha();
document.getElementById('refreshCaptchaReg').addEventListener('click',()=>{
  document.getElementById('captchaInputReg').value='';
  generateCaptcha();
});

/* ===== SUBMIT ===== */
document.getElementById("registerForm").addEventListener("submit", async function(e) {
  e.preventDefault();

  const userCaptcha = document.getElementById('captchaInputReg').value.trim();
  if (userCaptcha.toLowerCase() !== currentCaptcha.toLowerCase()) {
    const err = document.getElementById('error');
    err.style.display = 'block';
    err.innerText = '❌ Mã xác thực không đúng. Vui lòng thử lại.';
    generateCaptcha();
    document.getElementById('captchaInputReg').value = '';
    return;
  }

  document.getElementById("error").style.display = "none";
  document.getElementById("success").style.display = "none";

  const btn = document.getElementById('regSubmitBtn');
  btn.disabled = true;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Đang xử lý...';

  const data = Object.fromEntries(new FormData(this));

  try {
    const res = await fetch("http://127.0.0.1:3000/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    const result = await res.json();

    if (!res.ok) {
      document.getElementById("error").style.display = "block";
      document.getElementById("error").innerText = "❌ " + (result.message || "Đăng ký thất bại");
      btn.disabled = false;
      btn.innerHTML = '<i class="fa-solid fa-user-plus"></i> Đăng ký ngay';
      return;
    }

    document.getElementById("success").style.display = "block";
    document.getElementById("success").innerText = "✅ " + result.message + " Đang chuyển đến trang đăng nhập...";
    this.reset();
    cinemaSelect.innerHTML = '<option value="">-- Chọn rạp --</option>';
    generateCaptcha();
    setTimeout(() => { window.location.href = 'index.php?p=bG9naW4='; }, 2000);

  } catch(err2) {
    document.getElementById("error").style.display = "block";
    document.getElementById("error").innerText = "❌ Không kết nối được máy chủ. Vui lòng thử lại.";
    btn.disabled = false;
    btn.innerHTML = '<i class="fa-solid fa-user-plus"></i> Đăng ký ngay';
  }
});
</script>
