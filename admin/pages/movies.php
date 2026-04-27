<div class="page-header">
    <h2>Quản Lý Phim Điện Ảnh</h2>
    <button class="btn btn-primary" onclick="openMovieModal()"><i class="fa-solid fa-plus"></i> Thêm Phim Mới</button>
</div>

<div class="content-panel">
    <div class="table-container">
        <table class="admin-table">
            <thead>
                <tr>
                    <th width="60">ID</th>
                    <th width="80">Poster</th>
                    <th>Tên Phim</th>
                    <th>Ngày Khởi Chiếu</th>
                    <th>Thời Lượng</th>
                    <th>Trạng Thái</th>
                    <th width="120">Thao Tác</th>
                </tr>
            </thead>
            <tbody id="movie-tbody">
                <tr><td colspan="7" style="text-align: center; padding: 30px;">Đang tải dữ liệu...</td></tr>
            </tbody>
        </table>
    </div>
</div>

<!-- Movie Modal (Thêm / Sửa Phim) -->
<div id="movieModal" class="modal-overlay" style="display: none;">
    <div class="modal-box">
        <div class="modal-header">
            <h3 id="modalTitle">Thêm Phim Mới</h3>
            <button class="close-btn" onclick="closeMovieModal()"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <div class="modal-body">
            <form id="movieForm">
                <input type="hidden" id="mv_id" value="">
                
                <div class="form-row">
                    <div class="form-group" style="flex: 2;">
                        <label>Tên Phim *</label>
                        <input type="text" id="mv_title" class="form-control" required placeholder="Nhập tên phim...">
                    </div>
                    <div class="form-group" style="flex: 1;">
                        <label>Độ Tuổi (Age Limit) *</label>
                        <select id="mv_age" class="form-control" required>
                            <option value="P">P (Mọi lứa tuổi)</option>
                            <option value="T13">T13 (Tới 13 tuổi)</option>
                            <option value="T16">T16 (Tới 16 tuổi)</option>
                            <option value="T18">T18 (Tới 18 tuổi)</option>
                        </select>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label>Poster (URL Hình Ảnh) *</label>
                        <input type="url" id="mv_poster" class="form-control" required placeholder="https://example.com/poster.jpg">
                    </div>
                    <div class="form-group">
                        <label>Trailer (URL YouTube) *</label>
                        <input type="url" id="mv_trailer" class="form-control" required placeholder="https://www.youtube.com/watch?v=...">
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label>Thể loại *</label>
                        <input type="text" id="mv_genres" class="form-control" required placeholder="Hành động, Hài hước...">
                    </div>
                    <div class="form-group">
                        <label>Thời lượng (Phút) *</label>
                        <input type="number" id="mv_duration" class="form-control" required placeholder="120">
                    </div>
                    <div class="form-group">
                        <label>Ngày Khởi Chiếu *</label>
                        <input type="date" id="mv_release" class="form-control" required>
                    </div>
                </div>

                <div class="form-group">
                    <label>Mô tả nội dung</label>
                    <textarea id="mv_desc" class="form-control" rows="4"></textarea>
                </div>

            </form>
        </div>
        <div class="modal-footer">
            <button class="btn btn-secondary" onclick="closeMovieModal()">Huỷ</button>
            <button class="btn btn-primary" onclick="saveMovie()">Lưu Thay Đổi</button>
        </div>
    </div>
</div>

