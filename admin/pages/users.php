<div class="page-header">
    <div>
        <h2>Khách Hàng & Phân Quyền</h2>
        <p style="color:var(--text-muted);font-size:13px;margin-top:4px;" id="users-count">Đang tải...</p>
    </div>
    <div class="header-actions">
        <input type="text" id="user-search" class="form-control" placeholder="Tìm email, tên, SĐT..." style="width:250px;" oninput="debounceSearch()">
        <button class="btn btn-secondary" onclick="loadUsers(1)"><i class="fa-solid fa-rotate-right"></i> Refresh</button>
    </div>
</div>

<div class="content-panel">
    <div class="table-container">
        <table class="admin-table">
            <thead>
                <tr>
                    <th width="50">ID</th>
                    <th width="55">Avatar</th>
                    <th>Họ & Tên</th>
                    <th>Email / SĐT</th>
                    <th>Ngày ĐK</th>
                    <th>Vai trò</th>
                    <th>Trạng thái</th>
                    <th width="120">Thao tác</th>
                </tr>
            </thead>
            <tbody id="users-tbody">
                <tr><td colspan="8" class="loading-cell"><i class="fa-solid fa-spinner fa-spin"></i> Đang tải...</td></tr>
            </tbody>
        </table>
    </div>
    <div class="table-pagination" id="users-pagination"></div>
</div>

