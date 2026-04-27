<!-- notifications.php -->
<div class="page-header">
    <div>
        <h2>Broadcast & Thông Báo</h2>
        <p style="color:var(--text-muted);font-size:13px;margin-top:4px;" id="notif-count">Đang tải...</p>
    </div>
    <button class="btn btn-primary" onclick="openNotifModal()">
        <i class="fa-solid fa-paper-plane"></i> Gửi Thông Báo Mới
    </button>
</div>

<!-- Danh sách lịch sử thông báo -->
<div id="notif-list">
    <div class="loading-placeholder"><i class="fa-solid fa-spinner fa-spin"></i> Đang tải lịch sử...</div>
</div>

<!-- Modal Gửi Thông Báo -->
<div id="notifModal" class="modal-overlay" style="display:none">
    <div class="modal-box" style="max-width:540px; border-top: 4px solid var(--primary);">
        <div class="modal-header">
            <h3><i class="fa-solid fa-bell" style="color:var(--primary);margin-right:8px"></i>Soạn Thông Báo Mới</h3>
            <button class="close-btn" onclick="closeNotifModal()"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <div class="modal-body">
            <div class="form-group">
                <label>Tiêu đề thông báo *</label>
                <input type="text" id="notif_title" class="form-control" placeholder="VD: Khuyến mãi cuối tuần - Giảm 30%!">
            </div>
            <div class="form-group">
                <label>Nội dung chi tiết *</label>
                <textarea id="notif_body" class="form-control" rows="5" placeholder="Nhập nội dung thông báo muốn gửi đến người dùng..."></textarea>
            </div>
            <div class="form-group">
                <label>Gửi tới đối tượng</label>
                <select id="notif_target" class="form-control">
                    <option value="all">🌐 Toàn bộ thành viên</option>
                    <option value="user">👤 Khách hàng (Member)</option>
                    <option value="admin">🔑 Quản trị viên</option>
                </select>
            </div>
            <div class="preview-box" id="notif-preview" style="display:none">
                <div class="preview-label">Xem trước thông báo</div>
                <div class="preview-content">
                    <div class="preview-title" id="preview-title">--</div>
                    <div class="preview-body" id="preview-body">--</div>
                </div>
            </div>
        </div>
        <div class="modal-footer">
            <button class="btn btn-secondary" onclick="closeNotifModal()">Huỷ</button>
            <button class="btn btn-preview" onclick="togglePreview()"><i class="fa-regular fa-eye"></i> Xem Trước</button>
            <button class="btn btn-primary" id="btn-send-notif" onclick="sendNotification()">
                <i class="fa-solid fa-paper-plane"></i> Gửi Thông Báo
            </button>
        </div>
    </div>
</div>

