(() => {
  // ============================================================
  // payment.js  –  Thanh toán real-time (Nâng cấp Coupon & PIN)
  // ============================================================

  const API_BASE = window.location.origin + "/api/booking";
  const WS_URL = (window.APP_CONFIG && window.APP_CONFIG.WS_URL) 
      ? window.APP_CONFIG.WS_URL 
      : "ws://" + window.location.hostname + ":3005";

  let finalData = {}, bookingCode = null, ws = null, pollingInterval = null, countdownInterval = null, paymentDone = false;
  let appliedCoupon = null, discountAmount = 0;

  function formatPrice(num) { return Number(num).toLocaleString("vi-VN") + "đ"; }

  function goBackToCombo() {
      window.history.back();
  }

  document.addEventListener("DOMContentLoaded", () => {
      // Show bank panel by default since cash is removed
      const bankPanel = document.getElementById("bank-panel");
      if (bankPanel) bankPanel.style.display = "block";
      try { finalData = JSON.parse(localStorage.getItem("booking_final") || "{}"); } catch (e) { finalData = {}; }
      if (!finalData?.seats?.length) { alert("Không có dữ liệu đặt vé!"); window.location.href = "index.php?p=Ym9va2luZy1zZWF0"; return; }

      renderSummary();
      loadShowtimeInfo();
      startCountdown();
      bindMethodUI();
      connectWebSocket();
      initPinInputs();
  });

  function getCorrectUserId() {
      try {
          const u = JSON.parse(localStorage.getItem("user") || "{}");
          if (u?.id) return String(u.id);
          if (u?.user_id) return String(u.user_id);
      } catch (e) { }
      return localStorage.getItem("USER_ID") || "guest";
  }

  function getToken() { 
      return localStorage.getItem("token") || 
             localStorage.getItem("accessToken") || 
             localStorage.getItem("access_token") || 
             localStorage.getItem("jwt"); 
  }

  function renderSummary() {
      const seatHTML = (finalData.seats || []).map(s => `<span class="seat-tag">${s}</span>`).join("");
      const seatsEl = document.getElementById("sum-seats");
      if (seatsEl) seatsEl.innerHTML = seatHTML || "---";

      const currentTotal = (finalData.final_total || 0) - discountAmount;

      setText("sum-seat-total", formatPrice(finalData.seat_total || 0));
      setText("sum-combo-total", formatPrice(finalData.combo_total || 0));
      setText("sum-discount", "-" + formatPrice(discountAmount));
      setText("sum-final-total", formatPrice(currentTotal < 0 ? 0 : currentTotal));
      setText("bk-amount", formatPrice(currentTotal < 0 ? 0 : currentTotal));

      const rowDiscount = document.getElementById("row-discount");
      if (rowDiscount) rowDiscount.style.display = discountAmount > 0 ? "flex" : "none";

      const combos = finalData.combos || [];
      const comboCard = document.getElementById("combo-card");
      if (combos.length > 0) {
          if (comboCard) comboCard.style.display = "";
          const listEl = document.getElementById("sum-combo-list");
          if (listEl) listEl.innerHTML = combos.map(c => `<div class="pay-row"><span class="pr-label">${c.name} x${c.qty}</span><span class="pr-val">${formatPrice(c.price * c.qty)}</span></div>`).join("");
      } else if (comboCard) {
          comboCard.style.display = "none";
      }
  }

  async function applyCheckoutCoupon() {
      const input = document.getElementById("coupon-input");
      const msg = document.getElementById("coupon-msg");
      const code = input.value.trim().toUpperCase();

      if (!code) return;
      msg.innerText = "⏳ Đang kiểm tra...";
      msg.style.color = "#888";

      try {
          const res = await fetch(`${API_BASE}/coupons/apply`, {
              method: "POST",
              headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${getToken()}`
              },
              body: JSON.stringify({ code })
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.message);

          appliedCoupon = code;
          discountAmount = Number(data.discount_value);
          msg.innerText = "" + data.message;
          msg.style.color = "#44ff88";
          renderSummary();
      } catch (err) {
          msg.innerText = "" + err.message;
          msg.style.color = "#ff4444";
          discountAmount = 0;
          appliedCoupon = null;
          renderSummary();
      }
  }

  // ================= PIN MODAL LOGIC =================
  function initPinInputs() {
      const inputs = document.querySelectorAll(".pin-digit");
      inputs.forEach((input, index) => {
          input.addEventListener("keyup", (e) => {
              if (e.key >= 0 && e.key <= 9) {
                  if (index < 5) inputs[index + 1].focus();
              } else if (e.key === "Backspace") {
                  if (index > 0) inputs[index - 1].focus();
              }
          });
      });
  }

  function openPinModal() {
      const modal = document.getElementById("pin-modal");
      if (modal) {
          modal.style.display = "flex";
          setTimeout(() => modal.classList.add("show"), 10);
          document.querySelectorAll(".pin-digit")[0].focus();
      }
  }

  function closePinModal() {
      const modal = document.getElementById("pin-modal");
      if (modal) {
          modal.classList.remove("show");
          setTimeout(() => modal.style.display = "none", 300);
      }
  }

  async function handlePinSubmit() {
      const inputs = document.querySelectorAll(".pin-digit");
      const pin = Array.from(inputs).map(i => i.value).join("");
      const errorEl = document.getElementById("pin-error");

      if (pin.length < 6) {
          errorEl.innerText = "Vui lòng nhập đủ 6 chữ số";
          errorEl.style.display = "block";
          return;
      }

      errorEl.style.display = "none";
      setLoading(true);

      try {
          const token = getToken();
          if (!token) {
              throw new Error("Bạn chưa đăng nhập hoặc phiên làm việc đã hết hạn. Vui lòng đăng nhập lại!");
          }

          const res = await fetch(`${API_BASE}/payment-pin/verify`, {
              method: "POST",
              headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${token}`
              },
              body: JSON.stringify({ pin })
          });
          const data = await res.json();
          
          if (!res.ok) {
              // Only throw session error if the error message is related to token/authentication
              if (res.status === 401 && (data.message === "Thiếu token" || data.message === "Token không hợp lệ" || data.message === "Token sai định dạng")) {
                  throw new Error("Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại!");
              }
              throw new Error(data.message || "Mã PIN không chính xác");
          }

          // Verification successful, proceed with booking
          closePinModal();
          executeFinalBooking();

      } catch (err) {
          errorEl.innerText = "" + err.message;
          errorEl.style.display = "block";
          setLoading(false);
          // Clear inputs on failure
          inputs.forEach(i => i.value = "");
          inputs[0].focus();
      }
  }

  // ================= BOOKING FLOW =================
  function confirmPayment() {
      if (bookingCode) return;
      if (new Date(finalData.hold_until).getTime() <= Date.now()) {
          alert("⏰ Hết thời gian giữ ghế!");
          window.location.href = "index.php?p=Ym9va2luZy1zZWF0&showtime_id=" + finalData.showtime_id;
          return;
      }

      // First, verify identity with PIN
      openPinModal();
  }

  async function executeFinalBooking() {
      const method = getMethod();
      const userId = getCorrectUserId();
      const finalTotal = (finalData.final_total || 0) - discountAmount;

      try {
          const userObj = JSON.parse(localStorage.getItem("user") || "{}");
          const body = {
              user_id: userId,
              user_email: userObj.email || userObj.user_email || null,
              showtime_id: finalData.showtime_id,
              seats: finalData.seats,
              seat_total: finalData.seat_total,
              combos: finalData.combos || [],
              combo_total: finalData.combo_total || 0,
              final_total: finalTotal < 0 ? 0 : finalTotal,
              payment_method: method,
              coupon_code: appliedCoupon
          };

          const res = await fetch(`${API_BASE}/payment/create`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(body)
          });
          const data = await res.json();

          if (!res.ok || !data.success) {
              alert("ERROR" + (data.error || "Lỗi tạo đặt vé!"));
              setLoading(false);
              return;
          }

          bookingCode = data.booking_code;
          document.querySelectorAll(".pm-item").forEach(i => {
              i.style.pointerEvents = "none";
              i.style.opacity = i.dataset.method === method ? "1" : "0.4";
          });

          if (method === "cash") {
              setLoading(false);
              showSuccessOverlay(bookingCode, "Cảm ơn bạn! Vui lòng thanh toán tại quầy khi đến rạp.");
              clearBookingData();
          } else if (method === "vnpay") {
              setLoading(false);
              if (data.vnpay_url) window.location.href = data.vnpay_url;
              else alert("Lỗi kết nối VNPay");
          } else if (method === "bank_transfer") {
              setLoading(false);
              const bankPanel = document.getElementById("bank-panel");
              if (bankPanel) bankPanel.style.display = "";
              renderBankQR(data.bank_info);
              watchPaymentViaWS(bookingCode);
              startBankPolling(bookingCode);
              setText("btn-text", "Chờ xác nhận chuyển khoản...");
              const btn = document.getElementById("btn-confirm");
              if (btn) btn.style.background = "#2d7a4f";
          }
      } catch (err) {
          console.error("", err);
          alert("Lỗi kết nối máy chủ!");
          setLoading(false);
      }
  }

  // ================= UTILS =================
  async function loadShowtimeInfo() {
      const sid = finalData.showtime_id; if (!sid) return;
      try {
          const res = await fetch(`${API_BASE}/showtimes/${sid}`), data = await res.json();
          setText("pay-movie-name", data.movie_name || "");
          setText("pay-cinema-info", `${data.cinema_name || ""} • ${data.room_name || ""} • ${data.show_time || ""}`);
          setText("sum-movie", data.movie_name || "");
          setText("sum-cinema", `${data.cinema_name || ""} • ${data.room_name || ""}`);
          setText("sum-showtime", data.show_time || "");
      } catch (err) { console.error("Lỗi showtime:", err); }
  }

  function startCountdown() {
      function tick() {
          if (paymentDone) { clearInterval(countdownInterval); return; }
          const left = Math.floor((new Date(finalData.hold_until).getTime() - Date.now()) / 1000);
          if (left <= 0) { clearInterval(countdownInterval); if (!paymentDone) { alert("⏰ Hết thời gian!"); window.location.href = "index.php?p=Ym9va2luZy1zZWF0&showtime_id=" + finalData.showtime_id; } return; }
          const m = Math.floor(left / 60), s = left % 60;
          setText("pay-countdown", `${m}:${s.toString().padStart(2, "0")}`);
          const el = document.getElementById("pay-countdown"); if (el) el.style.color = left <= 60 ? "#ff4444" : "";
      }
      tick(); countdownInterval = setInterval(tick, 1000);
  }

  function bindMethodUI() {
      ["bank-panel", "vnpay-panel"].forEach(id => { const el = document.getElementById(id); if (el) el.style.display = "none"; });
      document.querySelectorAll(".pm-item").forEach(item => {
          item.addEventListener("click", () => {
              if (bookingCode) return;
              document.querySelectorAll(".pm-item").forEach(i => i.classList.remove("active"));
              item.classList.add("active");
              item.querySelector("input[type=radio]").checked = true;
              const method = item.dataset.method;
              ["bank-panel", "vnpay-panel"].forEach(id => { const el = document.getElementById(id); if (el) el.style.display = "none"; });
              const panel = document.getElementById(method + "-panel"); if (panel) panel.style.display = "";
          });
      });
      document.querySelector('.pm-item[data-method="bank_transfer"]')?.classList.add("active");
      const bp = document.getElementById("bank-panel"); if (bp) bp.style.display = "";
  }

  function getMethod() { return document.querySelector("input[name=payment_method]:checked")?.value || "bank_transfer"; }

  function connectWebSocket() {
      try {
          ws = new WebSocket(WS_URL);
          ws.onopen = () => console.log("WS connected");
          ws.onmessage = (evt) => {
              try {
                  const msg = JSON.parse(evt.data);
                  if (msg.type === "PAYMENT_SUCCESS" && msg.booking_code === bookingCode) handlePaymentSuccess("Thanh toán thành công! 🎉");
              } catch (e) { }
          };
      } catch (e) { }
  }

  function watchPaymentViaWS(code) { if (ws && ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ type: "WATCH_PAYMENT", booking_code: code })); }

  function renderBankQR(bankInfo) {
      const beforeEl = document.getElementById("bank-before-confirm"); if (beforeEl) beforeEl.style.display = "none";
      const qrSection = document.getElementById("bank-qr-section"); if (qrSection) qrSection.style.display = "";
      const amount = (finalData.final_total || 0) - discountAmount;
      const content = bookingCode;
      const qr_url = `https://img.vietqr.io/image/970422-131020047979-compact2.jpg?amount=${amount}&addInfo=${encodeURIComponent(content)}`;
      if (!bankInfo) bankInfo = { account_no: "131020047979", amount: amount, content: content, qr_url: qr_url };
      const qrImg = document.getElementById("bank-qr-img");
      if (qrImg) { 
          qrImg.src = bankInfo.qr_url; 
          qrImg.style.display = "block"; 
      }
      setText("bk-acc", bankInfo.account_no || "131020047979");
      setText("bk-amount", formatPrice(amount));
      setText("bk-content", bankInfo.content || content);
  }

  function startBankPolling(code) {
      setStatusBar("pending", "⏳ Đang chờ chuyển khoản...");
      pollingInterval = setInterval(async () => {
          if (paymentDone) { clearInterval(pollingInterval); return; }
          try {
              const res = await fetch(`${API_BASE}/payment/status/${code}`), data = await res.json();
              if (data.payment_status === "paid") handlePaymentSuccess("Xác nhận đã nhận tiền! 🎉");
          } catch (e) { }
      }, 3000);
  }

  function handlePaymentSuccess(message) {
      if (paymentDone) return; paymentDone = true;
      clearInterval(pollingInterval); clearInterval(countdownInterval);
      setStatusBar("success", "Thanh toán thành công!");
      setTimeout(() => { showSuccessOverlay(bookingCode, message); clearBookingData(); }, 800);
  }

  function showSuccessOverlay(code, message) {
      setText("overlay-code", code); setText("overlay-msg", message);
      const overlay = document.getElementById("success-overlay");
      if (overlay) { overlay.style.display = "flex"; setTimeout(() => overlay.classList.add("visible"), 10); }
  }

  function setStatusBar(state, text) {
      const dot = document.getElementById("status-dot"), el = document.getElementById("bank-status-text");
      if (dot) dot.className = "status-dot " + state; if (el) el.textContent = text;
  }

  function goHome() { window.location.href = "index.php"; }
  function clearBookingData() { localStorage.removeItem("booking_data"); localStorage.removeItem("booking_final"); }
  function setText(id, val) { const el = document.getElementById(id); if (el) el.innerText = val; }
  function setLoading(on) {
      const btn = document.getElementById("btn-confirm"), txt = document.getElementById("btn-text"), spin = document.getElementById("btn-loading");
      if (btn) btn.disabled = on; if (txt) txt.style.display = on ? "none" : ""; if (spin) spin.style.display = on ? "" : "none";
  }

  function copyBankContent() {
      const content = document.getElementById("bk-content")?.innerText || "";
      if (!content || content === "---") return;
      navigator.clipboard.writeText(content).then(() => {
          if (typeof Toast !== "undefined" && Toast.success) {
              Toast.success("Đã sao chép nội dung chuyển khoản!");
          } else {
              alert("Đã sao chép nội dung chuyển khoản!");
          }
      }).catch(err => {
          console.error("Lỗi copy:", err);
      });
  }

  // Export to window
  window.closePinModal = closePinModal;
  window.handlePinSubmit = handlePinSubmit;
  window.goBackToCombo = goBackToCombo;
  window.applyCheckoutCoupon = applyCheckoutCoupon;
  window.confirmPayment = confirmPayment;
  window.goHome = goHome;
  window.copyBankContent = copyBankContent;
})();