<style>
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .page-header h2 { font-size: 20px; font-weight: 700; color: #fff; }
    
    .content-panel { background: var(--surface); border: 1px solid var(--border-color); border-radius: 12px; overflow: hidden; }
    
    .admin-table { width: 100%; border-collapse: collapse; text-align: left; }
    .admin-table th { padding: 16px 20px; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; color: var(--text-muted); border-bottom: 1px solid var(--border-color); background: rgba(0,0,0,0.2); }
    .admin-table td { padding: 16px 20px; font-size: 14px; border-bottom: 1px solid var(--border-color); vertical-align: middle; }
    .admin-table tbody tr:hover { background: rgba(255,255,255,0.02); }
    
    .tb-poster { width: 50px; height: 75px; object-fit: cover; border-radius: 6px; }
    .tb-title { font-weight: 600; color: #fff; }
    
    .status-badge { display: inline-block; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; }
    .status-badge.now { background: rgba(46, 204, 113, 0.1); color: #2ecc71; border: 1px solid rgba(46, 204, 113, 0.3); }
    .status-badge.soon { background: rgba(241, 196, 15, 0.1); color: #f1c40f; border: 1px solid rgba(241, 196, 15, 0.3); }
    
    .action-btn { background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 6px; font-size: 16px; transition: color 0.2s; }
    .action-btn.edit:hover { color: #3498db; }
    .action-btn.del:hover { color: #e74c3c; }

    /* Modal Styles */
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.8); z-index: 1000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(5px); }
    .modal-box { background: var(--bg-darker); border: 1px solid var(--border-color); border-radius: 16px; width: 100%; max-width: 700px; box-shadow: 0 20px 40px rgba(0,0,0,0.5); display: flex; flex-direction: column; max-height: 90vh; }
    .modal-header { padding: 20px 24px; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; }
    .modal-header h3 { font-size: 18px; color: #fff; }
    .close-btn { background: none; border: none; color: var(--text-muted); font-size: 20px; cursor: pointer; }
    .close-btn:hover { color: #ff4757; }
    
    .modal-body { padding: 24px; overflow-y: auto; }
    
    .form-row { display: flex; gap: 16px; flex-wrap: wrap; }
    .form-group { margin-bottom: 16px; flex: 1; min-width: 150px; }
    .form-group label { display: block; font-size: 13px; color: var(--text-muted); margin-bottom: 8px; font-weight: 600; }
    .form-control { width: 100%; padding: 12px 16px; background: var(--surface); border: 1px solid var(--border-color); border-radius: 8px; color: #fff; font-size: 14px; outline: none; }
    .form-control:focus { border-color: var(--primary); }
    
    .modal-footer { padding: 16px 24px; border-top: 1px solid var(--border-color); display: flex; justify-content: flex-end; gap: 12px; }
    .btn-secondary { background: var(--surface); color: var(--text-main); border: 1px solid var(--border-color); }
    .btn-secondary:hover { background: var(--surface-hover); }
</style>

<script>
let editingId = null;

document.addEventListener("DOMContentLoaded", () => {
    loadMovies();
});

async function loadMovies() {
    try {
        const token = localStorage.getItem("token");
        const res = await fetch(window.location.protocol + "//" + window.location.hostname + ":3000/api/movies/admin/all", {
            headers: { "Authorization": `Bearer ${token}` }
        });
        const movies = await res.json();
        
        const tbody = document.getElementById("movie-tbody");
        if (movies.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 30px;">Không có phim nào!</td></tr>';
            return;
        }

        const today = new Date();

        tbody.innerHTML = movies.map(m => {
            const rDate = new Date(m.release_date);
            let statusHTML = '';
            if (rDate > today) {
                statusHTML = '<span class="status-badge soon">Sắp chiếu</span>';
            } else {
                statusHTML = '<span class="status-badge now">Đang chiếu</span>';
            }
            
            // Serialize dữ liệu phim vào data attribute để dùng cho Edit
            const safeData = encodeURIComponent(JSON.stringify(m));

            return `
            <tr>
                <td>#${m.id}</td>
                <td><img src="${API.getAssetUrl(m.poster)}" class="tb-poster" alt="poster"></td>
                <td><div class="tb-title">${m.title}</div><small style="color: #94a3b8;">${m.age_limit || 'T13'}</small></td>
                <td>${rDate.toLocaleDateString("vi-VN")}</td>
                <td>${m.duration} phút</td>
                <td>${statusHTML}</td>
                <td>
                    <button class="action-btn edit" title="Sửa" onclick="editMovie('${safeData}')"><i class="fa-solid fa-pen-to-square"></i></button>
                    <button class="action-btn del" title="Xoá" onclick="deleteMovie(${m.id})"><i class="fa-solid fa-trash-can"></i></button>
                </td>
            </tr>
            `;
        }).join("");

    } catch (e) {
        document.getElementById("movie-tbody").innerHTML = '<tr><td colspan="7" style="text-align: center; color: red;">Lỗi tải dữ liệu.</td></tr>';
    }
}

function openMovieModal() {
    editingId = null;
    document.getElementById("movieForm").reset();
    document.getElementById("modalTitle").innerText = "Thêm Phim Mới";
    document.getElementById("movieModal").style.display = "flex";
}

function closeMovieModal() {
    document.getElementById("movieModal").style.display = "none";
}

function editMovie(encodedData) {
    const m = JSON.parse(decodeURIComponent(encodedData));
    editingId = m.id;
    
    document.getElementById("modalTitle").innerText = "Chỉnh Sửa Phim: " + m.title;
    document.getElementById("mv_title").value = m.title;
    document.getElementById("mv_age").value = m.age_limit || 'T13';
    document.getElementById("mv_poster").value = m.poster || '';
    document.getElementById("mv_trailer").value = m.trailer_url || '';
    document.getElementById("mv_genres").value = m.genres || '';
    document.getElementById("mv_duration").value = m.duration || '';
    
    // Convert release date format for input type=date
    if (m.release_date) {
        const d = new Date(m.release_date);
        const dateStr = d.toISOString().split('T')[0];
        document.getElementById("mv_release").value = dateStr;
    }
    
    document.getElementById("mv_desc").value = m.description || '';
    
    document.getElementById("movieModal").style.display = "flex";
}

async function saveMovie() {
    const title = document.getElementById("mv_title").value;
    if(!title) { alert("Vui lòng nhập tên phim!"); return; }

    const movieData = {
        title: title,
        age_limit: document.getElementById("mv_age").value,
        poster: document.getElementById("mv_poster").value,
        trailer_url: document.getElementById("mv_trailer").value,
        genres: document.getElementById("mv_genres").value,
        duration: document.getElementById("mv_duration").value,
        release_date: document.getElementById("mv_release").value,
        description: document.getElementById("mv_desc").value
    };

    const token = localStorage.getItem("token");
    const method = editingId ? "PUT" : "POST";
    const url = editingId ? (window.location.protocol + "//" + window.location.hostname + `:3000/api/movies/admin/${editingId}`) : (window.location.protocol + "//" + window.location.hostname + ":3000/api/movies/admin");

    try {
        const res = await fetch(url, {
            method: method,
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(movieData)
        });

        if (res.ok) {
            closeMovieModal();
            loadMovies();
        } else {
            const data = await res.json();
            alert("Lỗi: " + data.message);
        }
    } catch(e) {
        alert("Lỗi mạng khi lưu phim.");
    }
}

async function deleteMovie(id) {
    if (!confirm("Bạn có chắc chắn muốn xoá vĩnh viễn phim này? (Sẽ không thể hoàn tác nếu đã có suất chiếu được tạo)")) return;

    const token = localStorage.getItem("token");
    try {
        const res = await fetch(window.location.protocol + "//" + window.location.hostname + `:3000/api/movies/admin/${id}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });
        
        if (res.ok) {
            loadMovies();
        } else {
            const data = await res.json();
            alert("Lỗi: " + data.message);
        }
    } catch(e) {
        alert("Lỗi mạng khi xoá phim.");
    }
}
</script>
