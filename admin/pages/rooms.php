<div class="page-header">
    <div class="header-actions">
        <select id="cinemaSelect" class="admin-select" onchange="onCinemaChange()">
            <option value="">-- Chọn Rạp Chiếu --</option>
        </select>
        <select id="movieSelect" class="admin-select" onchange="loadDates()">
            <option value="">-- Chọn Phim --</option>
        </select>
        <select id="dateSelect" class="admin-select" onchange="loadTimes()">
            <option value="">-- Chọn Ngày --</option>
        </select>
        <select id="showtimeSelect" class="admin-select" onchange="onShowtimeChange()">
            <option value="">-- Chọn Suất --</option>
        </select>
        
        <button class="btn btn-primary" onclick="showAddRoomModal()"><i class="fa-solid fa-plus"></i> Thêm Phòng</button>
        <button class="btn btn-success" id="setupCentralBtn" onclick="toggleCentralSetup()"><i class="fa-solid fa-vector-square"></i> Thiết lập Vùng Trung Tâm</button>
        <button class="btn btn-dark" onclick="toggleStyleEditor()"><i class="fa-solid fa-palette"></i> Cấu Hình Giao Diện</button>
    </div>
</div>

<div class="room-layout-container">
    <!-- Cột trái: Danh sách phòng & Cấu hình -->
    <aside class="room-sidebar">
        <div class="panel-box sidebar-panel">
            <div class="panel-title">Danh Sách Phòng</div>
            <div id="roomList" class="room-list">
                <div class="empty-state">Vui lòng chọn rạp...</div>
            </div>
            <div id="sidebarActions" class="sidebar-actions" style="display:none; margin-top: 15px; border-top: 1px solid var(--border-color); padding-top: 15px;">
                <button class="btn btn-sm btn-outline btn-block" id="initLayoutBtn" onclick="initRoomLayout()">
                    <i class="fa-solid fa-grid-2"></i> Khởi tạo sơ đồ
                </button>
            </div>
        </div>

        <!-- Panel cấu hình màu sắc & ảnh -->
        <div id="styleEditor" class="panel-box style-panel" style="display:none; margin-top: 20px;">
            <div class="panel-title">Cấu hình Màu & Ảnh</div>
            <div class="style-group">
                <label>Ghế Thường</label>
                <div class="input-row">
                    <input type="color" id="color-normal" value="#4a5568" onchange="updateTheme()">
                    <input type="hidden" id="img-normal">
                    <button class="btn-upload" id="btn-upload-normal" onclick="triggerUpload('normal')" title="Tải ảnh lên">
                        <i class="fa-solid fa-image"></i>
                    </button>
                    <button class="btn-remove" id="btn-remove-normal" onclick="removeImage('normal')" title="Gỡ ảnh">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                    <input type="file" id="file-normal" style="display:none" accept="image/*" onchange="handleFileUpload('normal')">
                </div>
            </div>
            <div class="style-group">
                <label>Ghế VIP</label>
                <div class="input-row">
                    <input type="color" id="color-vip" value="#f1c40f" onchange="updateTheme()">
                    <input type="hidden" id="img-vip">
                    <button class="btn-upload" id="btn-upload-vip" onclick="triggerUpload('vip')" title="Tải ảnh lên">
                        <i class="fa-solid fa-image"></i>
                    </button>
                    <button class="btn-remove" id="btn-remove-vip" onclick="removeImage('vip')" title="Gỡ ảnh">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                    <input type="file" id="file-vip" style="display:none" accept="image/*" onchange="handleFileUpload('vip')">
                </div>
            </div>
            <div class="style-group">
                <label>Sweetbox</label>
                <div class="input-row">
                    <input type="color" id="color-sweetbox" value="#e056fd" onchange="updateTheme()">
                    <input type="hidden" id="img-sweetbox">
                    <button class="btn-upload" id="btn-upload-sweetbox" onclick="triggerUpload('sweetbox')" title="Tải ảnh lên">
                        <i class="fa-solid fa-image"></i>
                    </button>
                    <button class="btn-remove" id="btn-remove-sweetbox" onclick="removeImage('sweetbox')" title="Gỡ ảnh">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                    <input type="file" id="file-sweetbox" style="display:none" accept="image/*" onchange="handleFileUpload('sweetbox')">
                </div>
            </div>
            <div class="style-group">
                <label>Ghế đã đặt</label>
                <div class="input-row">
                    <input type="color" id="color-sold" value="#2d3436" onchange="updateTheme()">
                    <input type="hidden" id="img-sold">
                    <button class="btn-upload" id="btn-upload-sold" onclick="triggerUpload('sold')" title="Tải ảnh lên">
                        <i class="fa-solid fa-image"></i>
                    </button>
                    <button class="btn-remove" id="btn-remove-sold" onclick="removeImage('sold')" title="Gỡ ảnh">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                    <input type="file" id="file-sold" style="display:none" accept="image/*" onchange="handleFileUpload('sold')">
                </div>
            </div>
            <p class="hint">* Cấu hình này sẽ thay đổi giao diện sơ đồ ngay lập tức.</p>
        </div>
    </aside>

    <!-- Cột phải: Sơ đồ ghế -->
    <main class="seat-editor">
        <div class="panel-box">
            <div class="panel-header">
                <div class="room-info-edit">
                    <span id="currentRoomName" class="display-room-name">Chọn một phòng...</span>
                    <button class="btn-icon" id="editRoomBtn" style="display:none;" onclick="editRoomName()"><i class="fa-solid fa-pen"></i></button>
                </div>
                <div class="panel-header-right">
                    <div class="editor-actions" id="editorActions" style="display:none;">
                        <div class="selection-info">Đang chọn: <b id="selectedCount">0</b> ghế</div>
                        <div class="batch-tools">
                            <select id="batchType" class="admin-select small">
                                <option value="">-- Đổi Loại --</option>
                                <option value="normal">Ghế Thường</option>
                                <option value="vip">Ghế VIP</option>
                                <option value="sweetbox">Sweetbox (Đôi)</option>
                                <option value="broken">Khóa (Hỏng)</option>
                            </select>
                            <button class="btn btn-sm btn-success" onclick="applyBatchUpdate()">Áp dụng</button>
                        </div>
                    </div>
                </div>
            </div>

            <div class="seat-canvas-wrapper" id="seatCanvasWrapper">
                <div class="seat-legend-premium">
                    <div class="legend-item"><span class="seat-preview normal"></span> Thường</div>
                    <div class="legend-item"><span class="seat-preview vip"></span> VIP</div>
                    <div class="legend-item"><span class="seat-preview sweetbox"></span> Sweetbox</div>
                    <div class="legend-item"><span class="seat-preview selected"></span> Đã chọn</div>
                    <div class="legend-item"><span class="seat-preview sold"></span> Đã bán</div>
                    <div class="legend-item"><span class="seat-preview central"></span> Vùng trung tâm</div>
                </div>

                <div class="screen-area">MÀN HÌNH</div>

                <div id="seatMap" class="seat-map">
                    <div class="empty-state">Chọn một phòng bên trái để xem sơ đồ...</div>
                </div>
            </div>
        </div>
    </main>
