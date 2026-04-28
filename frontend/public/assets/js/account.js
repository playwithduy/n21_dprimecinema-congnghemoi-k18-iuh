(function() {
    "use strict";

    const API_BASE = window.location.origin + "/api";
    const AUTH_API = `${API_BASE}/auth`;
    const MOVIE_API = `${API_BASE}/movies`;
    const BOOKING_API = `${API_BASE}/booking`;
    const SHOWTIME_API = `${API_BASE}/showtimes`;

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
            if (sectionId === "section-membership") loadMembership();
            if (sectionId === "section-points") loadPoints();
            if (sectionId === "section-payment-pin") checkPinStatus();
            if (sectionId === "section-coupon") loadCoupons();
            if (sectionId === "section-history") loadTransactionHistory();
        });
    });

    // ================= REWARD POINTS =================
    async function loadPoints() {
        try {
            const res = await fetch(`${AUTH_API}/me`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            
            const points = data.reward_points || 0;
            const spending = parseFloat(data.total_spending || 0);
            
            // Calculate progress to next point (each 100k)
            const currentMod = spending % 100000;
            const percent = (currentMod / 100000) * 100;

            const displayPoints = document.getElementById("display-points-large");
            const nextPointVal = document.getElementById("next-point-val");
            const nextPointFill = document.getElementById("next-point-fill");

            if (displayPoints) displayPoints.textContent = points;
            if (nextPointVal) nextPointVal.textContent = `${new Intl.NumberFormat('vi-VN').format(currentMod)} / 100.000 đ`;
            if (nextPointFill) nextPointFill.style.width = `${percent}%`;

            // Note: In a real system, you'd fetch points history from a separate table.
            // For now, we'll show a sample history if points > 0.
            const historyBody = document.getElementById("points-history-body");
            if (historyBody && points > 0) {
                // We'll just show the last transaction as an example
                historyBody.innerHTML = `
                    <tr>
                        <td>${new Date().toLocaleDateString('vi-VN')}</td>
                        <td>Tích điểm mua vé</td>
                        <td>---</td>
                        <td style="color:#f1c40f; font-weight:bold;">+${points} P</td>
                    </tr>
                `;
            }

        } catch (err) {
            console.error("Load points failed", err);
        }
    }

    // ================= MEMBERSHIP =================
    async function loadMembership() {
        const container = document.getElementById("membership-card-container");
        if (!container) return;

        try {
            // Re-fetch user to get latest spending/rank
            const res = await fetch(`${AUTH_API}/me`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            
            const spending = parseFloat(data.total_spending || 0);
            
            // Sử dụng Unicode Escape để tránh lỗi font/mã hóa (Đồng, Bạc, Vàng...)
            const RANK_NAMES = {
                DONG: "\u0110\u1ed3ng",
                BAC: "B\u1ea1c",
                VANG: "V\u00e0ng",
                KIM_CUONG: "Kim c\u01b0\u01a1ng",
                RUBY: "Ruby"
            };

            const rank = data.membership_rank || RANK_NAMES.DONG;
            
            let nextRank = RANK_NAMES.BAC;
            let nextGoal = 500000;
            let currentGoal = 0;
            let discount = '0%';
            let cardClass = 'card-dong';

            if (rank === RANK_NAMES.RUBY) {
                nextRank = 'T\u1ed0I \u0110A';
                nextGoal = spending;
                discount = '50%';
                cardClass = 'card-ruby';
            } else if (rank === RANK_NAMES.KIM_CUONG) {
                nextRank = RANK_NAMES.RUBY;
                nextGoal = 20000000;
                currentGoal = 10000000;
                discount = '30%';
                cardClass = 'card-kimcuong';
            } else if (rank === RANK_NAMES.VANG) {
                nextRank = RANK_NAMES.KIM_CUONG;
                nextGoal = 10000000;
                currentGoal = 2000000;
                discount = '20%';
                cardClass = 'card-vang';
            } else if (rank === RANK_NAMES.BAC) {
                nextRank = RANK_NAMES.VANG;
                nextGoal = 2000000;
                currentGoal = 500000;
                discount = '10%';
                cardClass = 'card-bac';
            } else {
                nextRank = RANK_NAMES.BAC;
                nextGoal = 500000;
                currentGoal = 0;
                discount = '0%';
                cardClass = 'card-dong';
            }

            const percent = rank === 'Ruby' ? 100 : Math.min(100, Math.max(0, ((spending - currentGoal) / (nextGoal - currentGoal)) * 100));

            let rankIcon = 'fa-seedling';
            if (rank === 'Ruby') rankIcon = 'fa-fire';
            else if (rank === 'Kim cương') rankIcon = 'fa-gem';
            else if (rank === 'Vàng') rankIcon = 'fa-crown';
            else if (rank === 'Bạc') rankIcon = 'fa-star';

            container.innerHTML = `
                <div class="membership-card ${cardClass}">
                    <i class="fa-solid ${rankIcon} card-icon-bg"></i>
                    <div class="card-header">
                        <div class="card-logo">D-PRIME <span>CINEMA</span></div>
                    </div>
                    <div class="card-chip"></div>
                    <div class="card-body">
                        <h3>${data.fullname}</h3>
                    </div>
                    <div class="card-footer">
                        <div class="spending-info">
                            <p>TỔNG CHI TIÊU</p>
                            <b>${new Intl.NumberFormat('vi-VN').format(spending)} đ</b>
                        </div>
                        <div class="benefit-info">
                            <span>${discount}</span>
                            <small>GIẢM GIÁ VÉ</small>
                        </div>
                    </div>
                </div>

                <div class="progress-container">
                    <div class="progress-header">
                        <span>Tiến trình lên hạng <b>${nextRank}</b></span>
                        <span>${new Intl.NumberFormat('vi-VN').format(spending)} / ${new Intl.NumberFormat('vi-VN').format(nextGoal)}</span>
                    </div>
                    <div class="progress-bar-bg">
                        <div class="progress-bar-fill" style="width: ${percent}%"></div>
                    </div>
                    <p style="font-size:12px; color:#94a3b8; margin-top:10px; text-align:center;">
                        ${rank === 'Ruby' ? 'Bạn đã đạt hạng cao nhất!' : `Cần chi thêm <b>${new Intl.NumberFormat('vi-VN').format(nextGoal - spending)} đ</b> để lên hạng <b>${nextRank}</b>`}
                    </p>
                </div>
            `;

        } catch (err) {
            container.innerHTML = `<div class="error-cell">Lỗi tải thông tin thẻ.</div>`;
        }
    }

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
            const fullnameEl = document.getElementById("fullname");
            const infoName = document.getElementById("info-name");
            const infoEmail = document.getElementById("info-email");
            const infoPhone = document.getElementById("info-phone");
            const infoBirthday = document.getElementById("info-birthday");
            const infoGender = document.getElementById("info-gender");
            const infoRegion = document.getElementById("info-region");
            const infoCinema = document.getElementById("info-cinema");
            
            const infoRank = document.getElementById("info-rank");
            const infoSpending = document.getElementById("info-total-spending");
            const infoPoints = document.getElementById("info-reward-points");

            if (fullnameEl) fullnameEl.textContent = data.fullname || "Khách hàng";
            if (infoName) infoName.textContent = data.fullname || "---";
            if (infoEmail) infoEmail.textContent = data.email || "---";
            if (infoPhone) infoPhone.textContent = data.phone || "---";
            if (infoBirthday) infoBirthday.textContent = data.birthday ? new Date(data.birthday).toLocaleDateString('vi-VN') : "---";
            if (infoGender) infoGender.textContent = data.gender || "---";
            if (infoRegion) infoRegion.textContent = data.region || "---";
            if (infoCinema) infoCinema.textContent = data.favorite_cinema || "---";
            
            if (infoRank) infoRank.textContent = data.membership_rank || "Đồng";
            if (infoSpending) infoSpending.textContent = new Intl.NumberFormat('vi-VN').format(data.total_spending || 0) + " đ";
            if (infoPoints) infoPoints.textContent = (data.reward_points || 0) + " P";

            if (data.avatar) {
                const avatarImg = document.getElementById("avatar-img");
                if (avatarImg) avatarImg.src = getAssetUrl(data.avatar);
            }
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
        const avatarUrl = data.avatar ? `${API_BASE}/auth${data.avatar}` : fallback;

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
        const res = await fetch(`${SHOWTIME_API}/cities`);
        const cities = await res.json();
        const select = document.getElementById("edit-city");
        if (!select) return;
        select.innerHTML = '<option value="">Chọn Tỉnh/Thành</option>';
        cities.forEach(c => {
            const opt = document.createElement("option");
            opt.value = c.name; opt.textContent = c.name;
            if (c.name === selected) opt.selected = true;
            select.appendChild(opt);
        });
    }

    async function loadCinemas(selected) {
        const res = await fetch(`${SHOWTIME_API}/cinemas`);
        const cinemas = await res.json();
        const select = document.getElementById("edit-cinema");
        if (!select) return;
        select.innerHTML = '<option value="">Chọn rạp yêu thích</option>';
        cinemas.forEach(c => {
            const opt = document.createElement("option");
            opt.value = c.name; opt.textContent = c.name;
            if (c.name === selected) opt.selected = true;
            select.appendChild(opt);
        });
    }

    const formProfile = document.getElementById("form-update-profile");
    if (formProfile) {
        // Restrict phone field to digits and plus symbol
        const editPhone = document.getElementById("edit-phone");
        if (editPhone) {
            editPhone.addEventListener('input', function() {
                this.value = this.value.replace(/[^\d+]/g, '');
            });
        }

        // Limit birthday date picker to max 16 years ago
        const editBirthday = document.getElementById("edit-birthday");
        if (editBirthday) {
            const maxDate = new Date();
            maxDate.setFullYear(maxDate.getFullYear() - 16);
            const yyyy = maxDate.getFullYear();
            const mm = String(maxDate.getMonth() + 1).padStart(2, '0');
            const dd = String(maxDate.getDate()).padStart(2, '0');
            editBirthday.max = `${yyyy}-${mm}-${dd}`;
        }

        formProfile.addEventListener("submit", async (e) => {
            e.preventDefault();
            const fd = new FormData(formProfile);
            const data = Object.fromEntries(fd.entries());

            // Phone Validation
            const phoneRegex = /^(0|\+84)[3|5|7|8|9][0-9]{8}$/;
            if (data.phone && !phoneRegex.test(data.phone)) {
                alert("❌ Số điện thoại không đúng định dạng Việt Nam (Bắt đầu bằng 0 hoặc +84, theo sau bởi 3, 5, 7, 8, 9 và 8 chữ số tiếp theo).");
                return;
            }

            // Age Validation (Min 16)
            if (data.birthday) {
                const birthDate = new Date(data.birthday);
                const today = new Date();
                let age = today.getFullYear() - birthDate.getFullYear();
                const m = today.getMonth() - birthDate.getMonth();
                if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                    age--;
                }
                if (age < 16) {
                    alert("❌ Bạn phải từ 16 tuổi trở lên mới được cập nhật thông tin.");
                    return;
                }
            }

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
