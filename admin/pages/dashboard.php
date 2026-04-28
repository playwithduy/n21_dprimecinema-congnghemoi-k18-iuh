<div class="dashboard-wrapper">
    <!-- Stat Cards -->
    <div class="stat-grid" id="stat-grid">
        <div class="stat-card">
            <div class="stat-icon" style="background:rgba(229,9,20,0.1);color:var(--primary)"><i class="fa-solid fa-money-bill-wave"></i></div>
            <div class="stat-info">
                <h3>Doanh Thu Tuần Này</h3>
                <div class="stat-val" id="dash-revenue">Đang tải...</div>
                <div class="stat-trend up" id="dash-orders">— đơn hàng</div>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon" style="background:rgba(46,204,113,0.1);color:#2ecc71"><i class="fa-solid fa-ticket"></i></div>
            <div class="stat-info">
                <h3>Giá Trị Đơn Trung Bình</h3>
                <div class="stat-val" id="dash-avg">Đang tải...</div>
                <div class="stat-trend">Trong tuần hiện tại</div>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon" style="background:rgba(52,152,219,0.1);color:#3498db"><i class="fa-solid fa-film"></i></div>
            <div class="stat-info">
                <h3>Phim Đang Chiếu</h3>
                <div class="stat-val" id="dash-movies">Đang tải...</div>
                <div class="stat-trend">Phim đang hoạt động</div>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon" style="background:rgba(155,89,182,0.1);color:#9b59b6"><i class="fa-solid fa-users"></i></div>
            <div class="stat-info">
                <h3>Tổng Người Dùng</h3>
                <div class="stat-val" id="dash-users">Đang tải...</div>
                <div class="stat-trend">Thành viên đã đăng ký</div>
            </div>
        </div>
    </div>

    <!-- Charts Area -->
    <div class="chart-grid">
        <div class="chart-box main-chart">
            <h4>Biểu Đồ Doanh Thu & Tăng Trưởng (30 Ngày)</h4>
            <canvas id="revenueChart" height="100"></canvas>
        </div>
        <div class="chart-box">
            <h4>Phân Loại Thể Loại Phim Hot</h4>
            <canvas id="genreChart" height="150"></canvas>
        </div>
    </div>

    <div class="chart-grid second-row">
        <div class="chart-box">
            <h4>Bản Đồ Nhiệt: Khung Giờ Đặt Vé</h4>
            <canvas id="heatmapChart" height="100"></canvas>
        </div>
        <div class="chart-box">
            <h4>Trạng Thái Đơn Hàng</h4>
            <canvas id="statusChart" height="100"></canvas>
        </div>
    </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

