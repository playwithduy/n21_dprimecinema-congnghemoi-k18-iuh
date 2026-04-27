/* auth.js — chỉ export helper, KHÔNG tự đăng ký submit listener */

/**
 * Gọi từ login.php SAU KHI validate CAPTCHA thành công.
 * Trả về true nếu login OK, throw Error nếu thất bại.
 */
async function doLogin() {
  const login      = document.getElementById("loginInput").value.trim();
  const password   = document.getElementById("password").value.trim();
  const login_type = document.getElementById("loginType").value;
  const errorBox   = document.getElementById("error");

  errorBox.style.display = "none";

  const res  = await fetch(window.location.protocol + "//" + window.location.hostname + ":3000/api/auth/login", {
    method : "POST",
    headers: { "Content-Type": "application/json" },
    body   : JSON.stringify({ login, login_type, password })
  });

  const data = await res.json();

  if (!res.ok) {
    const msg = data.message || "Đăng nhập thất bại";
    throw new Error(msg);
  }

  /* Lưu token & user */
  localStorage.setItem("token", data.token);
  localStorage.setItem("user",  JSON.stringify(data.user));

  /* Thêm thông báo chào mừng */
  const notifyKey = "app_notifications";
  const existing  = JSON.parse(localStorage.getItem(notifyKey) || "[]");
  existing.unshift({
    id     : Date.now(),
    message: `Chào mừng ${data.user.fullname}! Đăng nhập thành công 🎉`,
    type   : "success",
    read   : false,
    time   : new Date().toLocaleString("vi-VN")
  });
  localStorage.setItem(notifyKey, JSON.stringify(existing.slice(0, 20)));

  /* Redirect */
  const params      = new URLSearchParams(window.location.search);
  const redirect    = params.get("redirect");
  const showtimeId  = params.get("showtime_id");

  if (redirect === "booking-seat") {
    window.location.href = `index.php?p=Ym9va2luZy1zZWF0${showtimeId ? "&showtime_id=" + showtimeId : ""}`;
    return;
  }

  window.location.href = "index.php?p=YWNjb3VudA==";
}
