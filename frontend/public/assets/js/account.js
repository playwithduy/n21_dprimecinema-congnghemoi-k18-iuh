(function() {
    "use strict";

    const AUTH_API = window.location.protocol + "//" + window.location.hostname + ":3000/api/auth";
    const MOVIE_API = window.location.protocol + "//" + window.location.hostname + ":3000/api/movies";
    const BOOKING_API = window.location.protocol + "//" + window.location.hostname + ":3000/api/booking";

    const accountContainer = document.querySelector(".account-container");
    if (!accountContainer) return;

    const token = localStorage.getItem("token");
    let user = JSON.parse(localStorage.getItem("user") || "{}");

    if (!token) {
        window.location.href = "index.php";
        return;
    }

    // ================= MENU SWITCHING =================
    const menuItems = document.querySelectorAll(".menu-item");
    const tabs = document.querySelectorAll(".tab-content");

    menuItems.forEach(item => {
        item.addEventListener("click", function() {
            const sectionId = this.getAttribute("data-section");
            if (!sectionId) return;

            menuItems.forEach(i => i.classList.remove("active"));
            this.classList.add("active");

            tabs.forEach(tab => tab.style.display = "none");
            const targetTab = document.getElementById(sectionId);
            if (targetTab) targetTab.style.display = "block";

            if (sectionId === "section-detail") loadProfileForEdit();
            if (sectionId === "section-payment-pin") checkPinStatus();
            if (sectionId === "section-coupon") loadCoupons();
            if (sectionId === "section-history") loadTransactionHistory();
        });
    });

    // ================= LOAD USER PROFILE =================
    async function loadUser() {
        try {
            const res = await fetch(`${AUTH_API}/me`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (!res.ok) throw new Error("Lỗi tải thông tin");
            const data = await res.json();
            
            // Sync with localStorage
            localStorage.setItem("user", JSON.stringify(data));
            user = data;

            // Update UI
            setText("fullname", (data.fullname || "Thành viên").toUpperCase());
            setText("info-name", data.fullname);
            setText("info-email", data.email);
            setText("info-phone", data.phone);
            setText("info-gender", data.gender);
            setText("info-birthday", data.birthday ? new Date(data.birthday).toLocaleDateString('vi-VN') : "---");
            setText("info-region", data.region);
            setText("info-cinema", data.favorite_cinema);

            updateAvatarUI(data);
            loadCoupons();
        } catch (err) {
            console.error("❌ loadUser:", err);
        }
    }

    function setText(id, val) {
        const el = document.getElementById(id);
        if (el) el.innerText = val || "---";
    }

    function updateAvatarUI(data) {
        const fallback = "https://ui-avatars.com/api/?name=" + encodeURIComponent(data.fullname || "U") + "&background=e71a0f&color=fff";
        const avatarUrl = data.avatar ? `${window.location.protocol}//${window.location.hostname}:3000/api/auth${data.avatar}` : fallback;

        // Main Profile Avatar
        const avatarImg = document.getElementById("avatar-img");
        if (avatarImg) {
            avatarImg.onerror = () => { avatarImg.src = fallback; };
            avatarImg.src = avatarUrl;
        }

        // Header Avatar Sync
        const headerAvatarContainer = document.querySelector(".account-link");
        if (headerAvatarContainer) {
            const headerImg = headerAvatarContainer.querySelector("img.user-avatar");
            const headerIcon = headerAvatarContainer.querySelector(".user-avatar-icon");
            
            if (headerImg) {
                headerImg.src = avatarUrl;
            } else if (headerIcon && data.avatar) {
                // Change icon to img if avatar uploaded
                headerIcon.outerHTML = `<img src="${avatarUrl}" class="user-avatar">`;
            }
        }
    }

    // ================= AVATAR UPLOAD =================
    const changeBtn = document.getElementById("change-avatar-btn");
    const fileInput = document.getElementById("avatar-file-input");

    if (changeBtn && fileInput) {
        changeBtn.addEventListener("click", () => fileInput.click());

        fileInput.addEventListener("change", async function() {
            if (!this.files || this.files.length === 0) return;

            const formData = new FormData();
            formData.append("avatar", this.files[0]);

            try {
                const res = await fetch(`${AUTH_API}/avatar`, {
                    method: "POST",
                    headers: { "Authorization": `Bearer ${token}` },
                    body: formData
                });

                const result = await res.json();
                if (!res.ok) throw new Error(result.message || "Tải ảnh thất bại");

                alert("✅ Cập nhật ảnh đại diện thành công!");
                loadUser(); // Refresh UI and localStorage
            } catch (err) {
                alert("❌ Lỗi: " + err.message);
            }
        });
    }

    // ================= COUPON =================
    async function loadCoupons() {
        try {
            const res = await fetch(`${BOOKING_API}/coupons/my-coupons`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            const countEl = document.getElementById("stat-coupon-count");
            if (countEl) countEl.innerText = data.length || 0;

            const body = document.getElementById("coupon-list-body");
            if (!body) return;

            body.innerHTML = (!data || data.length === 0)
                ? '<tr><td colspan="5" style="text-align:center;padding:30px;">Bạn chưa có coupon nào.</td></tr>'
                : data.map(c => `
                    <tr>
                        <td>${c.name}</td>
                        <td><b>${c.code}</b></td>
                        <td>${new Date(c.registered_at).toLocaleDateString('vi-VN')}</td>
                        <td>${new Date(c.expiry_date).toLocaleDateString('vi-VN')}</td>
                        <td><span class="status-badge status-${c.status}">${c.status}</span></td>
                    </tr>`).join("");
        } catch (err) { console.error("❌ loadCoupons:", err); }
    }

    const formCoupon = document.getElementById("form-register-coupon");
    if (formCoupon) {
        formCoupon.addEventListener("submit", async (e) => {
            e.preventDefault();
            const input = document.getElementById("coupon-code-input");
            try {
                const res = await fetch(`${BOOKING_API}/coupons/register`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                    body: JSON.stringify({ code: input.value })
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.message);
                alert("✅ " + data.message);
                input.value = "";
                loadCoupons();
            } catch (err) { alert("❌ " + err.message); }
        });
    }

    // ================= LỊCH SỬ GIAO DỊCH =================
    async function loadTransactionHistory() {
        const body = document.getElementById("history-list-body");
        if (!body) return;
        try {
            const res = await fetch(`${BOOKING_API}/payment/my-tickets/${user.id}`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            const paid = (data || []).filter(t => t.payment_status === 'paid');
            body.innerHTML = paid.length === 0
                ? '<tr><td colspan="6" style="text-align:center;padding:30px;">Chưa có giao dịch.</td></tr>'
                : paid.map(t => `
                    <tr>
                        <td><b>${t.movie_title || 'N/A'}</b></td>
                        <td>${t.cinema_name || ''}<br><small>${t.room_name || ''}</small></td>
                        <td>${t.seats || ''}</td>
                        <td>${new Date(t.booking_date).toLocaleString('vi-VN')}</td>
                        <td><b style="color:#e71a0f;">${Number(t.total_amount).toLocaleString()} đ</b></td>
                        <td><span class="status-badge status-paid">Đã thanh toán</span></td>
                    </tr>`).join("");
        } catch (err) { console.error("❌ loadHistory:", err); }
    }

    // ================= KIỂM TRA PIN =================
    async function checkPinStatus() {
        try {
            const res = await fetch(`${BOOKING_API}/payment-pin/check`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            const group = document.getElementById("pin-old-group");
            const btn = document.querySelector("#form-payment-pin .btn-save");
            if (data.exists) {
                if (group) group.style.display = "flex";
                if (btn) btn.innerText = "CẬP NHẬT MẬT MÃ";
            } else {
                if (group) group.style.display = "none";
                if (btn) btn.innerText = "CÀI MẬT MÃ THANH TOÁN";
            }
        } catch (err) { console.error("❌ checkPin:", err); }
    }

    const formPin = document.getElementById("form-payment-pin");
    if (formPin) {
        formPin.addEventListener("submit", async (e) => {
            e.preventDefault();
            const old_pin = document.getElementById("pin-old").value;
            const pin = document.getElementById("pin-new").value;
            const confirm_pin = document.getElementById("pin-confirm").value;
            try {
                const res = await fetch(`${BOOKING_API}/payment-pin/update`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                    body: JSON.stringify({ old_pin, pin, confirm_pin })
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.message);
                alert("✅ Cập nhật mật mã thành công!");
                checkPinStatus();
            } catch (err) { alert("❌ " + err.message); }
        });
    }

    // ================= CHI TIẾT TÀI KHOẢN =================
    async function loadProfileForEdit() {
        try {
            const res = await fetch(`${AUTH_API}/me`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            setValue("edit-fullname", data.fullname);
            setValue("edit-phone", data.phone);
            const bd = document.getElementById("edit-birthday");
            if (bd) bd.value = data.birthday ? data.birthday.split('T')[0] : "";
            if (data.gender) {
                const r = document.querySelector(`input[name="gender"][value="${data.gender}"]`);
                if (r) r.checked = true;
            }
            await loadCities(data.region);
            await loadCinemas(data.favorite_cinema);
        } catch (err) { console.error("❌ loadProfileEdit:", err); }
    }

    function setValue(id, val) {
        const el = document.getElementById(id);
        if (el) el.value = val || "";
    }

    async function loadCities(selected) {
        const res = await fetch(`${MOVIE_API}/showtimes/cities`);
        const cities = await res.json();
        const select = document.getElementById("edit-city");
        if (!select) return;
        select.innerHTML = '<option value="">Chọn Tỉnh/Thành</option>';
        cities.forEach(c => {
            const opt = document.createElement("option");
            opt.value = c.city_name; opt.textContent = c.city_name;
            if (c.city_name === selected) opt.selected = true;
            select.appendChild(opt);
        });
    }

    async function loadCinemas(selected) {
        const res = await fetch(`${MOVIE_API}/showtimes/cinemas`);
        const cinemas = await res.json();
        const select = document.getElementById("edit-cinema");
        if (!select) return;
        select.innerHTML = '<option value="">Chọn rạp yêu thích</option>';
        cinemas.forEach(c => {
            const opt = document.createElement("option");
            opt.value = c.cinema_name; opt.textContent = c.cinema_name;
            if (c.cinema_name === selected) opt.selected = true;
            select.appendChild(opt);
        });
    }

    const formProfile = document.getElementById("form-update-profile");
    if (formProfile) {
        formProfile.addEventListener("submit", async (e) => {
            e.preventDefault();
            const fd = new FormData(formProfile);
            const data = Object.fromEntries(fd.entries());
            const chk = document.getElementById("check-change-pass");
            if (chk && chk.checked) {
                const np = document.getElementById("edit-new-password").value;
                const cp = document.getElementById("edit-confirm-password").value;
                if (np !== cp) { alert("❌ Mật khẩu xác nhận không khớp!"); return; }
                data.new_password = np;
            }
            try {
                const res = await fetch(`${AUTH_API}/update-profile`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                    body: JSON.stringify(data)
                });
                const result = await res.json();
                if (!res.ok) throw new Error(result.message);
                alert("✅ Cập nhật thành công!");
                loadUser();
            } catch (err) { alert("❌ " + err.message); }
        });
    }

    const chkPass = document.getElementById("check-change-pass");
    if (chkPass) {
        chkPass.addEventListener("change", function() {
            const f = document.getElementById("change-pass-fields");
            if (f) f.style.display = this.checked ? "grid" : "none";
        });
    }

    loadUser();

})();