<style>
    .page-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:24px; }
    .page-header h2 { font-size:20px; font-weight:700; color:#fff; }
    .form-control { border:1px solid var(--border-color); border-radius:8px; color:#fff; padding:10px 16px; outline:none; background:var(--surface); font-size:14px; }
    .form-control:focus { border-color:var(--primary); }
    .content-panel { background:var(--surface); border:1px solid var(--border-color); border-radius:12px; overflow:hidden; }
    .table-container { overflow-x:auto; }
    .admin-table { width:100%; border-collapse:collapse; text-align:left; }
    .admin-table th { padding:14px 20px; font-size:12px; text-transform:uppercase; letter-spacing:1px; color:var(--text-muted); border-bottom:1px solid var(--border-color); background:rgba(0,0,0,0.2); }
    .admin-table td { padding:14px 20px; font-size:14px; border-bottom:1px solid var(--border-color); vertical-align:middle; }
    .admin-table tbody tr:hover { background:rgba(255,255,255,0.02); }
    .loading-cell { text-align:center; padding:40px; color:var(--text-muted); }
    .user-avatar-sm { width:38px; height:38px; border-radius:50%; object-fit:cover; border:2px solid var(--border-color); }
    .role-badge { display:inline-flex; align-items:center; gap:5px; padding:3px 10px; border-radius:6px; font-size:11px; font-weight:700; text-transform:uppercase; }
    .role-badge.admin { background:rgba(241,196,15,0.15); color:#f1c40f; border:1px solid rgba(241,196,15,0.3); }
    .role-badge.user { background:rgba(255,255,255,0.05); color:var(--text-muted); border:1px solid rgba(255,255,255,0.1); }
    .status-badge { display:inline-block; padding:3px 10px; border-radius:20px; font-size:11px; font-weight:600; }
    .status-badge.active { background:rgba(46,204,113,0.1); color:#2ecc71; border:1px solid rgba(46,204,113,0.3); }
    .status-badge.banned { background:rgba(231,76,60,0.1); color:#e74c3c; border:1px solid rgba(231,76,60,0.3); }
    .action-btn { background:none; border:none; color:var(--text-muted); cursor:pointer; padding:5px 8px; font-size:15px; border-radius:6px; transition:all 0.2s; }
    .action-btn:hover { background:rgba(255,255,255,0.05); color:#fff; }
    .table-pagination { padding:16px 20px; display:flex; gap:8px; justify-content:flex-end; border-top:1px solid var(--border-color); }
    .page-btn { background:var(--bg-dark); border:1px solid var(--border-color); color:var(--text-muted); border-radius:6px; padding:6px 12px; cursor:pointer; font-size:13px; transition:all 0.2s; }
    .page-btn.active, .page-btn:hover { border-color:var(--primary); color:var(--primary); }
</style>

<script>
let currentUserPage = 1;
let searchTimer;

function debounceSearch() {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => loadUsers(1), 400);
}

async function loadUsers(page = 1) {
    currentUserPage = page;
    const search = document.getElementById("user-search").value;
    const tbody = document.getElementById("users-tbody");
    tbody.innerHTML = `<tr><td colspan="8" class="loading-cell"><i class="fa-solid fa-spinner fa-spin"></i> Đang tải...</td></tr>`;

    try {
        const data = await API.get(`/auth/admin/users?page=${page}&limit=15&search=${encodeURIComponent(search)}`);
        const { users, total } = data;

        document.getElementById("users-count").textContent = `Tổng cộng: ${total} người dùng`;

        if (!users.length) {
            tbody.innerHTML = `<tr><td colspan="8" class="loading-cell">Không tìm thấy người dùng nào.</td></tr>`;
            return;
        }

        tbody.innerHTML = users.map(u => `
        <tr>
            <td style="color:var(--text-muted)">#${u.id}</td>
            <td><img src="${u.avatar ? API.getAssetUrl(u.avatar) : `https://ui-avatars.com/api/?name=${encodeURIComponent(u.fullname)}&background=random`}"
                class="user-avatar-sm" alt="avatar"></td>
            <td><strong style="color:#fff">${u.fullname}</strong></td>
            <td>
                <div style="color:var(--text-muted)">${u.email}</div>
                <div style="font-size:12px;color:#64748b">${u.phone || '—'}</div>
            </td>
            <td style="color:var(--text-muted);font-size:12px">${new Date(u.created_at).toLocaleDateString('vi-VN')}</td>
            <td>
                <span class="role-badge ${u.role}">
                    <i class="fa-solid ${u.role === 'admin' ? 'fa-crown' : 'fa-user'}"></i>
                    ${u.role === 'admin' ? 'Admin' : 'Khách hàng'}
                </span>
            </td>
            <td>
                <span class="status-badge ${u.is_active ? 'active' : 'banned'}">
                    ${u.is_active ? '✓ Hoạt động' : '🔒 Bị khoá'}
                </span>
            </td>
            <td>
                ${u.role !== 'admin' ? `
                    <button class="action-btn" title="${u.is_active ? 'Khoá' : 'Mở khoá'}" onclick="toggleBan(${u.id}, ${u.is_active ? true : false})">
                        <i class="fa-solid ${u.is_active ? 'fa-lock' : 'fa-unlock'}" style="color:${u.is_active ? '#e74c3c' : '#2ecc71'}"></i>
                    </button>
                    <button class="action-btn" title="Cấp Admin" onclick="promoteAdmin(${u.id}, '${u.fullname.replace(/'/g, "\\'")}')">
                        <i class="fa-solid fa-user-shield" style="color:#f1c40f"></i>
                    </button>
                ` : `<span style="color:var(--text-muted);font-size:12px">—</span>`}
            </td>
        </tr>
        `).join("");

        // Pagination
        const totalPages = Math.ceil(total / 15);
        const pagination = document.getElementById("users-pagination");
        if (totalPages <= 1) { pagination.innerHTML = ""; return; }
        pagination.innerHTML = Array.from({ length: totalPages }, (_, i) => `
            <button class="page-btn ${i+1 === page ? 'active' : ''}" onclick="loadUsers(${i+1})">${i+1}</button>
        `).join("");

    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="8" class="loading-cell" style="color:#e74c3c"><i class="fa-solid fa-circle-exclamation"></i> Lỗi: ${err.message}</td></tr>`;
    }
}

async function toggleBan(userId, ban) {
    const action = ban ? "KHOÁ" : "MỞ KHOÁ";
    showConfirm(`Bạn có chắc muốn ${action} tài khoản này?`, async () => {
        try {
            await API.patch(`/auth/admin/users/${userId}/ban`, { ban });
            showToast(ban ? "Đã khoá tài khoản thành công" : "Đã mở khoá tài khoản");
            loadUsers(currentUserPage);
        } catch (err) {
            showToast("Lỗi: " + err.message, "error");
        }
    });
}

async function promoteAdmin(userId, name) {
    showConfirm(`Bạn có chắc muốn cấp quyền ADMIN cho <strong>${name}</strong>? Họ sẽ có toàn quyền quản trị hệ thống!`, async () => {
        try {
            await API.put(`/auth/admin/users/${userId}/role`, { role: 'admin' });
            showToast(`Đã cấp quyền Admin cho ${name}`);
            loadUsers(currentUserPage);
        } catch (err) {
            showToast("Lỗi: " + err.message, "error");
        }
    });
}

document.addEventListener("DOMContentLoaded", () => loadUsers(1));
</script>
