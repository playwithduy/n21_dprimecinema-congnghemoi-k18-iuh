<div class="page-header">
    <h2>Khuyến Mãi & Dịch Vụ Đi Kèm</h2>
    <div class="header-actions">
        <button class="btn btn-primary" id="btn-add-coupon" onclick="openCouponModal()"><i class="fa-solid fa-plus"></i> Tạo Mã Giảm Giá</button>
        <button class="btn btn-primary" id="btn-add-combo" onclick="openComboModal()" style="display:none; background: linear-gradient(90deg, #f1c40f, #f39c12); color:#000;"><i class="fa-solid fa-box-open"></i> Thêm Combo Mới</button>
    </div>
</div>

<div class="tabs-container">
    <div class="tab-btn active" onclick="switchTab('coupons')">
        <i class="fa-solid fa-ticket"></i> Mã Giảm Giá
    </div>
    <div class="tab-btn" onclick="switchTab('combos')">
        <i class="fa-solid fa-popcorn"></i> Combos / Đồ Ăn
    </div>
</div>

<div class="content-panel tab-content active" id="tab-coupons">
    <table class="admin-table">
        <thead>
            <tr>
                <th>Mã Code</th>
                <th>Tên</th>
                <th>Giá trị giảm</th>
                <th>Đã dùng</th>
                <th>Trạng thái</th>
                <th width="80" style="text-align: right">Xoá</th>
            </tr>
        </thead>
        <tbody id="coupons-tbody">
            <tr><td colspan="6" class="loading-cell"><i class="fa-solid fa-spinner fa-spin"></i> Đang tải...</td></tr>
        </tbody>
    </table>
</div>

<div class="content-panel tab-content" id="tab-combos" style="display: none;">
    <table class="admin-table">
        <thead>
            <tr>
                <th width="60">ID</th>
                <th width="120">Hình ảnh</th>
                <th>Tên Combo</th>
                <th>Mô tả</th>
                <th>Giá Bán (VNĐ)</th>
                <th width="120" style="text-align: right">Thao tác</th>
            </tr>
        </thead>
        <tbody id="combos-tbody">
            <tr><td colspan="6" class="loading-cell"><i class="fa-solid fa-spinner fa-spin"></i> Đang tải...</td></tr>
        </tbody>
    </table>
</div>

<!-- Modal Tạo Coupon -->
<div id="couponModal" class="modal-overlay" style="display:none">
    <div class="modal-box" style="max-width:480px">
        <div class="modal-header">
            <h3>Tạo Mã Giảm Giá Mới</h3>
            <button class="close-btn" onclick="closeCouponModal()"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <div class="modal-body">
            <div class="form-group">
                <label>Mã Code *</label>
                <input type="text" id="cp_code" class="form-control" placeholder="VD: SUMMER2026" style="text-transform:uppercase">
            </div>
            <div class="form-group">
                <label>Tên / Mô tả mã *</label>
                <input type="text" id="cp_name" class="form-control" placeholder="VD: Khuyến mãi hè 2026">
            </div>
            <div class="form-group">
                <label>Giá trị giảm (VNĐ) *</label>
                <input type="number" id="cp_value" class="form-control" placeholder="VD: 50000" min="1000">
            </div>
        </div>
        <div class="modal-footer">
            <button class="btn btn-secondary" onclick="closeCouponModal()">Huỷ</button>
            <button class="btn btn-primary" onclick="saveCoupon()"><i class="fa-solid fa-floppy-disk"></i> Tạo Mã</button>
        </div>
    </div>
</div>

