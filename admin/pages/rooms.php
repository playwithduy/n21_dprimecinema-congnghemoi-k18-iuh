<div class="page-header">
    <div class="header-left">
        <h2>Sơ Đồ Phòng Chiếu</h2>
        <p class="subtitle">Quản lý rạp, phòng và cấu hình sơ đồ ghế ngồi</p>
    </div>
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
    
    .seat-preview.normal { background-color: var(--seat-normal); border-color: var(--border-normal); }
    .seat-preview.vip { background-color: var(--seat-vip); border-color: var(--border-vip); box-shadow: 0 0 8px rgba(229, 9, 20, 0.4); }
    .seat-preview.sweetbox { background-color: var(--seat-sweetbox); border-color: var(--border-sweetbox); box-shadow: 0 0 8px rgba(224, 86, 253, 0.4); }
    .seat-preview.selected { background-color: var(--seat-selected); border-color: #fff; box-shadow: 0 0 12px var(--seat-selected); }
    .seat-preview.sold { background-color: var(--seat-sold); border-color: var(--border-sold); background-size: cover; background-position: center; background-image: var(--img-sold); }
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
    }
    .seat.normal { background-color: var(--seat-normal); border-color: var(--border-normal); }
    .seat.vip { background-color: var(--seat-vip); border-color: var(--border-vip); }
    .seat.sweetbox { background-color: var(--seat-sweetbox); border-color: var(--border-sweetbox); width: 58px; }
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

function updateTheme() {
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
    
    root.style.setProperty('--img-normal', images.normal ? `url('${window.APP_CONFIG.API_BASE}/${images.normal}')` : 'none');
    root.style.setProperty('--img-vip', images.vip ? `url('${window.APP_CONFIG.API_BASE}/${images.vip}')` : 'none');
    root.style.setProperty('--img-sweetbox', images.sweetbox ? `url('${window.APP_CONFIG.API_BASE}/${images.sweetbox}')` : 'none');
    root.style.setProperty('--img-sold', images.sold ? `url('${window.APP_CONFIG.API_BASE}/${images.sold}')` : 'none');

    // Lưu vào database nếu có suất chiếu đang chọn
    const showtimeId = document.getElementById('showtimeSelect').value;
    if (showtimeId) {
        saveShowtimeStyles(showtimeId, colors, images);
    } else {
        showToast("Giao diện đã được cập nhật tạm thời (Chưa chọn suất chiếu để lưu)");
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
}

async function loadTimes() {
    const cinemaId = document.getElementById('cinemaSelect').value;
    const movieId = document.getElementById('movieSelect').value;
    const date = document.getElementById('dateSelect').value;
    
    // Reset sub-filter
    document.getElementById('showtimeSelect').innerHTML = '<option value="">-- Chọn Suất --</option>';
    
    if (!cinemaId || !movieId || !date) return;
    const times = await API.get(`/showtimes/admin/cinemas/${cinemaId}/movies/${movieId}/dates/${date}/times`);
    const select = document.getElementById('showtimeSelect');
    select.innerHTML = '<option value="">-- Chọn Suất --</option>' + 
        times.map(t => `<option value="${t.id}">${t.time}</option>`).join('');
}

async function onShowtimeChange() {
    const showtimeId = document.getElementById('showtimeSelect').value;
    if (!showtimeId) {
        // Reset styles to default
        document.getElementById('img-normal').value = '';
        document.getElementById('img-vip').value = '';
        document.getElementById('img-sweetbox').value = '';
        document.getElementById('img-sold').value = '';
        ['normal', 'vip', 'sweetbox', 'sold'].forEach(type => {
            document.getElementById(`btn-upload-${type}`).classList.remove('success');
        });
        updateTheme();
        return;
    }
    const config = await API.get(`/showtimes/admin/showtimes/${showtimeId}/config`);
    if (config && config.styles) {
        const s = config.styles;
        if (s.colors) {
            document.getElementById('color-normal').value = s.colors.normal || '#2a2e3d';
            document.getElementById('color-vip').value = s.colors.vip || '#e50914';
            document.getElementById('color-sweetbox').value = s.colors.sweetbox || '#e056fd';
            document.getElementById('color-sold').value = s.colors.sold || '#2d3436';
        }
        if (s.images) {
            document.getElementById('img-normal').value = s.images.normal || '';
            document.getElementById('img-vip').value = s.images.vip || '';
            document.getElementById('img-sweetbox').value = s.images.sweetbox || '';
            document.getElementById('img-sold').value = s.images.sold || '';
            
            // Highlight buttons if has image
            ['normal', 'vip', 'sweetbox', 'sold'].forEach(type => {
                const btn = document.getElementById(`btn-upload-${type}`);
                if (s.images[type]) btn.classList.add('success');
                else btn.classList.remove('success');
            });
        }
        updateTheme();
    }
}

async function initPage() {
    try {
        const cinemas = await API.get('/showtimes/cinemas');
        const select = document.getElementById('cinemaSelect');
        cinemas.forEach(c => {
            select.innerHTML += `<option value="${c.id}">${c.name} - ${c.address}</option>`;
        });
    } catch(e) {
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
        list.innerHTML = rooms.map(r => `
            <div class="room-card" id="room-${r.id}" onclick="selectRoom(${r.id}, '${r.room_name}')">
                <h4>${r.room_name}</h4>
                <p>${r.total_seats} Ghế tổng cộng</p>
                <button class="delete-room-btn" onclick="deleteRoom(${r.id}, event)"><i class="fa-solid fa-trash"></i></button>
            </div>
        `).join('');
    } catch(e) {
        showToast("Lỗi tải danh sách phòng", "error");
    }
}

async function selectRoom(id, name) {
    currentRoomId = id;
    document.querySelectorAll('.room-card').forEach(c => c.classList.remove('active'));
    if (document.getElementById(`room-${id}`)) {
        document.getElementById(`room-${id}`).classList.add('active');
    }
    
    // Bỏ chữ "Phòng" để hiển thị gọn hơn
    const displayName = name.replace(/^Phòng\s+/i, '');
    document.getElementById('currentRoomName').innerText = displayName;
    document.getElementById('editRoomBtn').style.display = 'inline-block';
    document.getElementById('sidebarActions').style.display = 'block';
    document.getElementById('editorActions').style.display = 'none';
    selectedSeats.clear();
    updateSelectionUI();

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
            const roomData = await API.get(`/showtimes/admin/rooms/${id}`);
            roomCentralMetadata = roomData.central_metadata;
            if (typeof roomCentralMetadata === 'string') {
                try { roomCentralMetadata = JSON.parse(roomCentralMetadata); } catch(e) {}
            }
            renderSeatMap(seats);
        }
    } catch(e) {
        map.innerHTML = '<div class="empty-state">Lỗi tải ghế!</div>';
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
    const cols = prompt("Nhập số ghế mỗi hàng (Ví dụ: 12):", "12");
    if(!rows || !cols || isNaN(rows) || isNaN(cols)) return;

    try {
        await API.post(`/showtimes/admin/rooms/${currentRoomId}/init`, {
            rows: parseInt(rows),
            cols: parseInt(cols)
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
        
        const res = await fetch(`${window.APP_CONFIG.API_BASE}/showtimes/uploads/actions/seats`, {
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

document.addEventListener('DOMContentLoaded', initPage);
</script>