<style>
    .page-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:24px; }
    .page-header h2 { font-size:20px; font-weight:700; color:#fff; }
    .loading-placeholder { text-align:center; padding:60px; color:var(--text-muted); }

    /* Notification Cards */
    .notif-card {
        background: var(--surface);
        border: 1px solid var(--border-color);
        border-radius: 12px;
        padding: 20px 24px;
        margin-bottom: 12px;
        display: flex;
        gap: 16px;
        align-items: flex-start;
        transition: all 0.2s;
        animation: slideIn 0.3s ease;
        position: relative;
    }
    @keyframes slideIn { from { opacity:0; transform:translateY(10px) } to { opacity:1; transform:translateY(0) } }
    .notif-card:hover { border-color: rgba(229,9,20,0.3); background: rgba(255,255,255,0.02); }
    .notif-card.target-all { border-left: 4px solid var(--primary); }
    .notif-card.target-user { border-left: 4px solid #3498db; }
    .notif-card.target-admin { border-left: 4px solid #f1c40f; }
    
    .notif-icon {
        width: 44px; height: 44px;
        border-radius: 12px;
        display: flex; align-items: center; justify-content: center;
        font-size: 18px; flex-shrink: 0;
    }
    .notif-icon.all { background: rgba(229,9,20,0.1); color: var(--primary); }
    .notif-icon.user { background: rgba(52,152,219,0.1); color: #3498db; }
    .notif-icon.admin { background: rgba(241,196,15,0.1); color: #f1c40f; }

    .notif-content { flex: 1; min-width: 0; }
    .notif-title { font-size: 15px; font-weight: 700; color: #fff; margin-bottom: 6px; }
    .notif-body-text { font-size: 13px; color: var(--text-muted); line-height:1.5; margin-bottom: 10px; white-space: pre-wrap; }
    .notif-meta { display:flex; gap:16px; flex-wrap:wrap; align-items:center; }
    .notif-badge {
        font-size:11px; padding:2px 10px; border-radius:20px; font-weight:600;
        background: rgba(255,255,255,0.1); color: var(--text-muted);
        display:inline-flex; align-items:center; gap:4px;
    }
    .notif-badge.reach { color:#2ecc71; background:rgba(46,204,113,0.1); }
    .notif-time { font-size:12px; color:var(--text-muted); }

    .notif-delete-btn {
        background:none; border:none; color:var(--text-muted);
        cursor:pointer; padding:8px; border-radius:6px;
        font-size:15px; transition:all 0.2s; flex-shrink:0;
    }
    .notif-delete-btn:hover { background:rgba(231,76,60,0.1); color:#e74c3c; }

    .empty-state { text-align:center; padding:60px; color:var(--text-muted); }
    .empty-state i { font-size:48px; margin-bottom:16px; display:block; opacity:0.3; }

    /* Modal Styles */
    .modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.8); z-index:1000; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(5px); }
    .modal-box { background:var(--bg-darker); border:1px solid var(--border-color); border-radius:16px; width:100%; box-shadow:0 20px 40px rgba(0,0,0,0.5); display:flex; flex-direction:column; max-height:90vh; }
    .modal-header { padding:20px 24px; border-bottom:1px solid var(--border-color); display:flex; justify-content:space-between; align-items:center; }
    .modal-header h3 { font-size:18px; color:#fff; }
    .close-btn { background:none; border:none; color:var(--text-muted); font-size:20px; cursor:pointer; }
    .close-btn:hover { color:#ff4757; }
    .modal-body { padding:24px; overflow-y:auto; }
    .modal-footer { padding:16px 24px; border-top:1px solid var(--border-color); display:flex; justify-content:flex-end; gap:10px; }
    .form-group { margin-bottom:16px; }
    .form-group label { display:block; font-size:12px; color:var(--text-muted); margin-bottom:8px; font-weight:600; text-transform:uppercase; letter-spacing:0.5px; }
    .form-control { width:100%; padding:12px 16px; background:var(--surface); border:1px solid var(--border-color); border-radius:8px; color:#fff; font-size:14px; outline:none; transition:0.2s; resize:vertical; }
    .form-control:focus { border-color:var(--primary); box-shadow:0 0 0 2px rgba(229,9,20,0.15); }
    .form-control option { background:#1a1d29; }
    .btn-secondary { background:var(--surface); color:var(--text-main); border:1px solid var(--border-color); }
    .btn-preview { background:rgba(52,152,219,0.1); color:#3498db; border:1px solid rgba(52,152,219,0.3); }
    .btn-preview:hover { background:rgba(52,152,219,0.2); }

    .preview-box { border:1px dashed var(--border-color); border-radius:10px; padding:16px; margin-top:8px; background:rgba(0,0,0,0.2); }
    .preview-label { font-size:11px; text-transform:uppercase; letter-spacing:1px; color:var(--text-muted); margin-bottom:10px; }
    .preview-title { font-size:15px; font-weight:700; color:#fff; margin-bottom:6px; }
    .preview-body { font-size:13px; color:var(--text-muted); line-height:1.5; }
    .btn { display:inline-flex; align-items:center; justify-content:center; gap:8px; border:none; border-radius:8px; padding:10px 20px; font-weight:600; cursor:pointer; transition:all 0.2s; font-size:14px; }
    .btn:disabled { opacity:0.5; cursor:not-allowed; }
</style>

<script>
// ──────────────────────────────────────
//  LOAD DANH SÁCH THÔNG BÁO
// ──────────────────────────────────────
async function loadNotifications() {
    const list = document.getElementById("notif-list");
    try {
        const data = await API.get("/auth/admin/notifications");
        document.getElementById("notif-count").textContent = `${data.length} thông báo đã gửi`;

        if (!data.length) {
            list.innerHTML = `<div class="empty-state">
                <i class="fa-regular fa-bell-slash"></i>
                Chưa có thông báo nào được gửi.<br>
                <small>Nhấn <strong>"Gửi Thông Báo Mới"</strong> để bắt đầu.</small>
            </div>`;
            return;
        }

        const targetLabels = { all: '🌐 Toàn bộ thành viên', user: '👤 Khách hàng', admin: '🔑 Quản trị viên' };
        const targetIcons  = { all: 'fa-earth-asia', user: 'fa-users', admin: 'fa-user-shield' };

        list.innerHTML = data.map(n => {
            const dt = new Date(n.created_at).toLocaleString('vi-VN');
            const targetClass = n.target_type || 'all';
            const iconClass = targetIcons[targetClass] || 'fa-bell';
            return `
            <div class="notif-card target-${targetClass}" id="nc-${n.id}">
                <div class="notif-icon ${targetClass}">
                    <i class="fa-solid ${iconClass}"></i>
                </div>
                <div class="notif-content">
                    <div class="notif-title">${n.title}</div>
                    <div class="notif-body-text">${n.body}</div>
                    <div class="notif-meta">
                        <span class="notif-badge">${targetLabels[targetClass] || 'Tất cả'}</span>
                        ${n.reach_count > 0 ? `<span class="notif-badge reach"><i class="fa-solid fa-check-double"></i> Gửi đến ${n.reach_count} người</span>` : ''}
                        <span class="notif-time"><i class="fa-regular fa-clock"></i> ${dt}</span>
                    </div>
                </div>
                <button class="notif-delete-btn" title="Xoá thông báo" onclick="deleteNotif(${n.id})">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </div>`;
        }).join("");

    } catch (err) {
        list.innerHTML = `<div class="empty-state" style="color:#e74c3c"><i class="fa-solid fa-triangle-exclamation"></i>Lỗi tải dữ liệu: ${err.message}</div>`;
    }
}

// ──────────────────────────────────────
//  MODAL CONTROLS
// ──────────────────────────────────────
function openNotifModal() {
    document.getElementById("notifModal").style.display = "flex";
    document.getElementById("notif_title").focus();
}

function closeNotifModal() {
    document.getElementById("notifModal").style.display = "none";
    document.getElementById("notif_title").value = "";
    document.getElementById("notif_body").value = "";
    document.getElementById("notif_target").value = "all";
    document.getElementById("notif-preview").style.display = "none";
}

function togglePreview() {
    const box = document.getElementById("notif-preview");
    const title = document.getElementById("notif_title").value || "(Chưa có tiêu đề)";
    const body = document.getElementById("notif_body").value || "(Chưa có nội dung)";
    document.getElementById("preview-title").textContent = title;
    document.getElementById("preview-body").textContent = body;
    box.style.display = box.style.display === "none" ? "block" : "none";
}

// ──────────────────────────────────────
//  SEND NOTIFICATION
// ──────────────────────────────────────
async function sendNotification() {
    const title = document.getElementById("notif_title").value.trim();
    const body = document.getElementById("notif_body").value.trim();
    const target_type = document.getElementById("notif_target").value;

    if (!title) { showToast("Vui lòng nhập tiêu đề thông báo!", "error"); document.getElementById("notif_title").focus(); return; }
    if (!body)  { showToast("Vui lòng nhập nội dung thông báo!", "error"); document.getElementById("notif_body").focus(); return; }

    const btn = document.getElementById("btn-send-notif");
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Đang gửi...';

    try {
        const resp = await API.post("/auth/admin/notifications", { title, body, target_type });
        showToast(`✅ Đã gửi thông báo đến ${resp.reach_count} người dùng!`);
        closeNotifModal();
        loadNotifications();
    } catch (err) {
        showToast("Lỗi: " + err.message, "error");
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Gửi Thông Báo';
    }
}

// ──────────────────────────────────────
//  DELETE NOTIFICATION
// ──────────────────────────────────────
async function deleteNotif(id) {
    showConfirm("Xoá thông báo này khỏi lịch sử gửi?", async () => {
        try {
            await API.delete(`/auth/admin/notifications/${id}`);
            document.getElementById(`nc-${id}`)?.remove();
            showToast("Đã xoá thông báo");
            const remaining = document.querySelectorAll('.notif-card').length;
            document.getElementById("notif-count").textContent = `${remaining} thông báo đã gửi`;
        } catch (err) {
            showToast("Lỗi: " + err.message, "error");
        }
    });
}

document.addEventListener("DOMContentLoaded", () => loadNotifications());
</script>
