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
        <div class="chart-box">
            <h4>Biểu Đồ Doanh Thu (7 Ngày Gần Nhất)</h4>
            <canvas id="revenueChart" height="90"></canvas>
        </div>
        <div class="chart-box">
            <h4>Trạng Thái Đơn Hàng</h4>
            <canvas id="statusChart" height="90"></canvas>
        </div>
    </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

<style>
    .dashboard-wrapper { display:flex; flex-direction:column; gap:24px; }
    .stat-grid { display:grid; grid-template-columns:repeat(auto-fit, minmax(230px, 1fr)); gap:18px; }
    .stat-card { background:var(--surface); border:1px solid var(--border-color); border-radius:12px; padding:20px; display:flex; align-items:center; gap:16px; }
    .stat-icon { width:50px; height:50px; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:20px; flex-shrink:0; }
    .stat-info h3 { font-size:12px; color:var(--text-muted); font-weight:500; margin-bottom:5px; text-transform:uppercase; letter-spacing:0.5px; }
    .stat-val { font-size:22px; font-weight:700; color:#fff; margin-bottom:4px; }
    .stat-trend { font-size:12px; color:var(--text-muted); }
    .stat-trend.up { color:#2ecc71; }
    .chart-grid { display:grid; grid-template-columns:2fr 1fr; gap:20px; }
    @media (max-width:1000px) { .chart-grid { grid-template-columns:1fr; } }
    .chart-box { background:var(--surface); border:1px solid var(--border-color); border-radius:12px; padding:20px; }
    .chart-box h4 { margin-bottom:16px; font-size:14px; font-weight:600; color:var(--text-main); }
</style>

<script>
document.addEventListener("DOMContentLoaded", async () => {
    // Load stats in parallel
    try {
        const [revenueData, moviesData, usersData] = await Promise.all([
            API.get("/booking/admin/revenue"),
            API.get("/movies/now-showing"),
            API.get("/auth/admin/users?limit=1"),
        ]);

        // Revenue KPIs
        const s = revenueData.summary;
        document.getElementById("dash-revenue").textContent = s.total_revenue
            ? parseInt(s.total_revenue).toLocaleString("vi-VN") + "đ"
            : "0đ";
        document.getElementById("dash-orders").textContent = `${s.total_orders || 0} đơn hàng`;
        document.getElementById("dash-avg").textContent = s.avg_order_value
            ? parseInt(s.avg_order_value).toLocaleString("vi-VN") + "đ"
            : "0đ";

        // Movies count
        document.getElementById("dash-movies").textContent = (moviesData.length || 0) + " phim";

        // Users count
        document.getElementById("dash-users").textContent = (usersData.total || 0) + " người";

        // Revenue Line Chart
        const labels = revenueData.daily.map(d => d.date?.slice(5)); // MM-DD
        const values = revenueData.daily.map(d => d.revenue || 0);

        const revCtx = document.getElementById("revenueChart").getContext("2d");
        const grad = revCtx.createLinearGradient(0, 0, 0, 300);
        grad.addColorStop(0, "rgba(229,9,20,0.4)");
        grad.addColorStop(1, "rgba(229,9,20,0.0)");

        new Chart(revCtx, {
            type: "line",
            data: {
                labels: labels.length ? labels : ["—"],
                datasets: [{
                    label: "Doanh thu",
                    data: values.length ? values : [0],
                    borderColor: "#e50914",
                    backgroundColor: grad,
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true,
                    pointRadius: 4,
                    pointBackgroundColor: "#fff",
                    pointBorderColor: "#e50914",
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, grid: { color: "rgba(255,255,255,0.05)" }, ticks: { color: "#94a3b8", callback: v => (v/1000000).toFixed(1) + "M" } },
                    x: { grid: { display: false }, ticks: { color: "#94a3b8" } }
                }
            }
        });

        // Status Doughnut Chart
        const statCtx = document.getElementById("statusChart").getContext("2d");
        new Chart(statCtx, {
            type: "doughnut",
            data: {
                labels: ["Đã TT", "Chờ TT", "Đã huỷ"],
                datasets: [{
                    data: [
                        revenueData.daily.reduce((a, d) => a + (d.total_orders || 0), 0) || 1, 
                        0, 0
                    ],
                    backgroundColor: ["#2ecc71", "#f1c40f", "#e74c3c"],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                cutout: "72%",
                plugins: { legend: { position: "bottom", labels: { color: "#f1f5f9", font: { size: 12 } } } }
            }
        });

    } catch (err) {
        console.error("Dashboard load error:", err);
    }
});
</script>
