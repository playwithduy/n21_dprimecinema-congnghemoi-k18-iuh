<div class="tickets-container">
    <div class="tickets-header-tools">
        <div class="report-title-group">
            <h2 class="page-sec-title">Quản lý Vé Cinema</h2>
            <p class="text-muted">Tra cứu, kiểm tra trạng thái và lịch sử check-in của từng vé</p>
        </div>
        
        <div class="header-actions">
            <div class="search-box-vip">
                <i class="fa-solid fa-magnifying-glass"></i>
                <input type="text" id="ticket-search" placeholder="Tìm Mã vé, Email, Số ghế..." onkeyup="handleSearch(event)">
            </div>
            
            <div class="filter-group">
                <select id="status-filter" class="vip-select" onchange="loadTickets()">
                    <option value="">Tất cả trạng thái</option>
                    <option value="unused">Chưa sử dụng</option>
                    <option value="used">Đã Check-in</option>
                </select>
                
                <button class="btn btn-primary" onclick="loadTickets()">
                    <i class="fa-solid fa-rotate"></i> Làm mới
                </button>
            </div>
        </div>
    </div>

    <!-- TICKETS TABLE CARD -->
    <div class="vip-card table-card-vip">
        <div class="table-responsive">
            <table class="vip-table">
                <thead>
                    <tr>
                        <th>ID Vé</th>
                        <th>Mã Đặt Vé</th>
                        <th>Phim / Suất chiếu</th>
                        <th>Phòng / Ghế</th>
                        <th>Khách hàng</th>
                        <th>Trạng thái</th>
                        <th>Ngày tạo / Check-in</th>
                    </tr>
                </thead>
                <tbody id="tickets-tbody">
                    <!-- Data loaded by JS -->
                </tbody>
            </table>
        </div>
        
        <!-- Pagination -->
        <div class="vip-pagination" id="tickets-pagination">
            <!-- Pagination buttons -->
        </div>
    </div>
</div>

<style>
/* CSS styles (Carbon VIP style matching dashboard) */
.tickets-container { animation: fadeIn 0.4s ease-out; }
.tickets-header-tools { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 24px; gap: 20px; flex-wrap: wrap; }

.search-box-vip { position: relative; width: 300px; }
.search-box-vip i { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--text-muted); }
.search-box-vip input { width: 100%; padding: 12px 14px 12px 40px; background: var(--bg-darker); border: 1px solid var(--border-color); border-radius: 12px; color: #fff; transition: all 0.3s; }
.search-box-vip input:focus { border-color: var(--primary); box-shadow: 0 0 10px rgba(229, 9, 20, 0.2); }

.filter-group { display: flex; gap: 12px; }
.vip-select { background: var(--bg-darker); border: 1px solid var(--border-color); color: #fff; padding: 12px 16px; border-radius: 12px; cursor: pointer; min-width: 160px; outline: none; }

.vip-card { background: var(--surface); border: 1px solid var(--border-color); border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.3); overflow: hidden; }
.vip-table { width: 100%; border-collapse: collapse; }
.vip-table th { text-align: left; padding: 16px 24px; background: rgba(255,255,255,0.02); color: var(--text-muted); font-size: 11px; text-transform: uppercase; letter-spacing: 1px; }
.vip-table td { padding: 16px 24px; border-top: 1px solid rgba(255,255,255,0.03); color: #fff; font-size: 14px; }
.vip-table tr:hover { background: rgba(255,255,255,0.02); }

.ticket-id-tag { font-family: 'Share Tech Mono', monospace; color: var(--primary); font-weight: bold; }
.booking-code-tag { background: rgba(255,255,255,0.05); padding: 4px 8px; border-radius: 6px; font-weight: bold; border: 1px solid rgba(255,255,255,0.1); }

.status-tag { padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; display: inline-flex; align-items: center; gap: 6px; }
.status-unused { background: rgba(148, 163, 184, 0.1); color: #94a3b8; }
.status-used { background: rgba(46, 204, 113, 0.1); color: #2ecc71; }

.movie-sub-info { font-size: 12px; color: var(--text-muted); margin-top: 4px; }
.user-email-txt { font-size: 13px; color: var(--text-muted); }

.vip-pagination { display: flex; justify-content: center; gap: 8px; padding: 24px; }
.page-btn { padding: 8px 16px; background: var(--bg-darker); border: 1px solid var(--border-color); color: #fff; border-radius: 8px; cursor: pointer; transition: all 0.2s; }
.page-btn.active { background: var(--primary); border-color: var(--primary); }
.page-btn:hover:not(.active) { background: rgba(255,255,255,0.05); }

/* Animation */
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
</style>

<script>
let currentPage = 1;

async function loadTickets(page = 1) {
    currentPage = page;
    const search = document.getElementById('ticket-search').value;
    const status = document.getElementById('status-filter').value;
    
    try {
        const res = await API.get(`/booking/admin/tickets?page=${page}&search=${search}&status=${status}`);
        renderTickets(res.tickets);
        renderPagination(res.total, page);
    } catch (err) {
        console.error(err);
        // Fallback for demo if API not found
    }
}

function renderTickets(tickets) {
    const tbody = document.getElementById('tickets-tbody');
    tbody.innerHTML = '';
    
    if (!tickets || tickets.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding: 40px; color: var(--text-muted);">Không tìm thấy vé nào phù hợp</td></tr>';
        return;
    }
    
    tickets.forEach(t => {
        const statusCls = t.status === 'used' ? 'status-used' : 'status-unused';
        const statusText = t.status === 'used' ? 'Đã Check-in' : 'Chưa sử dụng';
        const statusIcon = t.status === 'used' ? 'fa-check' : 'fa-clock';
        
        const dateStr = new Date(t.created_at).toLocaleDateString('vi-VN');
        const checkinStr = t.checkin_time ? `<div class="movie-sub-info"><i class="fa-solid fa-door-open"></i> ${new Date(t.checkin_time).toLocaleString('vi-VN')}</div>` : '';

        tbody.innerHTML += `
            <tr>
                <td><span class="ticket-id-tag">#${t.id}</span></td>
                <td><span class="booking-code-tag">${t.booking_code}</span></td>
                <td>
                    <div style="font-weight: 600;">${t.movie_title}</div>
                    <div class="movie-sub-info">${new Date(t.show_date).toLocaleDateString('vi-VN')} | ${t.show_time}</div>
                </td>
                <td>
                    <div style="font-weight: 600;">${t.room_name}</div>
                    <div class="movie-sub-info">Ghế ${t.seat_code}</div>
                </td>
                <td>
                    <div class="user-email-txt">${t.user_email || 'Khách hàng'}</div>
                </td>
                <td>
                    <span class="status-tag ${statusCls}">
                        <i class="fa-solid ${statusIcon}"></i> ${statusText}
                    </span>
                </td>
                <td>
                    <div class="movie-sub-info">Tạo: ${dateStr}</div>
                    ${checkinStr}
                </td>
            </tr>
        `;
    });
}

function renderPagination(total, page) {
    const totalPages = Math.ceil(total / 20);
    const pagin = document.getElementById('tickets-pagination');
    pagin.innerHTML = '';
    
    if (totalPages <= 1) return;
    
    for (let i = 1; i <= totalPages; i++) {
        const active = i === page ? 'active' : '';
        pagin.innerHTML += `<button class="page-btn ${active}" onclick="loadTickets(${i})">${i}</button>`;
    }
}

function handleSearch(e) {
    if (e.key === 'Enter') loadTickets(1);
}

// Init
document.addEventListener('DOMContentLoaded', () => loadTickets(1));
</script>
