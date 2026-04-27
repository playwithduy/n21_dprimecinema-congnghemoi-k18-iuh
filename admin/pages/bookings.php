<div class="page-header">
    <div>
        <h2>Giao Dịch Bán Vé</h2>
        <p style="color:var(--text-muted);font-size:13px;margin-top:4px;" id="booking-count">Đang tải...</p>
    </div>
    <div class="header-actions">
        <select id="booking-status" class="form-control" style="width:180px;" onchange="loadBookings(1)">
            <option value="">Tất cả trạng thái</option>
            <option value="paid">✓ Đã thanh toán</option>
            <option value="pending">⏳ Chờ TT</option>
            <option value="pending_cash">💵 Chờ tiền mặt</option>
            <option value="cancelled">✗ Đã huỷ</option>
            <option value="failed">⚠ Thất bại</option>
        </select>
        <input type="text" id="booking-search" class="form-control" placeholder="Mã vé / email..." style="width:220px;" oninput="debounceBookingSearch()">
        <button class="btn btn-secondary" onclick="loadBookings(1)"><i class="fa-solid fa-rotate-right"></i></button>
    </div>
</div>

<!-- Revenue Summary Cards -->
<div class="rev-cards" id="rev-cards">
    <div class="rev-card"><div class="rev-icon" style="color:#2ecc71"><i class="fa-solid fa-money-bill-wave"></i></div><div><div class="rev-label">Doanh thu tuần này</div><div class="rev-val" id="rev-week">—</div></div></div>
    <div class="rev-card"><div class="rev-icon" style="color:#3498db"><i class="fa-solid fa-ticket"></i></div><div><div class="rev-label">Đơn hàng tuần này</div><div class="rev-val" id="rev-orders">—</div></div></div>
    <div class="rev-card"><div class="rev-icon" style="color:#f1c40f"><i class="fa-solid fa-chart-bar"></i></div><div><div class="rev-label">Giá trị đơn TB</div><div class="rev-val" id="rev-avg">—</div></div></div>
</div>

<div class="content-panel" style="margin-top:20px;">
    <div class="table-container">
        <table class="admin-table">
            <thead>
                <tr>
                    <th width="130">Mã Vé</th>
                    <th>Khách hàng</th>
                    <th>Ghế</th>
                    <th>Tổng tiền</th>
                    <th>Phương thức</th>
                    <th>Ngày đặt</th>
                    <th>Trạng thái</th>
                    <th width="80">Thao tác</th>
                </tr>
            </thead>
            <tbody id="bookings-tbody">
                <tr><td colspan="8" class="loading-cell"><i class="fa-solid fa-spinner fa-spin"></i> Đang tải...</td></tr>
            </tbody>
        </table>
    </div>
    <div class="table-pagination" id="bookings-pagination"></div>
</div>