<!-- Modal Thêm Combo -->
<div id="comboModal" class="modal-overlay" style="display:none">
    <div class="modal-box" style="max-width:480px; border-top: 4px solid #f1c40f;">
        <div class="modal-header">
            <h3 id="combo_modal_title">Thêm Combo Mới</h3>
            <button class="close-btn" onclick="closeComboModal()"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <div class="modal-body">
            <input type="hidden" id="cb_id" value="">
            <div class="form-group">
                <label>Tên Combo *</label>
                <input type="text" id="cb_name" class="form-control" placeholder="VD: PREMIUM COMBO">
            </div>
            <div class="form-group">
                <label>Mô tả chi tiết</label>
                <input type="text" id="cb_desc" class="form-control" placeholder="VD: 1 Bắp + 2 Nước">
            </div>
            <div class="form-group">
                <label>Giá bán (VNĐ) *</label>
                <input type="number" id="cb_price" class="form-control" placeholder="VD: 125000" min="0">
            </div>
        </div>
        <div class="modal-footer">
            <button class="btn btn-secondary" onclick="closeComboModal()">Huỷ</button>
            <button class="btn btn-primary" onclick="saveCombo()" style="background: linear-gradient(90deg, #f1c40f, #f39c12); color:#000;"><i class="fa-solid fa-floppy-disk"></i> Lưu Thay Đổi</button>
        </div>
    </div>
</div>