<style>
    .dashboard-wrapper { display:flex; flex-direction:column; gap:24px; padding: 10px; }
    .stat-grid { display:grid; grid-template-columns:repeat(auto-fit, minmax(230px, 1fr)); gap:18px; }
    .stat-card { background:var(--surface); border:1px solid var(--border-color); border-radius:12px; padding:20px; display:flex; align-items:center; gap:16px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
    .stat-icon { width:50px; height:50px; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:20px; flex-shrink:0; }
    .stat-info h3 { font-size:12px; color:var(--text-muted); font-weight:500; margin-bottom:5px; text-transform:uppercase; letter-spacing:0.5px; }
    .stat-val { font-size:22px; font-weight:700; color:#fff; margin-bottom:4px; }
    .stat-trend { font-size:12px; color:var(--text-muted); }
    
    .chart-grid { display:grid; grid-template-columns: 2fr 1fr; gap:20px; margin-top: 10px; }
    .chart-grid.second-row { grid-template-columns: 1.5fr 1fr; }
    @media (max-width:1000px) { .chart-grid, .chart-grid.second-row { grid-template-columns:1fr; } }
    
    .chart-box { background:var(--surface); border:1px solid var(--border-color); border-radius:16px; padding:24px; transition: 0.3s; }
    .chart-box:hover { border-color: #e50914; box-shadow: 0 10px 30px rgba(229, 9, 20, 0.05); }
    .chart-box h4 { margin-bottom:20px; font-size:15px; font-weight:700; color:#fff; display: flex; align-items: center; gap: 8px; }
    .chart-box h4::before { content: ""; width: 3px; height: 15px; background: #e50914; border-radius: 2px; }
</style>

<script>
document.addEventListener("DOMContentLoaded", async () => {
    try {
        const [statsData, moviesData, usersData] = await Promise.all([
            API.get("/booking/admin/reports/stats"),
            API.get("/movies/now-showing"),
            API.get("/auth/admin/users?limit=1"),
        ]);

        const dailyRev = statsData.dailyRevenue || [];
        const genreRev = statsData.genreRevenue || [];
        const hourlyData = statsData.hourlyBookings || [];

        // KPI Calculations
        const totalRevenue = dailyRev.reduce((a, b) => a + parseInt(b.revenue || 0), 0);
        const totalOrders = dailyRev.reduce((a, b) => a + (b.orders || 0), 0);
        
        document.getElementById("dash-revenue").textContent = totalRevenue.toLocaleString("vi-VN") + "đ";
        document.getElementById("dash-orders").textContent = `${totalOrders} đơn hàng`;
        document.getElementById("dash-avg").textContent = (totalOrders ? Math.round(totalRevenue/totalOrders) : 0).toLocaleString("vi-VN") + "đ";
        document.getElementById("dash-movies").textContent = (moviesData.length || 0) + " phim";
        document.getElementById("dash-users").textContent = (usersData.total || 0) + " người";

        // 1. Line Chart: Revenue Growth
        const revCtx = document.getElementById("revenueChart").getContext("2d");
        const grad = revCtx.createLinearGradient(0, 0, 0, 400);
        grad.addColorStop(0, "rgba(229,9,20,0.5)");
        grad.addColorStop(1, "rgba(229,9,20,0.0)");

        new Chart(revCtx, {
            type: "line",
            data: {
                labels: dailyRev.map(d => d.date.slice(5)),
                datasets: [{
                    label: "Doanh thu",
                    data: dailyRev.map(d => d.revenue),
                    borderColor: "#e50914",
                    backgroundColor: grad,
                    fill: true,
                    tension: 0.4,
                    borderWidth: 3,
                    pointRadius: 0,
                    pointHoverRadius: 6,
                    pointHoverBackgroundColor: "#fff",
                    pointHoverBorderWidth: 3
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { display: false } },
                scales: {
                    y: { grid: { color: "rgba(255,255,255,0.05)" }, ticks: { color: "#64748b", callback: v => (v/1000000).toFixed(1) + "M" } },
                    x: { grid: { display: false }, ticks: { color: "#64748b" } }
                }
            }
        });

        // 2. Doughnut Chart: Genre Analytics
        const genreCtx = document.getElementById("genreChart").getContext("2d");
        new Chart(genreCtx, {
            type: "doughnut",
            data: {
                labels: genreRev.map(g => g.genre),
                datasets: [{
                    data: genreRev.map(g => g.revenue),
                    backgroundColor: ["#e50914", "#3498db", "#2ecc71", "#f1c40f", "#9b59b6", "#e67e22"],
                    borderWidth: 0,
                    hoverOffset: 15
                }]
            },
            options: {
                responsive: true,
                cutout: "75%",
                plugins: { 
                    legend: { position: "bottom", labels: { color: "#94a3b8", usePointStyle: true, padding: 20 } } 
                }
            }
        });

        // 3. Bar Chart: Hourly Heatmap
        const hours = Array.from({length: 24}, (_, i) => `${i}h`);
        const counts = Array(24).fill(0);
        hourlyData.forEach(d => counts[d.hour] = d.count);

        const heatmapCtx = document.getElementById("heatmapChart").getContext("2d");
        new Chart(heatmapCtx, {
            type: "bar",
            data: {
                labels: hours,
                datasets: [{
                    label: "Số lượt đặt",
                    data: counts,
                    backgroundColor: counts.map(v => v > 5 ? "#e50914" : "rgba(229,9,20,0.3)"),
                    borderRadius: 5
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { display: false } },
                scales: {
                    y: { display: false },
                    x: { grid: { display: false }, ticks: { color: "#64748b", font: { size: 10 } } }
                }
            }
        });

        // 4. Status Doughnut Chart
        const statCtx = document.getElementById("statusChart").getContext("2d");
        new Chart(statCtx, {
            type: "pie",
            data: {
                labels: ["Đã TT", "Đã huỷ"],
                datasets: [{
                    data: [totalOrders, 0],
                    backgroundColor: ["#2ecc71", "#e74c3c"],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { position: "right", labels: { color: "#94a3b8" } } }
            }
        });

    } catch (err) {
        console.error("Dashboard error:", err);
    }
});
</script>