</div>

<style>
    :root {
        --seat-normal: #1a202c;
        --seat-vip: #4a0404;
        --seat-sweetbox: #4a144a;
        --seat-selected: #2ecc71;
        --seat-sold: #2d3436;
        
        --border-normal: #4a5568;
        --border-vip: #e50914;
        --border-sweetbox: #e056fd;
        --border-selected: #2ecc71;
        --border-sold: #2d3436;
    }

    .seat-legend-premium { display: flex; justify-content: center; gap: 30px; margin-bottom: 40px; padding: 15px; background: rgba(0,0,0,0.3); border-radius: 12px; }
    .seat-preview { width: 24px; height: 24px; border-radius: 6px; border: 2px solid transparent; display: inline-block; position: relative; background-size: cover; background-position: center; }
    
    .seat-preview.normal { background-color: var(--seat-normal); border-color: var(--border-normal); background-image: var(--img-normal); }
    .seat-preview.vip { background-color: var(--seat-vip); border-color: var(--border-vip); background-image: var(--img-vip); box-shadow: 0 0 8px rgba(229, 9, 20, 0.4); }
    .seat-preview.sweetbox { background-color: var(--seat-sweetbox); border-color: var(--border-sweetbox); background-image: var(--img-sweetbox); box-shadow: 0 0 8px rgba(224, 86, 253, 0.4); }
    .seat-preview.selected { background-color: var(--seat-selected); border-color: #fff; box-shadow: 0 0 12px var(--seat-selected); }
    .seat-preview.sold { background-color: var(--seat-sold); border-color: var(--border-sold); background-image: var(--img-sold); }
    .seat-preview.central { border: 2px dashed #2ecc71; background: rgba(46, 204, 113, 0.2); }

    .seat.is-central { background: rgba(46, 204, 113, 0.1) !important; }
    
    #centralZoneOverlay {
        position: absolute;
        border: 2px solid #2ecc71;
        border-radius: 8px;
        pointer-events: none;
        z-index: 10;
        box-shadow: 0 0 15px rgba(46, 204, 113, 0.3), inset 0 0 10px rgba(46, 204, 113, 0.1);
        display: none;
        transition: all 0.3s ease;
    }

    /* Style Editor */
    .style-panel { background: linear-gradient(145deg, #1a1d29, #11141d); border: 1px solid var(--primary); }
    .style-group { margin-bottom: 15px; }
    .style-group label { display: block; font-size: 12px; color: var(--text-muted); margin-bottom: 5px; }
    .input-row { display: flex; gap: 8px; }
    .input-row input[type="color"] { width: 40px; height: 32px; border: none; background: none; cursor: pointer; }
    
    .btn-upload {
        width: 32px;
        height: 32px;
        background: var(--bg-darker);
        border: 1px solid var(--border-color);
        color: #fff;
        border-radius: 4px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: 0.2s;
    }
    .btn-upload:hover { border-color: var(--primary); color: var(--primary); }
    .btn-upload.success { border-color: #2ecc71; color: #2ecc71; }
    
    .btn-remove {
        width: 32px;
        height: 32px;
        background: rgba(231, 76, 60, 0.1);
        border: 1px solid rgba(231, 76, 60, 0.3);
        color: #e74c3c;
        border-radius: 4px;
        cursor: pointer;
        display: none;
        align-items: center;
        justify-content: center;
        transition: 0.2s;
    }
    .btn-remove:hover { background: #e74c3c; color: #fff; }
    
    .hint { font-size: 10px; color: var(--text-muted); font-style: italic; margin-top: 10px; }

    .seat { 
        width: 26px; height: 26px; 
        font-size: 8px; font-weight: 800; 
        display: flex; align-items: center; justify-content: center;
        color: rgba(255,255,255,0.9);
        cursor: pointer; transition: all 0.2s;
        border: 1px solid rgba(255,255,255,0.15);
        border-radius: 4px;
        user-select: none;
        background-clip: padding-box;
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
    }
    .seat.normal { background-color: var(--seat-normal); border-color: var(--border-normal); background-image: var(--img-normal); }
    .seat.vip { background-color: var(--seat-vip); border-color: var(--border-vip); background-image: var(--img-vip); }
    .seat.sweetbox { background-color: var(--seat-sweetbox); border-color: var(--border-sweetbox); background-image: var(--img-sweetbox); width: 58px; }
    .seat.broken { background-color: var(--seat-sold); border-color: #333; opacity: 0.3; cursor: not-allowed; position: relative; }
    .seat.broken::after { content: '✕'; position: absolute; font-size: 10px; color: #ff4757; }
    
    .seat.selected { border-color: #fff; box-shadow: 0 0 8px var(--seat-selected); z-index: 2; transform: scale(1.1); }
    .seat:hover { transform: scale(1.15); filter: brightness(1.4); z-index: 1; }

    .seat-map {
        display: flex;
        flex-direction: column;
        gap: 4px;
        align-items: center;
        margin: 10px auto;
        padding: 10px;
        width: fit-content;
    }

    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; padding-bottom: 20px; border-bottom: 1px solid rgba(255,255,255,0.05); }
    .subtitle { color: var(--text-muted); font-size: 12px; margin-top: 4px; }
    .admin-select { 
        background: #1a1d29; 
        border: 1px solid #2d3748; 
        color: #edf2f7; 
        padding: 8px 16px; 
        border-radius: 8px; 
        outline: none; 
        font-size: 14px;
        cursor: pointer;
    }
    .admin-select.small { padding: 4px 8px; font-size: 11px; }

    .room-layout-container { display: grid; grid-template-columns: 280px 1fr; gap: 20px; align-items: flex-start; }
    .panel-box { background: var(--surface); border: 1px solid var(--border-color); border-radius: 12px; padding: 20px; min-height: 500px; }
    .panel-title { font-weight: 700; color: #fff; text-transform: uppercase; font-size: 13px; margin-bottom: 20px; letter-spacing: 1px; }

    /* Sidebar */
    .room-list { display: flex; flex-direction: column; gap: 10px; }
    .room-card { background: var(--bg-darker); border: 1px solid var(--border-color); border-radius: 10px; padding: 15px; cursor: pointer; position: relative; transition: 0.2s; }
    .room-card:hover { border-color: var(--primary); }
    .room-card.active { border-color: var(--primary); background: rgba(229, 9, 20, 0.05); box-shadow: inset 0 0 10px rgba(229, 9, 20, 0.1); }
    .room-card.showtime-target { border-color: #2ecc71; border-style: dashed; }
    .room-card.showtime-target.active { border-style: solid; border-width: 2px; }
    .showtime-badge { position: absolute; top: -10px; right: 10px; background: #2ecc71; color: #fff; font-size: 10px; padding: 2px 8px; border-radius: 10px; font-weight: 700; z-index: 10; }
    .room-card h4 { font-size: 14px; margin-bottom: 5px; color: #fff; }
    .room-card p { font-size: 11px; color: var(--text-muted); }
    .delete-room-btn { position: absolute; top: 10px; right: 10px; color: var(--text-muted); font-size: 12px; opacity: 0; transition: 0.2s; }
    .room-card:hover .delete-room-btn { opacity: 1; }
    .room-card:hover .delete-room-btn:hover { color: var(--primary); }
    .btn-block { width: 100%; justify-content: center; }

    /* Editor */
    .panel-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; border-bottom: 1px solid var(--border-color); padding-bottom: 15px; }
    .display-room-name { font-size: 18px; font-weight: 700; color: #fff; margin-right: 10px; }
    .panel-header-right { display: flex; align-items: center; gap: 15px; }
    .editor-actions { display: flex; align-items: center; gap: 20px; }
    .selection-info { font-size: 13px; color: var(--text-muted); }
    .batch-tools { display: flex; gap: 8px; }

    .seat-canvas-wrapper { padding: 20px; background: rgba(0,0,0,0.2); border-radius: 12px; }
    .screen-area { width: 70%; height: 30px; margin: 0 auto 50px; background: linear-gradient(to bottom, var(--primary), transparent); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 800; border-radius: 50% 50% 0 0 / 100% 100% 0 0; letter-spacing: 5px; opacity: 0.6; }

    .seat-map { display: flex; flex-direction: column; gap: 4px; align-items: center; position: relative; }
    .seat-row { display: flex; gap: 4px; align-items: center; }
    
    .empty-state { text-align: center; padding: 50px; color: var(--text-muted); font-style: italic; }
    .btn-icon { background: none; border: none; color: var(--text-muted); cursor: pointer; }
    .btn-icon:hover { color: var(--primary); }
</style>

<script>
let selectedSeats = new Set();
let currentRoomId = null;

function toggleStyleEditor() {
    const editor = document.getElementById('styleEditor');
    editor.style.display = editor.style.display === 'none' ? 'block' : 'none';
}

function updateTheme(save = true) {
    const root = document.documentElement;
    const colors = {
        normal: document.getElementById('color-normal').value,
        vip: document.getElementById('color-vip').value,
        sweetbox: document.getElementById('color-sweetbox').value,
        sold: document.getElementById('color-sold').value
    };
    const images = {
        normal: document.getElementById('img-normal').value,
        vip: document.getElementById('img-vip').value,
        sweetbox: document.getElementById('img-sweetbox').value,
        sold: document.getElementById('img-sold').value
    };

    root.style.setProperty('--seat-normal', colors.normal);
    root.style.setProperty('--seat-vip', colors.vip);
    root.style.setProperty('--seat-sweetbox', colors.sweetbox);
    root.style.setProperty('--seat-sold', colors.sold);
    
    root.style.setProperty('--img-normal', images.normal ? `url('${API.getAssetUrl(images.normal)}')` : 'none');
    root.style.setProperty('--img-vip', images.vip ? `url('${API.getAssetUrl(images.vip)}')` : 'none');
    root.style.setProperty('--img-sweetbox', images.sweetbox ? `url('${API.getAssetUrl(images.sweetbox)}')` : 'none');
    root.style.setProperty('--img-sold', images.sold ? `url('${API.getAssetUrl(images.sold)}')` : 'none');

    // Lưu vào database
    if (!save) return;

    const showtimeId = document.getElementById('showtimeSelect').value;
    const movieId = document.getElementById('movieSelect').value;

    if (showtimeId) {
        saveShowtimeStyles(showtimeId, colors, images);
    } else if (movieId) {
        saveMovieStyles(movieId, colors, images);
    } else if (currentRoomId) {
        // Nếu không chọn suất/phim, lưu vào cấu hình MẶC ĐỊNH của phòng
        saveRoomStyles(currentRoomId, colors, images);
    } else {
        showToast("Giao diện đã được cập nhật tạm thời (Chưa chọn phòng/phim/suất để lưu)");
    }
}

async function saveMovieStyles(movieId, colors, images) {
    try {
        await API.patch(`/showtimes/admin/movies/${movieId}/styles`, { colors, images });
        showToast("Đã lưu cấu hình giao diện cho PHIM này!");
    } catch (err) {
        showToast(err.message || "Lỗi khi lưu giao diện phim", "error");
    }
}

async function saveRoomStyles(roomId, colors, images) {
    try {
        await API.patch(`/showtimes/admin/rooms/${roomId}/styles`, { colors, images });
        showToast("Đã lưu cấu hình mặc định cho phòng!");
    } catch (err) {
        showToast("Lỗi khi lưu giao diện phòng", "error");
    }
}

async function saveShowtimeStyles(showtimeId, colors, images) {
    try {
        await API.patch(`/showtimes/admin/showtimes/${showtimeId}/styles`, { colors, images });
        showToast("Đã lưu cấu hình giao diện cho suất chiếu này!");
    } catch (err) {
        showToast("Lỗi khi lưu giao diện", "error");
    }
}

async function loadMovies() {
    const cinemaId = document.getElementById('cinemaSelect').value;
    if (!cinemaId) return;
    const movies = await API.get(`/showtimes/admin/cinemas/${cinemaId}/movies`);
    const select = document.getElementById('movieSelect');
    select.innerHTML = '<option value="">-- Chọn Phim --</option>' + 
        movies.map(m => `<option value="${m.id}">${m.title}</option>`).join('');
}

async function loadDates() {
    const cinemaId = document.getElementById('cinemaSelect').value;
    const movieId = document.getElementById('movieSelect').value;
    
    // Reset sub-filters
    document.getElementById('dateSelect').innerHTML = '<option value="">-- Chọn Ngày --</option>';
    document.getElementById('showtimeSelect').innerHTML = '<option value="">-- Chọn Suất --</option>';
    
    if (!cinemaId || !movieId) return;
    const dates = await API.get(`/showtimes/admin/cinemas/${cinemaId}/movies/${movieId}/dates`);
    const select = document.getElementById('dateSelect');
    select.innerHTML = '<option value="">-- Chọn Ngày --</option>' + 
        dates.map(d => `<option value="${d.date}">${d.date}</option>`).join('');

    // Load movie styles as fallback if no showtime selected yet
    loadEffectiveStyles();
}

async function loadTimes() {
    const cinemaId = document.getElementById('cinemaSelect').value;
    const movieId = document.getElementById('movieSelect').value;
    const date = document.getElementById('dateSelect').value;
    
    // Reset sub-filter
    document.getElementById('showtimeSelect').innerHTML = '<option value="">-- Chọn Suất --</option>';
    
    if (!cinemaId || !movieId || !date) return;
    
    try {
        // 1. Nạp danh sách phòng của rạp này để làm bản đồ tra cứu (Lookup Map)
        const rooms = await API.get(`/showtimes/admin/rooms?cinema_id=${cinemaId}`);
        const roomMap = {};
        if (Array.isArray(rooms)) {
            rooms.forEach(r => {
                roomMap[String(r.id)] = r.room_name;
            });
        }

        // 2. Nạp danh sách suất chiếu
        const times = await API.get(`/showtimes/admin/cinemas/${cinemaId}/movies/${movieId}/dates/${date}/times`);
        
        const select = document.getElementById('showtimeSelect');
        select.innerHTML = '<option value="">-- Chọn Suất --</option>' + 
            times.map(t => {
                const rid = t.room_id || t.roomId;
                // Ưu tiên: Tên từ API > Tên từ bản đồ phòng > ID phòng > Cảnh báo
                const rName = t.room_name || roomMap[String(rid)] || (rid ? `Phòng #${rid}` : 'Chưa rõ phòng');
                return `<option value="${t.id}" data-room-id="${rid || ''}">${t.time} (${rName})</option>`;
            }).join('');

        // 3. Tự động chọn nếu chỉ có 1 suất chiếu
        if (times.length === 1) {
            select.value = times[0].id;
            onShowtimeChange();
        }
    } catch (e) {
        console.error("loadTimes error:", e);
    }
}

async function onShowtimeChange() {
    const select = document.getElementById('showtimeSelect');
    const showtimeId = select.value;
    if (!showtimeId) {
        loadEffectiveStyles();
        return;
    }
    
    try {
        const showtime = await API.get(`/showtimes/admin/${showtimeId}`);
        if (showtime) {
            // Chỉ chuyển phòng nếu suất chiếu thuộc phòng khác
            if (showtime.room_id != currentRoomId) {
                await selectRoom(showtime.room_id, showtime.room_name, true);
                // Đảm bảo sau khi load phòng, suất chiếu vẫn được chọn
                select.value = showtimeId;
            }
        }
        loadEffectiveStyles();
    } catch (e) {
        console.error("onShowtimeChange error:", e);
    }
}

async function loadEffectiveStyles() {
    const showtimeId = document.getElementById('showtimeSelect').value;
    const movieId = document.getElementById('movieSelect').value;

    try {
        // 1. Ưu tiên 1: Suất chiếu cụ thể
        if (showtimeId) {
            const config = await API.get(`/showtimes/admin/showtimes/${showtimeId}/config`);
            if (config && config.styles && (config.styles.colors || config.styles.images)) {
                applyStylesToUI(config.styles);
                updateTheme(false);
                return;
            }
        }

        // 2. Ưu tiên 2: Phim cụ thể
        if (movieId) {
            const config = await API.get(`/showtimes/admin/movies/${movieId}/config`);
            if (config && config.styles && (config.styles.colors || config.styles.images)) {
                applyStylesToUI(config.styles);
                updateTheme(false);
                return;
            }
        }

        // 3. Ưu tiên 3: Phòng chiếu (Mặc định)
        if (currentRoomId) {
            const roomData = await API.get(`/showtimes/admin/rooms/${currentRoomId}`);
            if (roomData && roomData.seat_styles) {
                const s = typeof roomData.seat_styles === 'string' ? JSON.parse(roomData.seat_styles) : roomData.seat_styles;
                if (s && (s.colors || s.images)) {
                    applyStylesToUI(s);
                    updateTheme(false);
                    return;
                }
            }
        }

        // 4. Mặc định hệ thống
        resetStyles();
    } catch (err) {
        console.warn("loadEffectiveStyles error:", err);
    }
}

function applyStylesToUI(s) {
    if (s.colors) {
        document.getElementById('color-normal').value = s.colors.normal || '#4a5568';
        document.getElementById('color-vip').value = s.colors.vip || '#f1c40f';
        document.getElementById('color-sweetbox').value = s.colors.sweetbox || '#e056fd';
        document.getElementById('color-sold').value = s.colors.sold || '#2d3436';
    }
    if (s.images) {
        document.getElementById('img-normal').value = s.images.normal || '';
        document.getElementById('img-vip').value = s.images.vip || '';
        document.getElementById('img-sweetbox').value = s.images.sweetbox || '';
        document.getElementById('img-sold').value = s.images.sold || '';
        
        ['normal', 'vip', 'sweetbox', 'sold'].forEach(type => {
            const btn = document.getElementById(`btn-upload-${type}`);
            const removeBtn = document.getElementById(`btn-remove-${type}`);
            if (s.images[type]) {
                btn.classList.add('success');
                removeBtn.style.display = 'flex';
            } else {
                btn.classList.remove('success');
                removeBtn.style.display = 'none';
            }
        });
    }
}

function resetStyles() {
    document.getElementById('img-normal').value = '';
    document.getElementById('img-vip').value = '';
    document.getElementById('img-sweetbox').value = '';
    document.getElementById('img-sold').value = '';
    
    // Reset color pickers to defaults
    document.getElementById('color-normal').value = '#4a5568';
    document.getElementById('color-vip').value = '#f1c40f';
    document.getElementById('color-sweetbox').value = '#e056fd';
    document.getElementById('color-sold').value = '#2d3436';

    ['normal', 'vip', 'sweetbox', 'sold'].forEach(type => {
        const btn = document.getElementById(`btn-upload-${type}`);
        const removeBtn = document.getElementById(`btn-remove-${type}`);
        btn.classList.remove('success');
        btn.innerHTML = '<i class="fa-solid fa-image"></i>';
        if (removeBtn) removeBtn.style.display = 'none';
    });
    updateTheme(false);
}

async function initPage() {
    try {
        const cinemas = await API.get('/showtimes/cinemas');
        const select = document.getElementById('cinemaSelect');
        if (!select) return;
        
        select.innerHTML = '<option value="">-- Chọn Rạp Chiếu --</option>';
        cinemas.forEach(c => {
            select.innerHTML += `<option value="${c.id}">${c.name} - ${c.address}</option>`;
        });
    } catch(e) {
        console.error("initPage error:", e);
        showToast("Lỗi tải rạp chiếu", "error");
    }
}

async function onCinemaChange() {
    loadRooms();
    loadMovies();
    // Reset sub-filters
    document.getElementById('movieSelect').innerHTML = '<option value="">-- Chọn Phim --</option>';
    document.getElementById('dateSelect').innerHTML = '<option value="">-- Chọn Ngày --</option>';
    document.getElementById('showtimeSelect').innerHTML = '<option value="">-- Chọn Suất --</option>';
}

async function loadRooms() {
    const cinemaId = document.getElementById('cinemaSelect').value;
    if(!cinemaId) return;

    try {
        const rooms = await API.get(`/showtimes/admin/rooms?cinema_id=${cinemaId}`);
        const list = document.getElementById('roomList');
        if(rooms.length === 0) {
            list.innerHTML = '<div class="empty-state">Rạp này chưa có phòng...</div>';
            return;
        }
        const showtimeSelect = document.getElementById('showtimeSelect');
        const selectedOption = showtimeSelect.selectedOptions[0];
        const showtimeRoomId = selectedOption ? selectedOption.dataset.roomId : null;

        list.innerHTML = rooms.map(r => {
            const isShowtimeRoom = (showtimeRoomId == r.id);
            const isActive = (currentRoomId == r.id);
            
            return `
                <div class="room-card ${isActive ? 'active' : ''} ${isShowtimeRoom ? 'showtime-target' : ''}" 
                     id="room-${r.id}" onclick="selectRoom(${r.id}, '${r.room_name}')">
                    ${isShowtimeRoom ? '<span class="showtime-badge">Suất đang chọn</span>' : ''}
                    <h4>${r.room_name}</h4>
                    <p>${r.total_seats} Ghế tổng cộng</p>
                    <button class="delete-room-btn" onclick="deleteRoom(${r.id}, event)"><i class="fa-solid fa-trash"></i></button>
                </div>
            `;
        }).join('');
    } catch(e) {
        showToast("Lỗi tải danh sách phòng", "error");
    }
}

async function selectRoom(id, name, isInternalCall = false) {
    currentRoomId = id;
    document.querySelectorAll('.room-card').forEach(c => c.classList.remove('active'));
    if (document.getElementById(`room-${id}`)) {
        document.getElementById(`room-${id}`).classList.add('active');
    }
    
    // Bỏ chữ "Phòng" để hiển thị gọn hơn
    const safeName = String(name || id);
    const displayName = safeName.replace(/^Phòng\s+/i, '');
    document.getElementById('currentRoomName').innerText = displayName;
    document.getElementById('editRoomBtn').style.display = 'inline-block';
    document.getElementById('sidebarActions').style.display = 'block';
    document.getElementById('editorActions').style.display = 'none';
    selectedSeats.clear();
    updateSelectionUI();

    // Reset showtime selection if this was a manual room click AND the room changed
    if (!isInternalCall) {
        const showtimeSelect = document.getElementById('showtimeSelect');
        const selectedOption = showtimeSelect.selectedOptions[0];
        const showtimeRoomId = selectedOption ? selectedOption.dataset.roomId : null;

        if (showtimeSelect.value && showtimeRoomId == id) {
            // Cùng phòng với suất đang chọn -> Giữ nguyên suất
            console.log("Keeping showtime selection for room", id);
        } else {
            showtimeSelect.value = '';
            resetStyles();
        }
    }

    // Reset Central Setup Mode
    isCentralSetupMode = false;
    centralStartSeat = null;
    const centralBtn = document.getElementById('setupCentralBtn');
    if (centralBtn) {
        centralBtn.innerHTML = '<i class="fa-solid fa-vector-square"></i> Thiết lập Vùng Trung Tâm';
        centralBtn.classList.replace('btn-warning', 'btn-success');
    }

    const map = document.getElementById('seatMap');
    map.innerHTML = '<div class="empty-state">Đang tải sơ đồ...</div>';

    try {
        const seats = await API.get(`/showtimes/admin/rooms/${id}/seats`);
        if (seats.length === 0) {
            map.innerHTML = `
                <div class="empty-state">
                    <p>Phòng này chưa có sơ đồ ghế.</p>
                    <button class="btn btn-primary" onclick="initRoomLayout()"><i class="fa-solid fa-plus"></i> Khởi tạo ngay</button>
                </div>
            `;
        } else {
            renderSeatMap(seats);
            
            // Tải thông tin phòng để lấy metadata vùng trung tâm
            let roomData = null;
            try {
                roomData = await API.get(`/showtimes/admin/rooms/${id}`);
            } catch(e) {
                console.warn("Could not load room metadata:", e);
            }

            // Tải cấu hình giao diện (Suất -> Phim -> Phòng)
            try {
                await loadEffectiveStyles();
            } catch(e) {
                console.warn("Could not load effective styles:", e);
            }
                
            if (roomData) {
                // Cập nhật metadata vùng trung tâm
                roomCentralMetadata = roomData.central_metadata;
                if (typeof roomCentralMetadata === 'string') {
                    try { roomCentralMetadata = JSON.parse(roomCentralMetadata); } catch(e) {}
                }
                highlightCentralZone();
            }
        }
    } catch(e) {
        console.error("selectRoom Error:", e);
        map.innerHTML = `<div class="empty-state">Lỗi tải ghế: ${e.message}</div>`;
    }
}

function renderSeatMap(seats) {
    const map = document.getElementById('seatMap');
    map.innerHTML = '<div id="centralZoneOverlay"></div>';
    
    // Group by row
    const rows = {};
    seats.forEach(s => {
        if(!rows[s.seat_row]) rows[s.seat_row] = [];
        rows[s.seat_row].push(s);
    });

    Object.keys(rows).sort().forEach(row => {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'seat-row';
        
        rows[row].sort((a,b) => a.seat_number - b.seat_number).forEach(s => {
            const seat = document.createElement('div');
            seat.className = `seat ${s.seat_type}`;
            seat.textContent = `${s.seat_row}${s.seat_number}`;
            seat.dataset.id = s.id;
            
            seat.onclick = (e) => {
                if (isCentralSetupMode) {
                    handleCentralSelection(s);
                    return;
                }
                if(seat.classList.contains('selected')) {
                    selectedSeats.delete(s.id);
                    seat.classList.remove('selected');
                } else {
                    selectedSeats.add(s.id);
                    seat.classList.add('selected');
                }
                updateSelectionUI();
            };
            
            rowDiv.appendChild(seat);
        });
        
        map.appendChild(rowDiv);
    });

    highlightCentralZone();
}

let isCentralSetupMode = false;
let centralStartSeat = null;
let roomCentralMetadata = null;

function toggleCentralSetup() {
    if (!currentRoomId) return showToast("Vui lòng chọn một phòng trước", "error");
    isCentralSetupMode = !isCentralSetupMode;
    const btn = document.getElementById('setupCentralBtn');
    
    if (isCentralSetupMode) {
        btn.innerHTML = '<i class="fa-solid fa-check"></i> Lưu Vùng Trung Tâm';
        btn.classList.replace('btn-success', 'btn-warning');
        showToast("Chọn ghế bắt đầu và kết thúc để tạo vùng trung tâm (Hình chữ nhật)");
        centralStartSeat = null;
    } else {
        saveCentralZone();
        btn.innerHTML = '<i class="fa-solid fa-vector-square"></i> Thiết lập Vùng Trung Tâm';
        btn.classList.replace('btn-warning', 'btn-success');
    }
}

function handleCentralSelection(s) {
    if (!centralStartSeat) {
        centralStartSeat = s;
        showToast(`Bắt đầu từ ${s.seat_code}. Chọn tiếp ghế kết thúc.`);
        // Tạm thời highlight ghế bắt đầu
        document.querySelectorAll('.seat').forEach(el => el.classList.remove('is-central'));
        document.querySelector(`.seat[data-id="${s.id}"]`).classList.add('is-central');
    } else {
        const r1 = centralStartSeat.seat_row.charCodeAt(0);
        const r2 = s.seat_row.charCodeAt(0);
        const n1 = centralStartSeat.seat_number;
        const n2 = s.seat_number;

        roomCentralMetadata = {
            row_start: String.fromCharCode(Math.min(r1, r2)),
            row_end: String.fromCharCode(Math.max(r1, r2)),
            num_start: Math.min(n1, n2),
            num_end: Math.max(n1, n2)
        };

        highlightCentralZone();
        centralStartSeat = null;
        showToast("Đã xác định vùng trung tâm. Nhấn nút màu vàng để lưu.");
    }
}

function highlightCentralZone() {
    if (!roomCentralMetadata) return;
    const { row_start, row_end, num_start, num_end } = roomCentralMetadata;
    const centralSeats = [];

    document.querySelectorAll('.seat').forEach(el => {
        const code = el.textContent;
        const row = code[0];
        const num = parseInt(code.slice(1));
        
        if (row >= row_start && row <= row_end && num >= num_start && num <= num_end) {
            el.classList.add('is-central');
            centralSeats.push(el);
        } else {
            el.classList.remove('is-central');
        }
    });

    const overlay = document.getElementById('centralZoneOverlay');
    if (centralSeats.length > 0 && overlay) {
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        centralSeats.forEach(el => {
            const rect = {
                left: el.offsetLeft,
                top: el.offsetTop,
                right: el.offsetLeft + el.offsetWidth,
                bottom: el.offsetTop + el.offsetHeight
            };
            minX = Math.min(minX, rect.left);
            minY = Math.min(minY, rect.top);
            maxX = Math.max(maxX, rect.right);
            maxY = Math.max(maxY, rect.bottom);
        });

        const padding = 6;
        overlay.style.display = 'block';
        overlay.style.left = (minX - padding) + 'px';
        overlay.style.top = (minY - padding) + 'px';
        overlay.style.width = (maxX - minX + padding * 2) + 'px';
        overlay.style.height = (maxY - minY + padding * 2) + 'px';
    } else if (overlay) {
        overlay.style.display = 'none';
    }
}

async function saveCentralZone() {
    try {
        await API.put(`/showtimes/admin/rooms/${currentRoomId}/central`, { central_metadata: roomCentralMetadata });
        showToast("Đã lưu vùng trung tâm cho phòng này!");
    } catch (err) {
        showToast("Lỗi khi lưu vùng trung tâm", "error");
    }
}

function updateSelectionUI() {
    const count = selectedSeats.size;
    document.getElementById('selectedCount').innerText = count;
    document.getElementById('editorActions').style.display = count > 0 ? 'flex' : 'none';
}

async function applyBatchUpdate() {
    const type = document.getElementById('batchType').value;
    if(!type) return showToast("Vui lòng chọn thao tác", "error");

    const payload = {
        seat_ids: Array.from(selectedSeats),
        seat_type: type
    };

    try {
        await API.patch('/showtimes/admin/seats/batch', payload);
        showToast("Cập nhật ghế thành công");
        selectRoom(currentRoomId, document.getElementById('currentRoomName').innerText);
    } catch(e) {
        showToast("Lỗi cập nhật ghế", "error");
    }
}

async function editRoomName() {
    const oldName = document.getElementById('currentRoomName').innerText;
    const newName = prompt("Nhập tên mới cho phòng:", oldName);
    if(!newName || newName === oldName) return;

    try {
        await API.put(`/showtimes/admin/rooms/${currentRoomId}`, { room_name: newName });
        showToast("Đổi tên phòng thành công");
        loadRooms();
        document.getElementById('currentRoomName').innerText = newName;
    } catch(e) {
        showToast("Lỗi đổi tên phòng", "error");
    }
}

async function deleteRoom(id, e) {
    e.stopPropagation();
    showConfirm("Bạn có chắc chắn muốn xoá phòng này? Toàn bộ sơ đồ ghế sẽ bị mất!", async () => {
        try {
            await API.delete(`/showtimes/admin/rooms/${id}`);
            showToast("Đã xoá phòng");
            loadRooms();
            if(currentRoomId === id) {
                document.getElementById('seatMap').innerHTML = '<div class="empty-state">Chọn một phòng...</div>';
                document.getElementById('currentRoomName').innerText = 'Chọn một phòng...';
                document.getElementById('editRoomBtn').style.display = 'none';
            }
        } catch(e) {
            showToast(e.message, "error");
        }
    });
}

function showAddRoomModal() {
    const cinemaId = document.getElementById('cinemaSelect').value;
    if(!cinemaId) return showToast("Vui lòng chọn rạp trước", "error");
    
    const name = prompt("Nhập tên phòng mới (Ví dụ: Phòng 01):");
    if(!name) return;
    
    API.post('/showtimes/admin/rooms', { 
        room_name: name, 
        cinema_id: cinemaId,
        rows: 0, // Sẽ khởi tạo sơ đồ sau
        cols: 0
    })
    .then(() => {
        showToast("Thêm phòng thành công. Hãy nhấn 'Khởi tạo sơ đồ' để thiết lập ghế.");
        loadRooms();
    })
    .catch(e => showToast(e.message, "error"));
}

async function initRoomLayout() {
    if(!currentRoomId) return;
    const rows = prompt("Nhập số hàng ghế (Ví dụ: 10):", "10");
    if(rows === null) return; // User cancelled
    const cols = prompt("Nhập số ghế mỗi hàng (Ví dụ: 12):", "12");
    if(cols === null) return; // User cancelled

    const rowsNum = parseInt(rows);
    const colsNum = parseInt(cols);

    if(isNaN(rowsNum) || isNaN(colsNum) || rowsNum < 1 || colsNum < 1) {
        return showToast("Số hàng và số ghế mỗi hàng phải là số nguyên dương (≥ 1)", "error");
    }
    if(rowsNum > 26) {
        return showToast("Số hàng tối đa là 26 (A-Z)", "error");
    }

    try {
        await API.post(`/showtimes/admin/rooms/${currentRoomId}/init`, {
            rows: rowsNum,
            cols: colsNum
        });
        showToast("Khởi tạo sơ đồ ghế thành công");
        loadRooms();
        selectRoom(currentRoomId, document.getElementById('currentRoomName').innerText);
    } catch(e) {
        showToast(e.message, "error");
    }
}

function triggerUpload(type) {
    document.getElementById(`file-${type}`).click();
}

async function handleFileUpload(type) {
    const fileInput = document.getElementById(`file-${type}`);
    const file = fileInput.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('seatImage', file);

    try {
        const btn = document.getElementById(`btn-upload-${type}`);
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
        
        const res = await fetch(`${API.BASE}/uploads/actions/seats`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: formData
        });

        const data = await res.json();
        if (res.ok) {
            document.getElementById(`img-${type}`).value = data.url;
            btn.innerHTML = '<i class="fa-solid fa-check"></i>';
            btn.classList.add('success');
            document.getElementById(`btn-remove-${type}`).style.display = 'flex';
            showToast("Tải ảnh lên thành công");
            updateTheme();
        } else {
            showToast(data.message || "Lỗi tải ảnh", "error");
            btn.innerHTML = '<i class="fa-solid fa-image"></i>';
        }
    } catch (e) {
        showToast("Lỗi kết nối server", "error");
        console.error(e);
        const btn = document.getElementById(`btn-upload-${type}`);
        btn.innerHTML = '<i class="fa-solid fa-image"></i>';
    }
}

function removeImage(type) {
    document.getElementById(`img-${type}`).value = '';
    const btn = document.getElementById(`btn-upload-${type}`);
    btn.innerHTML = '<i class="fa-solid fa-image"></i>';
    btn.classList.remove('success');
    document.getElementById(`btn-remove-${type}`).style.display = 'none';
    showToast("Đã gỡ ảnh");
    updateTheme();
}

document.addEventListener('DOMContentLoaded', initPage);
</script>