<style>
    .page-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; }
    .page-header h2 { font-size:20px; font-weight:700; color:#fff; }
    
    .tabs-container { display:flex; gap:10px; margin-bottom:24px; border-bottom:1px solid var(--border-color); padding-bottom:8px; }
    .tab-btn { padding:10px 20px; font-size:14px; font-weight:600; color:var(--text-muted); cursor:pointer; border-radius:8px; transition:all 0.2s; display:flex; align-items:center; gap:8px; }
    .tab-btn:hover { background:rgba(255,255,255,0.05); color:#fff; }
    .tab-btn.active { background:var(--primary); color:#fff; box-shadow:0 4px 15px rgba(229, 9, 20, 0.3); }

    .content-panel { background:var(--surface); border:1px solid var(--border-color); border-radius:12px; overflow:hidden; animation: fadeIn 0.3s ease; }
    
    @keyframes fadeIn { from {opacity:0; transform:translateY(10px)} to {opacity:1; transform:translateY(0)} }

    .admin-table { width:100%; border-collapse:collapse; text-align:left; }
    .admin-table th { padding:14px 20px; font-size:12px; text-transform:uppercase; letter-spacing:1px; color:var(--text-muted); border-bottom:1px solid var(--border-color); background:rgba(0,0,0,0.2); }
    .admin-table td { padding:14px 20px; font-size:14px; border-bottom:1px solid var(--border-color); vertical-align:middle; color:#cbd5e1; }
    .admin-table tbody tr:hover { background:rgba(255,255,255,0.02); }
    .loading-cell { text-align:center; padding:40px; color:var(--text-muted); }
    
    .coupon-code-cell { font-family:monospace; font-weight:800; font-size:16px; color:var(--primary); letter-spacing:2px; background:rgba(229,9,20,0.1); padding:4px 10px; border-radius:6px; }
    .combo-image { width:60px; height:60px; object-fit:contain; border-radius:8px; background:rgba(0,0,0,0.3); padding:4px; }
    
    .action-btn { background:none; border:none; color:var(--text-muted); cursor:pointer; padding:8px; font-size:15px; border-radius:6px; transition:all 0.2s; }
    .action-btn:hover { background:rgba(255,255,255,0.1); color:#fff; }
    .action-btn.delete:hover { background:rgba(231,76,60,0.1); color:#e74c3c; }
    .action-btn.edit:hover { background:rgba(241,196,15,0.1); color:#f1c40f; }

    .modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.8); z-index:1000; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(5px); }
    .modal-box { background:var(--bg-darker); border:1px solid var(--border-color); border-radius:16px; width:100%; box-shadow:0 20px 40px rgba(0,0,0,0.5); display:flex; flex-direction:column; max-height:90vh; }
    .modal-header { padding:20px 24px; border-bottom:1px solid var(--border-color); display:flex; justify-content:space-between; align-items:center; }
    .modal-header h3 { font-size:18px; color:#fff; }
    .close-btn { background:none; border:none; color:var(--text-muted); font-size:20px; cursor:pointer; }
    .close-btn:hover { color:#ff4757; }
    .modal-body { padding:24px; overflow-y:auto; }
    .modal-footer { padding:16px 24px; border-top:1px solid var(--border-color); display:flex; justify-content:flex-end; gap:12px; }
    .form-group { margin-bottom:16px; flex:1; }
    .form-group label { display:block; font-size:12px; color:var(--text-muted); margin-bottom:8px; font-weight:600; text-transform:uppercase; letter-spacing:0.5px; }
    .form-control { width:100%; padding:12px 16px; background:var(--surface); border:1px solid var(--border-color); border-radius:8px; color:#fff; font-size:14px; outline:none; transition:0.2s; }
    .form-control:focus { border-color:var(--primary); box-shadow:0 0 0 2px rgba(229,9,20,0.2); }
</style>

<script>
// Tab Switching
function switchTab(tabId) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.style.display = 'none');
    
    // Set active tab
    const activeBtn = Array.from(document.querySelectorAll('.tab-btn')).find(el => el.innerText.toLowerCase().includes(tabId === 'coupons' ? 'mã' : 'combo'));
    if(activeBtn) activeBtn.classList.add('active');
    
    document.getElementById(`tab-${tabId}`).style.display = 'block';

    // Toggle header buttons
    document.getElementById('btn-add-coupon').style.display = tabId === 'coupons' ? 'inline-flex' : 'none';
    document.getElementById('btn-add-combo').style.display = tabId === 'combos' ? 'inline-flex' : 'none';

    if(tabId === 'combos') loadCombos();
    else loadCoupons();
}

// ─────────────────────────────────────────
//  COUPONS LOGIC
// ─────────────────────────────────────────
async function loadCoupons() {
    const tbody = document.getElementById("coupons-tbody");
    try {
        const coupons = await API.get("/booking/admin/coupons");
        if (!coupons.length) {
            tbody.innerHTML = `<tr><td colspan="6" class="loading-cell">Chưa có mã giảm giá nào.</td></tr>`;
            return;
        }
        tbody.innerHTML = coupons.map(c => `
            <tr>
                <td><span class="coupon-code-cell">${c.code}</span></td>
                <td style="color:#fff;font-weight:600">${c.name}</td>
                <td style="color:#f1c40f;font-weight:700">${parseInt(c.discount_value).toLocaleString('vi-VN')} ₫</td>
                <td><span style="background:rgba(255,255,255,0.1);padding:4px 8px;border-radius:4px">${c.total_used || 0} lượt</span></td>
                <td><span style="color:${c.is_active ? '#2ecc71' : '#e74c3c'};font-weight:600"><i class="fa-solid fa-circle" style="font-size:8px;margin-right:4px"></i>${c.is_active ? 'Active' : 'Offline'}</span></td>
                <td style="text-align: right">
                    <button class="action-btn delete" title="Xoá mã" onclick="deleteCoupon('${c.code}')"><i class="fa-solid fa-trash-can"></i></button>
                </td>
            </tr>`).join("");
    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="6" class="loading-cell" style="color:#e74c3c">Lỗi: ${err.message}</td></tr>`;
    }
}

function openCouponModal() { document.getElementById("couponModal").style.display = "flex"; }
function closeCouponModal() { document.getElementById("couponModal").style.display = "none"; }

async function saveCoupon() {
    const code = document.getElementById("cp_code").value.trim().toUpperCase();
    const name = document.getElementById("cp_name").value.trim();
    const discount_value = document.getElementById("cp_value").value;
    if (!code || !name || !discount_value) { showToast("Vui lòng điền đầy đủ thông tin!", "error"); return; }

    try {
        await API.post("/booking/admin/coupons", { code, name, discount_value: parseFloat(discount_value) });
        showToast(`Đã tạo mã "${code}" thành công!`);
        closeCouponModal();
        document.getElementById("cp_code").value = ""; document.getElementById("cp_name").value = ""; document.getElementById("cp_value").value = "";
        loadCoupons();
    } catch (err) {
        showToast("Lỗi: " + err.message, "error");
    }
}

async function deleteCoupon(code) {
    showConfirm(`Xoá vĩnh viễn mã <strong>${code}</strong>?`, async () => {
        try {
            await API.delete(`/booking/admin/coupons/${code}`);
            showToast(`Đã xoá mã ${code}`);
            loadCoupons();
        } catch (err) { showToast("Lỗi: " + err.message, "error"); }
    });
}

// ─────────────────────────────────────────
//  COMBOS LOGIC
// ─────────────────────────────────────────
async function loadCombos() {
    const tbody = document.getElementById("combos-tbody");
    try {
        const combos = await API.get("/booking/admin/combos");
        if (!combos.length) {
            tbody.innerHTML = `<tr><td colspan="6" class="loading-cell">Chưa có combo nào.</td></tr>`;
            return;
        }
        tbody.innerHTML = combos.map(cb => `
            <tr>
                <td style="font-weight:700;color:var(--text-muted)">#${cb.id}</td>
                <td><img src="${window.location.protocol}//${window.location.hostname}/assets/images/combo/${cb.image || 'combo1.png'}" class="combo-image" onerror="this.src='https://ui-avatars.com/api/?name=Combo&background=random'"></td>
                <td style="color:#fff;font-weight:700">${cb.name}</td>
                <td style="font-size:13px">${cb.description || '<i>Không có mô tả</i>'}</td>
                <td style="color:#2ecc71;font-weight:800;font-size:16px">${parseInt(cb.price).toLocaleString('vi-VN')} ₫</td>
                <td style="text-align: right">
                    <button class="action-btn edit" title="Chỉnh sửa combo" onclick="openComboModal(${cb.id}, '${cb.name.replace(/'/g, "\\'")}', '${(cb.description||'').replace(/'/g, "\\'")}', ${cb.price})"><i class="fa-solid fa-pen-to-square"></i></button>
                    <button class="action-btn delete" title="Xoá combo" onclick="deleteCombo(${cb.id})"><i class="fa-solid fa-trash-can"></i></button>
                </td>
            </tr>
        `).join("");
    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="6" class="loading-cell" style="color:#e74c3c">Lỗi tải dữ liệu combo: ${err.message}</td></tr>`;
    }
}

function openComboModal(id = null, name = '', desc = '', price = '') {
    document.getElementById("combo_modal_title").innerText = id ? "Chỉnh Sửa Combo" : "Thêm Combo Mới";
    document.getElementById("cb_id").value = id || '';
    document.getElementById("cb_name").value = name;
    document.getElementById("cb_desc").value = desc;
    document.getElementById("cb_price").value = price;
    document.getElementById("comboModal").style.display = "flex";
}
function closeComboModal() { document.getElementById("comboModal").style.display = "none"; }

async function saveCombo() {
    const id = document.getElementById("cb_id").value;
    const name = document.getElementById("cb_name").value.trim();
    const desc = document.getElementById("cb_desc").value.trim();
    const price = document.getElementById("cb_price").value;

    if(!name || !price) {
        showToast("Vui lòng điền tối thiểu Tên và Giá bán!", "error"); return;
    }

    try {
        if(id) {
            await API.put(`/booking/admin/combos/${id}`, { name, description: desc, price: parseFloat(price) });
            showToast("Cập nhật combo thành công!");
        } else {
            await API.post(`/booking/admin/combos`, { name, description: desc, price: parseFloat(price) });
            showToast("Thêm combo mới thành công!");
        }
        closeComboModal();
        loadCombos();
    } catch(err) {
        showToast("Lỗi: " + err.message, "error");
    }
}

async function deleteCombo(id) {
    showConfirm(`Vui lòng xác nhận xoá vĩnh viễn Combo #${id}?`, async () => {
        try {
            await API.delete(`/booking/admin/combos/${id}`);
            showToast(`Đã xoá Combo #${id}`);
            loadCombos();
        } catch(err) { showToast("Lỗi: " + err.message, "error"); }
    });
}

document.addEventListener("DOMContentLoaded", () => loadCoupons());
</script>
