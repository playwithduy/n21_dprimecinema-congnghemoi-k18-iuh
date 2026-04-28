<div class="movieall-page">
    <div class="container">
        <div class="movieall-header">
            <div class="section-heading">
                <span class="section-line"></span>
                <h3>PHIM ĐANG CHIẾU</h3>
                <span class="section-line"></span>
            </div>
            <p>Khám phá những siêu phẩm điện ảnh đang làm mưa làm gió tại rạp D Prime Cinema.</p>
        </div>

        <div id="now-showing-grid" class="movie-grid">
            <div class="loading-spinner">Đang tải danh sách phim...</div>
        </div>
    </div>
</div>

<style>
.movieall-page { padding: 60px 0; background: #0b0f19; min-height: 80vh; }
.movieall-header { text-align: center; margin-bottom: 50px; }
.movieall-header p { color: #9ca3af; margin-top: 15px; }
.movie-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 30px; }
</style>

<script>
document.addEventListener("DOMContentLoaded", async () => {
    const grid = document.getElementById("now-showing-grid");
    try {
        const API_BASE = window.location.origin + "/api";
        const res = await fetch(`${API_BASE}/movies/now-showing`);
        const movies = await res.json();

        if (!movies || movies.length === 0) {
            grid.innerHTML = '<div class="loading-spinner">Hiện không có phim nào đang chiếu.</div>';
            return;
        }

        grid.innerHTML = movies.map(m => {
            const link = window.encodeLink ? window.encodeLink("movie", m.slug) : `index.php?p=${btoa('movie')}&slug=${m.slug}`;
            return `
            <div class="mv-card">
                <a href="${link}" class="mv-card-poster">
                    <img src="${m.poster || 'https://placehold.co/300x450/0b0f19/e71a0f?text=NO+POSTER'}" alt="${m.title}">
                    <div class="mv-card-overlay">
                        ${m.age_limit ? `<span class="mv-age">${m.age_limit}+</span>` : ''}
                    </div>
                </a>
                <div class="mv-card-info">
                    <div class="mv-card-title">${m.title}</div>
                    <div class="mv-card-meta">${m.genre || 'Hành động, Phiêu lưu'}</div>
                </div>
                <div class="mv-card-actions">
                    <a href="${link}" class="mv-btn-detail">Chi tiết</a>
                    <button class="mv-btn-buy btn-buy" data-id="${m.id || ''}">Mua vé</button>
                </div>
            </div>
        `}).join("");
    } catch (err) {
        grid.innerHTML = '<div class="loading-spinner">Lỗi tải dữ liệu phim.</div>';
    }
});
</script>
