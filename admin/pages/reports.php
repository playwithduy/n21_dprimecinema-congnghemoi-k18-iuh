<div class="reports-container">
    <div class="reports-header-tools">
        <div class="report-title-group">
            <h2 class="page-sec-title">Báo cáo & Phân tích</h2>
            <p class="text-muted">Theo dõi hiệu suất kinh doanh và tỉ lệ lấp đầy</p>
        </div>
        <div class="filters-group">
            <div class="input-wrapper">
                <label>Từ ngày</label>
                <input type="date" id="date-from" class="report-input">
            </div>
            <div class="input-wrapper">
                <label>Đến ngày</label>
                <input type="date" id="date-to" class="report-input">
            </div>
            <button class="btn btn-primary btn-refresh" onclick="loadStats()">
                <i class="fa-solid fa-rotate"></i> Lọc dữ liệu
            </button>
        </div>
    </div>

    <!-- KPI Cards -->
    <div class="stat-grid">
        <div class="stat-card premium">
            <div class="stat-icon" style="background: rgba(229, 9, 20, 0.1); color: #e50914;">
                <i class="fa-solid fa-sack-dollar"></i>
            </div>
            <div class="stat-info">
                <h3>Doanh thu chọn lọc</h3>
                <div class="stat-val" id="total-revenue">0đ</div>
            </div>
        </div>
        <div class="stat-card premium">
            <div class="stat-icon" style="background: rgba(46, 204, 113, 0.1); color: #2ecc71;">
                <i class="fa-solid fa-ticket"></i>
            </div>
            <div class="stat-info">
                <h3>Số vé đã bán</h3>
                <div class="stat-val" id="total-orders">0</div>
            </div>
        </div>
        <div class="stat-card premium">
            <div class="stat-icon" style="background: rgba(52, 152, 219, 0.1); color: #3498db;">
                <i class="fa-solid fa-users-viewfinder"></i>
            </div>
            <div class="stat-info">
                <h3>Lấp ghế trung bình</h3>
                <div class="stat-val" id="avg-occupancy">0%</div>
            </div>
        </div>
    </div>

    <!-- Charts -->
    <div class="chart-layout">
        <div class="chart-card-full">
            <div class="card-header">
                <h4>Biểu đồ Doanh thu (Hàng ngày)</h4>
                <div class="chart-actions">
                    <span class="badge badge-red">Revenue Trend</span>
                </div>
            </div>
            <div class="chart-body">
                <canvas id="dailyRevenueChart"></canvas>
            </div>
        </div>

        <div class="chart-grid-two">
            <div class="chart-card">
                <div class="card-header">
                    <h4>Doanh thu theo Tháng</h4>
                </div>
                <div class="chart-body">
                    <canvas id="monthlyChart"></canvas>
                </div>
            </div>
            <div class="chart-card">
                <div class="card-header">
                    <h4>Top Phim Bán Chạy</h4>
                </div>
                <div class="chart-body">
                    <canvas id="topMoviesChart"></canvas>
                </div>
            </div>
        </div>
    </div>

    <!-- Table Section -->
    <div class="table-card">
        <div class="card-header">
            <h4>Tỉ lệ lấp ghế theo suất chiếu</h4>
            <div class="text-muted" style="font-size: 12px;">Top 20 suất chiếu gần đây nhất</div>
        </div>
        <div class="table-responsive">
            <table class="report-table">
                <thead>
                    <tr>
                        <th>Tên phim</th>
                        <th>Ngày chiếu</th>
                        <th>Giờ chiếu</th>
                        <th class="text-center">Số ghế đã đặt</th>
                        <th class="text-center">Tổng ghế</th>
                        <th>Tỉ lệ lấp đầy</th>
                    </tr>
                </thead>
                <tbody id="occupancy-table-body">
                    <!-- Rows injected by JS -->
                </tbody>
            </table>
        </div>
    </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