<style>
    .page-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; }
    .page-header h2 { font-size:20px; font-weight:700; color:#fff; }
    .form-control { border:1px solid var(--border-color); border-radius:8px; color:#fff; padding:10px 16px; outline:none; background:var(--surface); font-size:14px; }
    .form-control option { background:#1a1d29; }
    .rev-cards { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; margin-bottom:0; }
    .rev-card { background:var(--surface); border:1px solid var(--border-color); border-radius:12px; padding:18px; display:flex; align-items:center; gap:14px; }
    .rev-icon { font-size:28px; }
    .rev-label { font-size:12px; color:var(--text-muted); margin-bottom:4px; }
    .rev-val { font-size:22px; font-weight:700; color:#fff; }
    .content-panel { background:var(--surface); border:1px solid var(--border-color); border-radius:12px; overflow:hidden; }
    .table-container { overflow-x:auto; }
    .admin-table { width:100%; border-collapse:collapse; text-align:left; }
    .admin-table th { padding:14px 20px; font-size:12px; text-transform:uppercase; letter-spacing:1px; color:var(--text-muted); border-bottom:1px solid var(--border-color); background:rgba(0,0,0,0.2); }
    .admin-table td { padding:14px 20px; font-size:14px; border-bottom:1px solid var(--border-color); vertical-align:middle; }
    .admin-table tbody tr:hover { background:rgba(255,255,255,0.02); }
    .loading-cell { text-align:center; padding:40px; color:var(--text-muted); }
    .booking-code { font-family:monospace; font-weight:700; font-size:13px; color:var(--primary); }
    .status-badge { display:inline-block; padding:4px 10px; border-radius:20px; font-size:11px; font-weight:700; }
    .status-badge.paid { background:rgba(46,204,113,0.1); color:#2ecc71; border:1px solid rgba(46,204,113,0.3); }
    .status-badge.pending, .status-badge.pending_cash { background:rgba(241,196,15,0.1); color:#f1c40f; border:1px solid rgba(241,196,15,0.3); }
    .status-badge.cancelled, .status-badge.failed { background:rgba(231,76,60,0.1); color:#e74c3c; border:1px solid rgba(231,76,60,0.3); }
    .action-btn { background:none; border:none; color:var(--text-muted); cursor:pointer; padding:5px 8px; font-size:15px; border-radius:6px; transition:all 0.2s; }
    .action-btn:hover { background:rgba(255,255,255,0.05); color:#fff; }
    .table-pagination { padding:16px 20px; display:flex; gap:8px; justify-content:flex-end; border-top:1px solid var(--border-color); }
    .page-btn { background:var(--bg-dark); border:1px solid var(--border-color); color:var(--text-muted); border-radius:6px; padding:6px 12px; cursor:pointer; font-size:13px; transition:all 0.2s; }
    .page-btn.active, .page-btn:hover { border-color:var(--primary); color:var(--primary); }
</style>

<script>
let currentBookingPage = 1;
let bookingSearchTimer;

function debounceBookingSearch() {
    clearTimeout(bookingSearchTimer);
    bookingSearchTimer = setTimeout(() => loadBookings(1), 400);
}

async function loadRevenue() {
    try {
        const data = await API.get("/booking/admin/revenue");
        const s = data.summary;
        document.getElementById("rev-week").textContent = s.total_revenue
            ? parseInt(s.total_revenue).toLocaleString("vi-VN") + "đ"
            : "0đ";
        document.getElementById("rev-orders").textContent = (s.total_orders || 0) + " đơn";
        document.getElementById("rev-avg").textContent = s.avg_order_value
            ? parseInt(s.avg_order_value).toLocaleString("vi-VN") + "đ"
            : "0đ";
    } catch (e) { /* silent */ }
}

async function loadBookings(page = 1) {
    currentBookingPage = page;
    const status = document.getElementById("booking-status").value;
    const search = document.getElementById("booking-search").value;
    const tbody = document.getElementById("bookings-tbody");
    tbody.innerHTML = `<tr><td colspan="8" class="loading-cell"><i class="fa-solid fa-spinner fa-spin"></i> Đang tải...</td></tr>`;

    try {
        const data = await API.get(`/booking/admin/bookings?page=${page}&limit=15&status=${status}&search=${encodeURIComponent(search)}`);
        const { bookings, total } = data;

        document.getElementById("booking-count").textContent = `Tổng: ${total} giao dịch`;

        if (!bookings.length) {
            tbody.innerHTML = `<tr><td colspan="8" class="loading-cell">Không có giao dịch nào.</td></tr>`;
            return;
        }

        const statusMap = { paid: 'Đã thanh toán', pending: 'Chờ TT', pending_cash: 'Chờ tiền mặt', cancelled: 'Đã huỷ', failed: 'Thất bại' };
        tbody.innerHTML = bookings.map(b => `
        <tr>
            <td><span class="booking-code">${b.booking_code}</span></td>
            <td>
                <div style="color:#fff;font-weight:600">${b.user_email || '—'}</div>
                <div style="font-size:11px;color:var(--text-muted)">ID: ${b.user_id || '—'}</div>
            </td>
            <td style="font-size:13px;color:var(--text-muted)">${b.seats || '—'}</td>
            <td style="color:#2ecc71;font-weight:700">${parseInt(b.total_amount || 0).toLocaleString('vi-VN')}đ</td>
            <td style="color:var(--text-muted);font-size:13px">${b.payment_method || '—'}</td>
            <td style="color:var(--text-muted);font-size:12px">${new Date(b.created_at).toLocaleString('vi-VN')}</td>
            <td><span class="status-badge ${b.status}">${statusMap[b.status] || b.status}</span></td>
            <td>
                ${b.status !== 'cancelled' ? `
                    <button class="action-btn" title="Huỷ đơn" onclick="cancelBooking('${b.booking_code}')">
                        <i class="fa-solid fa-ban" style="color:#e74c3c"></i>
                    </button>
                ` : '—'}
            </td>
        </tr>
        `).join("");

        const totalPages = Math.ceil(total / 15);
        const pagination = document.getElementById("bookings-pagination");
        if (totalPages <= 1) { pagination.innerHTML = ""; return; }
        pagination.innerHTML = Array.from({ length: totalPages }, (_, i) => `
            <button class="page-btn ${i+1 === page ? 'active' : ''}" onclick="loadBookings(${i+1})">${i+1}</button>
        `).join("");

    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="8" class="loading-cell" style="color:#e74c3c"><i class="fa-solid fa-circle-exclamation"></i> Lỗi: ${err.message}</td></tr>`;
    }
}

async function cancelBooking(code) {
    showConfirm(`Xác nhận huỷ đơn <strong>${code}</strong>? Hành động này không thể hoàn tác.`, async () => {
        try {
            await API.patch(`/booking/admin/bookings/${code}/cancel`, {});
            showToast("Đã huỷ đơn thành công");
            loadBookings(currentBookingPage);
        } catch (err) {
            showToast("Lỗi: " + err.message, "error");
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    loadRevenue();
    loadBookings(1);
});
</script>
