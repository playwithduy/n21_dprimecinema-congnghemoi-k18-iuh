(() => {
  const API_BASE = window.location.origin + "/api";

  async function doLogin() {

    const login =
      document.getElementById("loginInput").value.trim();

    const password =
      document.getElementById("password").value.trim();

    const login_type =
      document.getElementById("loginType").value;

    const errorBox =
      document.getElementById("error");

    try {

      errorBox.style.display = "none";
      errorBox.innerText = "";

      const submitBtn =
        document.querySelector("button[type='submit']");

      if (submitBtn) {

        submitBtn.disabled = true;

        submitBtn.innerHTML =
          `<i class="fa fa-spinner fa-spin"></i> ĐANG XỬ LÝ...`;
      }

      const res = await fetch(
        `${API_BASE}/auth/login`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            login,
            login_type,
            password
          })
        }
      );

      let data = {};

      try {

        data = await res.json();

      } catch (e) {

        throw new Error(
          "API trả dữ liệu không hợp lệ"
        );
      }

      if (!res.ok) {

        throw new Error(
          data.message || "Đăng nhập thất bại"
        );
      }

      /* SAVE TOKEN */

      localStorage.setItem(
        "token",
        data.token
      );

      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      /* NOTIFICATION */

      const notifyKey =
        "app_notifications";

      const existing =
        JSON.parse(
          localStorage.getItem(notifyKey) || "[]"
        );

      existing.unshift({

        id: Date.now(),

        message:
          `Chào mừng ${data.user.fullname}! 🎉`,

        type: "success",

        read: false,

        time: new Date().toLocaleString("vi-VN")
      });

      localStorage.setItem(
        notifyKey,
        JSON.stringify(existing.slice(0, 20))
      );

      /* REDIRECT */

      const params =
        new URLSearchParams(
          window.location.search
        );

      const redirect =
        params.get("redirect");

      const showtimeId =
        params.get("showtime_id");

      if (redirect === "booking-seat") {

        window.location.href =
          `index.php?p=Ym9va2luZy1zZWF0` +
          (showtimeId
            ? `&showtime_id=${showtimeId}`
            : "");

        return true;
      }

      window.location.href =
        "index.php?p=YWNjb3VudA==";

      return true;

    } catch (err) {

      console.error(
        "LOGIN ERROR:",
        err
      );

      errorBox.style.display =
        "block";

      errorBox.innerText =
        err.message;

      return false;

    } finally {

      const submitBtn =
        document.querySelector("button[type='submit']");

      if (submitBtn) {

        submitBtn.disabled = false;

        submitBtn.innerHTML =
          "ĐĂNG NHẬP";
      }
    }
  }

  window.doLogin = doLogin;
})();