<style>
    .reports-container { display: flex; flex-direction: column; gap: 32px; animation: fadeIn 0.4s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

    .reports-header-tools { display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 20px; }
    .page-sec-title { font-size: 24px; font-weight: 700; color: #fff; margin-bottom: 4px; }
    
    .filters-group { display: flex; align-items: flex-end; gap: 16px; background: var(--surface); padding: 16px; border-radius: 12px; border: 1px solid var(--border-color); }
    .input-wrapper { display: flex; flex-direction: column; gap: 6px; }
    .input-wrapper label { font-size: 12px; color: var(--text-muted); font-weight: 600; text-transform: uppercase; }
    .report-input { background: var(--bg-darker); border: 1px solid var(--border-color); color: #fff; padding: 8px 12px; border-radius: 6px; outline: none; }
    .btn-refresh { padding: 9px 20px; height: 38px; }

    .stat-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
    .stat-card.premium { background: var(--surface); border: 1px solid var(--border-color); border-radius: 16px; padding: 24px; display: flex; align-items: center; gap: 20px; transition: transform 0.2s; }
    .stat-card.premium:hover { transform: translateY(-4px); background: var(--surface-hover); }
    .stat-icon { width: 56px; height: 56px; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 24px; }
    .stat-info h3 { font-size: 13px; color: var(--text-muted); margin-bottom: 6px; font-weight: 500; }
    .stat-val { font-size: 28px; font-weight: 800; color: #fff; }

    .chart-layout { display: flex; flex-direction: column; gap: 24px; }
    .chart-card-full, .chart-card { background: var(--surface); border: 1px solid var(--border-color); border-radius: 16px; padding: 24px; }
    .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; border-bottom: 1px solid var(--border-color); padding-bottom: 16px; }
    .card-header h4 { font-size: 16px; font-weight: 700; color: var(--text-main); }
    .chart-body { height: 350px; width: 100%; position: relative; }
    
    .chart-grid-two { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
    .badge-red { background: rgba(229, 9, 20, 0.1); color: var(--primary); padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; }

    .table-card { background: var(--surface); border: 1px solid var(--border-color); border-radius: 16px; padding: 24px; }
    .report-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    .report-table th { text-align: left; padding: 14px; color: var(--text-muted); font-size: 13px; border-bottom: 1px solid var(--border-color); font-weight: 600; }
    .report-table td { padding: 16px 14px; border-bottom: 1px solid var(--border-color); font-size: 14px; color: var(--text-main); }
    .text-center { text-align: center; }

    .progress-bar-bg { width: 100%; background: rgba(255,255,255,0.05); height: 8px; border-radius: 10px; overflow: hidden; margin-top: 6px; }
    .progress-bar-fill { height: 100%; background: var(--primary); border-radius: 10px; }
    
    @media (max-width: 1100px) {
        .stat-grid, .chart-grid-two { grid-template-columns: 1fr; }
    }
</style>

<script>
let charts = {};

document.addEventListener("DOMContentLoaded", () => {
    // Set default dates
    const today = new Date();
    const lastMonth = new Date();
    lastMonth.setDate(today.getDate() - 30);
    
    document.getElementById('date-to').value = today.toISOString().split('T')[0];
    document.getElementById('date-from').value = lastMonth.toISOString().split('T')[0];
    
    loadStats();
});

async function loadStats() {
    const from = document.getElementById('date-from').value;
    const to = document.getElementById('date-to').value;
    
    try {
        const data = await API.get(`/booking/admin/reports/stats?from=${from}&to=${to}`);
        
        // Update KPIs
        const totalRev = data.dailyRevenue.reduce((acc, d) => acc + parseInt(d.revenue || 0), 0);
        const totalOrders = data.dailyRevenue.reduce((acc, d) => acc + parseInt(d.orders || 0), 0);
        const avgOcc = data.occupancy.length > 0 
                    ? data.occupancy.reduce((acc, o) => acc + o.fill_rate, 0) / data.occupancy.length
                    : 0;

        document.getElementById('total-revenue').innerText = totalRev.toLocaleString('vi-VN') + "đ";
        document.getElementById('total-orders').innerText = totalOrders.toLocaleString('vi-VN');
        document.getElementById('avg-occupancy').innerText = Math.round(avgOcc) + "%";

        renderDailyChart(data.dailyRevenue);
        renderMonthlyChart(data.monthlyRevenue);
        renderTopMoviesChart(data.topMovies);
        renderOccupancyTable(data.occupancy);

    } catch (err) {
        console.error("Load stats error:", err);
    }
}

function renderDailyChart(dailyData) {
    if (charts.daily) charts.daily.destroy();
    
    const ctx = document.getElementById('dailyRevenueChart').getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(229, 9, 20, 0.4)');
    gradient.addColorStop(1, 'rgba(229, 9, 20, 0)');

    charts.daily = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dailyData.map(d => d.date.slice(5)),
            datasets: [{
                label: 'Doanh thu',
                data: dailyData.map(d => d.revenue),
                borderColor: '#e50914',
                backgroundColor: gradient,
                fill: true,
                tension: 0.4,
                borderWidth: 3,
                pointRadius: 4,
                pointBackgroundColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } },
                x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
            }
        }
    });
}

function renderMonthlyChart(monthlyData) {
    if (charts.monthly) charts.monthly.destroy();
    
    const ctx = document.getElementById('monthlyChart').getContext('2d');
    charts.monthly = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: monthlyData.map(d => d.month),
            datasets: [{
                label: 'Doanh thu tháng',
                data: monthlyData.map(d => d.revenue),
                backgroundColor: '#3498db',
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } },
                x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
            }
        }
    });
}

function renderTopMoviesChart(movieData) {
    if (charts.topMovies) charts.topMovies.destroy();
    
    const ctx = document.getElementById('topMoviesChart').getContext('2d');
    charts.topMovies = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: movieData.map(m => m.title.length > 20 ? m.title.slice(0, 20) + '...' : m.title),
            datasets: [{
                label: 'Doanh thu (đ)',
                data: movieData.map(m => m.revenue),
                backgroundColor: [
                    '#e50914', '#f1c40f', '#2ecc71', '#3498db', '#9b59b6'
                ],
                borderRadius: 4
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } },
                y: { grid: { display: false }, ticks: { color: '#f1f5f9', font: { size: 11 } } }
            }
        }
    });
}

function renderOccupancyTable(occData) {
    const tbody = document.getElementById('occupancy-table-body');
    tbody.innerHTML = occData.length === 0 ? '<tr><td colspan="6" class="text-center">Không có dữ liệu</td></tr>' : '';
    
    occData.forEach(o => {
        const row = document.createElement('tr');
        const color = o.fill_rate > 70 ? '#2ecc71' : (o.fill_rate > 30 ? '#f1c40f' : '#e50914');
        
        row.innerHTML = `
            <td style="font-weight: 600;">${o.movie_title}</td>
            <td>${o.show_date}</td>
            <td>${o.show_time.slice(0, 5)}</td>
            <td class="text-center">${o.booked_seats}</td>
            <td class="text-center">${o.total_seats}</td>
            <td>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <div style="width: 40px; font-weight: 700; color: ${color}">${o.fill_rate}%</div>
                    <div class="progress-bar-bg" style="flex: 1;">
                        <div class="progress-bar-fill" style="width: ${o.fill_rate}%; background: ${color}"></div>
                    </div>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}
</script>
