<?php
// reward-exchanges.php - Quản lý đổi quà (Sửa lại layout cho đúng Admin Style)
?>
<style>
    .exchange-table-card {
        background: var(--surface);
        border-radius: 16px;
        padding: 24px;
        border: 1px solid var(--border-color);
    }
    .table-custom {
        width: 100%;
        border-collapse: separate;
        border-spacing: 0 10px;
        margin-top: 20px;
    }
    .table-custom th {
        padding: 12px 20px;
        color: var(--text-muted);
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 1px;
        text-align: left;
    }
    .table-custom tr {
        background: var(--bg-darker);
        transition: transform 0.2s;
    }
    .table-custom tr:hover {
        transform: scale(1.01);
        background: var(--surface-hover);
    }
    .table-custom td {
        padding: 16px 20px;
        font-size: 14px;
        color: var(--text-main);
        border-top: 1px solid var(--border-color);
        border-bottom: 1px solid var(--border-color);
    }
    .table-custom td:first-child { border-left: 1px solid var(--border-color); border-radius: 12px 0 0 12px; }
    .table-custom td:last-child { border-right: 1px solid var(--border-color); border-radius: 0 12px 12px 0; }
    
    .status-badge {
        padding: 4px 12px;
        border-radius: 6px;
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
    }
    .status-pending { background: rgba(241, 196, 15, 0.1); color: #f1c40f; }
    .status-processing { background: rgba(52, 152, 219, 0.1); color: #3498db; }
    .status-completed { background: rgba(46, 204, 113, 0.1); color: #2ecc71; }
    .status-cancelled { background: rgba(231, 76, 60, 0.1); color: #e74c3c; }

    .action-btn {
        background: transparent;
        border: 1px solid var(--border-color);
        color: var(--text-main);
        width: 32px;
        height: 32px;
        border-radius: 8px;
        cursor: pointer;
        transition: 0.2s;
    }
    .action-btn:hover { background: var(--primary); border-color: var(--primary); }

    .delivery-tag {
        font-size: 10px;
        padding: 2px 6px;
        border-radius: 4px;
        background: rgba(255,255,255,0.05);
        margin-bottom: 5px;
        display: inline-block;
    }
</style>

<div class="exchange-table-card">
    <div style="display: flex; justify-content: space-between; align-items: center;">
        <h3 style="font-family: 'Montserrat'; font-weight: 700; font-size: 18px;">DANH SÁCH YÊU CẦU ĐỔI QUÀ</h3>
        <button class="btn btn-primary" onclick="fetchExchanges()">
            <i class="fa-solid fa-rotate"></i> Làm mới
        </button>
    </div>

    <table class="table-custom">
        <thead>
            <tr>
                <th>Mã đơn</th>
                <th>Khách hàng</th>
                <th>Vật phẩm</th>
                <th>Hình thức</th>
                <th>Thông tin nhận</th>
                <th>Ngày tạo</th>
                <th>Trạng thái</th>
                <th style="text-align: right;">Thao tác</th>
            </tr>
        </thead>
        <tbody id="exchange-list-body">
            <!-- Data will be loaded here -->
        </tbody>
    </table>
</div>

<script>
async function fetchExchanges() {
    const body = document.getElementById('exchange-list-body');
    body.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:40px;"><i class="fa-solid fa-circle-notch fa-spin"></i> Đang tải dữ liệu...</td></tr>`;

    try {
        // Đảm bảo đường dẫn chuẩn xác qua Gateway
        const res = await API.get('/booking/admin/reward-exchanges');
        const list = res.data || [];

        if (list.length === 0) {
            body.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:40px; color:var(--text-muted);">Chưa có yêu cầu nào.</td></tr>';
            return;
        }

        body.innerHTML = list.map(item => {
            const statusClass = `status-${item.status}`;
            const date = new Date(item.created_at).toLocaleString('vi-VN');
            
            let deliveryContent = '';
            if (item.delivery_method === 'cinema') {
                deliveryContent = `<div style="font-weight:600; color:#3498db;">${item.pickup_cinema}</div>`;
            } else {
                deliveryContent = `
                    <div style="font-size:12px;">
                        <b>${item.ship_name}</b> - ${item.ship_phone}<br>
                        <span style="color:var(--text-muted);">${item.ship_address}</span>
                    </div>
                `;
            }

            return `
                <tr>
                    <td style="font-weight:700; color:var(--primary);">#${item.id}</td>
                    <td><b>User ID: ${item.user_id}</b></td>
                    <td>
                        <div style="font-weight:700;">${item.item_name}</div>
                        <div style="color:#f1c40f; font-size:12px;"><i class="fa-solid fa-coins"></i> ${item.points_spent} P</div>
                    </td>
                    <td>
                        <span class="delivery-tag">${item.delivery_method === 'cinema' ? 'TẠI RẠP' : 'GIAO HÀNG'}</span>
                    </td>
                    <td>${deliveryContent}</td>
                    <td>${date}</td>
                    <td><span class="status-badge ${statusClass}">${item.status}</span></td>
                    <td style="text-align: right;">
                        <button class="action-btn" title="Đang xử lý" onclick="updateStatus(${item.id}, 'processing')"><i class="fa-solid fa-truck"></i></button>
                        <button class="action-btn" title="Hoàn tất" onclick="updateStatus(${item.id}, 'completed')" style="margin-left:5px;"><i class="fa-solid fa-check"></i></button>
                        <button class="action-btn" title="Hủy" onclick="updateStatus(${item.id}, 'cancelled')" style="margin-left:5px;"><i class="fa-solid fa-xmark"></i></button>
                    </td>
                </tr>
            `;
        }).join('');
    } catch (err) {
        body.innerHTML = `<tr><td colspan="8" style="text-align:center; color:#e74c3c;">Lỗi: ${err.message}</td></tr>`;
    }
}

async function updateStatus(id, status) {
    if(!confirm(`Bạn muốn chuyển yêu cầu #${id} sang trạng thái ${status.toUpperCase()}?`)) return;
    try {
        const res = await API.put(`/booking/admin/reward-exchanges/${id}/status`, { status });
        if(res.success) {
            fetchExchanges();
        }
    } catch (err) {
        alert("Lỗi: " + err.message);
    }
}

// Khởi tạo
document.addEventListener('DOMContentLoaded', fetchExchanges);
</script>
