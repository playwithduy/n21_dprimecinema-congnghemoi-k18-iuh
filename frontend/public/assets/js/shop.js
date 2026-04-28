document.addEventListener("DOMContentLoaded", function() {
    const API_BASE = window.APP_CONFIG.API_BASE;
    const AUTH_API = API_BASE + '/auth';
    const BOOKING_API = API_BASE + '/booking';
    const SHOWTIME_API = API_BASE + '/showtimes';
    const token = localStorage.getItem("token");

    if (!token) {
        window.location.href = "index.php?p=bG9naW4=";
        return;
    }

    let userPoints = 0;
    let selectedItem = null;
    let deliveryMethod = 'cinema'; // 'cinema' or 'ship'
    let currentStep = 1;

    const shopItems = [
        { id: 7, name: "Móc khóa D-Prime Gold", category: "merch", price: 5, image: "assets/images/shop/keychain.png", desc: "Móc khóa kim loại mạ vàng 24k cực sang trọng." },
        { id: 8, name: "Áo thun D-Prime Edition", category: "merch", price: 10, image: "assets/images/shop/tshirt.png", desc: "Chất liệu cotton 100% co giãn, in logo nhũ vàng." },
        { id: 9, name: "Áo khoác Bomber D-Prime", category: "merch", price: 15, image: "assets/images/shop/jacket.png", desc: "Áo khoác Bomber cao cấp, thêu logo tỉ mỉ." },
        { id: 1, name: "Voucher Giảm 50k", category: "voucher", price: 5, image: "https://images.unsplash.com/photo-1589156280159-27698a70f29e?auto=format&fit=crop&q=80&w=400", desc: "Áp dụng cho mọi hóa đơn tại rạp." },
        { id: 2, name: "Voucher Giảm 100k", category: "voucher", price: 10, image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=400", desc: "Áp dụng cho hóa đơn từ 300k." },
        { id: 3, name: "Combo Bắp & Nước", category: "combo", price: 10, image: "https://images.unsplash.com/photo-1585647347483-22b66260dfff?auto=format&fit=crop&q=80&w=400", desc: "1 Bắp lớn + 2 Nước ngọt tùy chọn." },
        { id: 4, name: "Vé Xem Phim 2D", category: "ticket", price: 15, image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=400", desc: "Đổi ngay 1 vé xem phim 2D bất kỳ." }
    ];

    // Initialize
    loadUserInfo();
    renderItems('all');

    // Filter Logic
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            renderItems(this.dataset.category);
        });
    });

    async function loadUserInfo() {
        try {
            const res = await fetch(`${AUTH_API}/me`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            if (data) {
                userPoints = data.reward_points || 0;
                document.getElementById('shop-user-points').textContent = userPoints;
                document.getElementById('shop-user-name').textContent = data.fullname;
                document.getElementById('shop-user-rank').textContent = data.membership_rank || "Đồng";
                renderItems(document.querySelector('.filter-btn.active').dataset.category);
            }
        } catch (err) { console.error(err); }
    }

    function renderItems(category) {
        const container = document.getElementById('shop-items-container');
        if (!container) return;
        const filtered = category === 'all' ? shopItems : shopItems.filter(i => i.category === category);
        container.innerHTML = filtered.map(item => `
            <div class="shop-item">
                <div class="item-img"><img src="${item.image}"><span class="item-category">${item.category}</span></div>
                <div class="item-content">
                    <h3>${item.name}</h3><p>${item.desc}</p>
                    <div class="item-footer">
                        <div class="item-price"><i class="fa-solid fa-coins"></i> ${item.price} P</div>
                        <button class="btn-exchange" ${userPoints < item.price ? 'disabled' : ''} data-id="${item.id}">
                            ${userPoints < item.price ? 'CHƯA ĐỦ ĐIỂM' : 'ĐỔI QUÀ'}
                        </button>
                    </div>
                </div>
            </div>`).join('');

        document.querySelectorAll('.btn-exchange').forEach(btn => {
            btn.addEventListener('click', () => {
                selectedItem = shopItems.find(i => i.id == btn.dataset.id);
                showExchangeModal();
            });
        });
    }

    function showExchangeModal() {
        const modal = document.getElementById('exchange-modal');
        const body = document.getElementById('exchange-modal-body');
        const confirmBtn = document.getElementById('btn-confirm-exchange');
        
        currentStep = 1;
        deliveryMethod = 'cinema';
        confirmBtn.textContent = 'TIẾP TỤC';
        confirmBtn.disabled = false;

        renderStep1(body);
        modal.classList.add('show');
    }

    function renderStep1(body) {
        body.innerHTML = `
            <div class="exchange-step active" id="step-1">
                <div class="modal-body-header">
                    <i class="fa-solid fa-gift"></i>
                    <h3>${selectedItem.name}</h3>
                    <p>Dùng <b>${selectedItem.price} P</b> để đổi quà tặng này.</p>
                </div>
                <div class="form-row"><label>Hình thức nhận quà</label></div>
                <div class="delivery-options">
                    <div class="delivery-opt active" data-method="cinema">
                        <i class="fa-solid fa-building-user"></i>
                        <span>NHẬN TẠI RẠP</span>
                    </div>
                    <div class="delivery-opt" data-method="ship">
                        <i class="fa-solid fa-truck-fast"></i>
                        <span>GIAO TẬN NHÀ</span>
                    </div>
                </div>
            </div>
            <div class="exchange-step" id="step-2"></div>
            <div class="exchange-step" id="step-3"></div>
        `;

        document.querySelectorAll('.delivery-opt').forEach(opt => {
            opt.addEventListener('click', function() {
                document.querySelectorAll('.delivery-opt').forEach(o => o.classList.remove('active'));
                this.classList.add('active');
                deliveryMethod = this.dataset.method;
            });
        });
    }

    async function renderStep2() {
        const step2 = document.getElementById('step-2');
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        
        let deliveryFields = '';
        if (deliveryMethod === 'cinema') {
            const res = await fetch(`${SHOWTIME_API}/cinemas`);
            const cinemas = await res.json();
            deliveryFields = `
                <div class="form-row">
                    <label>Chọn rạp nhận quà</label>
                    <select id="pickup-cinema">
                        ${cinemas.map(c => `<option value="${c.name}">${c.name}</option>`).join('')}
                    </select>
                </div>
            `;
        } else {
            deliveryFields = `
                <div class="form-row"><label>Họ tên người nhận</label><input type="text" id="ship-name" value="${user.fullname || ''}"></div>
                <div class="form-row"><label>Số điện thoại</label><input type="text" id="ship-phone" value="${user.phone || ''}"></div>
                <div class="form-row"><label>Email</label><input type="text" id="ship-email" value="${user.email || ''}"></div>
                <div class="form-row"><label>Địa chỉ nhận hàng</label><input type="text" id="ship-addr" placeholder="Số nhà, tên đường, phường/xã..."></div>
            `;
        }

        step2.innerHTML = `
            <h4 style="margin-bottom:15px; color:#e50914; text-transform:uppercase;">Thông tin nhận quà</h4>
            <div class="exchange-form">${deliveryFields}</div>
            <div class="form-row" style="margin-top:20px;">
                <label style="text-align:center; display:block;">Xác nhận mật mã thanh toán (PIN)</label>
                <div class="pin-container">
                    <input type="password" maxlength="1" class="pin-digit" data-idx="0">
                    <input type="password" maxlength="1" class="pin-digit" data-idx="1">
                    <input type="password" maxlength="1" class="pin-digit" data-idx="2">
                    <input type="password" maxlength="1" class="pin-digit" data-idx="3">
                    <input type="password" maxlength="1" class="pin-digit" data-idx="4">
                    <input type="password" maxlength="1" class="pin-digit" data-idx="5">
                </div>
            </div>
        `;

        initPinInputs();
    }

    function initPinInputs() {
        const inputs = document.querySelectorAll('.pin-digit');
        inputs.forEach((input, idx) => {
            input.addEventListener('input', (e) => {
                if (e.target.value && idx < 5) inputs[idx+1].focus();
            });
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Backspace' && !e.target.value && idx > 0) inputs[idx-1].focus();
            });
        });
    }

    document.getElementById('btn-confirm-exchange').addEventListener('click', async function() {
        if (currentStep === 1) {
            currentStep = 2;
            document.getElementById('step-1').classList.remove('active');
            await renderStep2();
            document.getElementById('step-2').classList.add('active');
            this.textContent = 'XÁC NHẬN ĐỔI QUÀ';
        } else if (currentStep === 2) {
            const pin = Array.from(document.querySelectorAll('.pin-digit')).map(i => i.value).join('');
            if (pin.length < 6) { alert('Vui lòng nhập đầy đủ mã PIN 6 số.'); return; }

            this.disabled = true;
            this.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> ĐANG XỬ LÝ...';

            try {
                // 1. Verify PIN
                const vRes = await fetch(`${BOOKING_API}/payment-pin/verify`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ pin })
                });
                const vData = await vRes.json();
                if (!vRes.ok) throw new Error(vData.message || 'Mã PIN không chính xác.');

                // 2. Send Real Exchange Request to DB
                const exData = {
                    item_id: selectedItem.id,
                    item_name: selectedItem.name,
                    points_spent: selectedItem.price,
                    delivery_method: deliveryMethod,
                    pickup_cinema: deliveryMethod === 'cinema' ? document.getElementById('pickup-cinema').value : null,
                    ship_info: deliveryMethod === 'ship' ? {
                        name: document.getElementById('ship-name').value,
                        phone: document.getElementById('ship-phone').value,
                        email: document.getElementById('ship-email').value,
                        address: document.getElementById('ship-addr').value
                    } : null
                };

                const res = await fetch(`${BOOKING_API}/reward-exchanges`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify(exData)
                });
                const result = await res.json();
                if (!res.ok) throw new Error(result.error || 'Yêu cầu đổi quà thất bại.');

                // 3. Success UI
                currentStep = 3;
                document.getElementById('step-2').classList.remove('active');
                renderStep3(result.exchange_id);
                document.getElementById('step-3').classList.add('active');
                document.getElementById('btn-confirm-exchange').style.display = 'none';
                
                // Update local points
                userPoints -= selectedItem.price;
                document.getElementById('shop-user-points').textContent = userPoints;

            } catch (err) {
                alert(err.message);
                this.disabled = false;
                this.textContent = 'XÁC NHẬN ĐỔI QUÀ';
            }
        }
    });

    function renderStep3(exchangeId) {
        const step3 = document.getElementById('step-3');
        const qrContent = `EXCHANGE-${exchangeId}-${Date.now()}`;
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${qrContent}`;

        if (deliveryMethod === 'cinema') {
            const cinema = document.getElementById('pickup-cinema').value;
            step3.innerHTML = `
                <div class="success-screen">
                    <i class="fa-solid fa-circle-check success-icon"></i>
                    <h3>ĐỔI QUÀ THÀNH CÔNG!</h3>
                    <p>Vui lòng đưa mã QR này cho nhân viên tại rạp <b>${cinema}</b> để nhận quà.</p>
                    <div class="qr-placeholder"><img src="${qrUrl}"></div>
                    <p style="font-size:12px; color:#94a3b8;">Mã QR cũng đã được lưu vào mục "Quà của tôi".</p>
                </div>
            `;
        } else {
            const addr = document.getElementById('ship-addr').value;
            step3.innerHTML = `
                <div class="success-screen">
                    <i class="fa-solid fa-truck-fast success-icon" style="color:#3498db;"></i>
                    <h3>ĐANG GIAO HÀNG...</h3>
                    <p>Quà tặng sẽ được gửi đến địa chỉ:</p>
                    <p><b>${addr}</b></p>
                    <p style="margin-top:15px; font-size:13px;">Dự kiến nhận hàng sau 3-5 ngày làm việc.</p>
                </div>
            `;
        }
    }

    document.querySelectorAll('.close-modal, .btn-cancel').forEach(el => {
        el.addEventListener('click', () => {
            document.getElementById('exchange-modal').classList.remove('show');
            document.getElementById('btn-confirm-exchange').style.display = 'block';
        });
    });
});
