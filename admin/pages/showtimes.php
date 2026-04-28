<div class="page-header">
    <div>
        <h2>Lịch Chiếu & Khung Giờ</h2>
        <p style="color:var(--text-muted);font-size:13px;margin-top:4px;" id="st-count">Đang tải...</p>
    </div>
    <div class="header-actions">
        <div class="tabs-container" style="margin-right:20px; margin-bottom:0; padding-bottom:0; border:none;">
            <div class="tab-btn active" onclick="switchView('list')"><i class="fa-solid fa-list"></i> Dạng Danh Sách</div>
            <div class="tab-btn" onclick="switchView('timetable')"><i class="fa-regular fa-calendar-days"></i> Dạng Lịch Tuần</div>
        </div>
        <select id="st-cinema-filter" class="form-control" style="width:160px;" onchange="reloadCurrentView()">
            <option value="">Tất cả rạp</option>
        </select>
        <button class="btn btn-primary" onclick="openStModal()"><i class="fa-solid fa-calendar-plus"></i> Thêm C.Chiếu</button>
    </div>
</div>

<!-- TABS CONTENT: LIST VIEW -->
<div id="view-list" class="view-content active">
    <div style="margin-bottom:16px; display:flex;">
        <input type="date" id="st-date-filter" class="form-control" value="<?php echo date('Y-m-d'); ?>" onchange="loadShowtimes()">
    </div>
    <div class="content-panel">
        <table class="admin-table">
            <thead>
                <tr>
                    <th>Phim</th>
                    <th>Ngày</th>
                    <th>Giờ chiếu</th>
                    <th>Rạp</th>
                    <th>Phòng</th>
                    <th>Định dạng</th>
                    <th>Ngôn ngữ</th>
                    <th width="80">Xoá</th>
                </tr>
            </thead>
            <tbody id="st-tbody">
                <tr><td colspan="8" class="loading-cell"><i class="fa-solid fa-spinner fa-spin"></i> Đang tải...</td></tr>
            </tbody>
        </table>
    </div>
</div>

<!-- TABS CONTENT: TIMETABLE VIEW -->
<div id="view-timetable" class="view-content" style="display:none;">
    <div class="timetable-nav">
        <button class="btn btn-secondary" onclick="changeWeek(-1)"><i class="fa-solid fa-chevron-left"></i> Tuần Trước</button>
        <div class="current-week-label" id="week-label">Đang tải tuần...</div>
        <button class="btn btn-secondary" onclick="changeWeek(1)">Tuần Sau <i class="fa-solid fa-chevron-right"></i></button>
    </div>
    
    <div class="content-panel" style="overflow-x:auto;">
        <table class="timetable">
            <thead>
                <tr id="tt-header">
                    <th width="80" class="time-col">Ca học</th>
                    <!-- Ngày trong tuần sẽ được JS gen ra -->
                </tr>
            </thead>
            <tbody>
                <tr id="row-sang">
                    <td class="time-col">Sáng<br><small>&lt; 12:00</small></td>
                </tr>
                <tr id="row-chieu">
                    <td class="time-col">Chiều<br><small>12:00 - 18:00</small></td>
                </tr>
                <tr id="row-toi">
                    <td class="time-col">Tối<br><small>&gt; 18:00</small></td>
                </tr>
            </tbody>
        </table>
    </div>
    
    <div class="tt-legend">
        <div class="legend-item"><span class="box bg-green"></span> Trống trải (>70% ghế trống)</div>
        <div class="legend-item"><span class="box bg-yellow"></span> Đang đông (30-70% trống)</div>
        <div class="legend-item"><span class="box bg-red"></span> Gần full / Hết vé (<30% trống)</div>
    </div>
</div>

<!-- Modal tạo suất chiếu -->
<div id="stModal" class="modal-overlay" style="display:none">
    <div class="modal-box" style="max-width:560px">
        <div class="modal-header">
            <h3>Tạo Suất Chiếu Mới</h3>
            <button class="close-btn" onclick="closeStModal()"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <div class="modal-body">
            <div class="form-group">
                <label>Phim *</label>
                <select id="st_movie" class="form-control"></select>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Ngày chiếu *</label>
                    <input type="date" id="st_date" class="form-control" value="<?php echo date('Y-m-d'); ?>">
                </div>
                <div class="form-group">
                    <label>Giờ chiếu *</label>
                    <input type="time" id="st_time" class="form-control" value="09:00">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Rạp *</label>
                    <select id="st_cinema" class="form-control" onchange="filterRooms()"></select>
                </div>
                <div class="form-group">
                    <label>Phòng *</label>
                    <select id="st_room" class="form-control"></select>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Định dạng</label>
                    <select id="st_format" class="form-control"></select>
                </div>
                <div class="form-group">
                    <label>Ngôn ngữ</label>
                    <select id="st_language" class="form-control"></select>
                </div>
            </div>

            <div style="margin:20px 0 10px; border-bottom:1px solid var(--border-color); padding-bottom:10px;">
                <h4 style="color:#fff; font-size:14px; display:flex; align-items:center; gap:8px;">
                    <i class="fa-solid fa-tags" style="color:var(--primary)"></i> Thiết lập Giá & Combo
                </h4>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label>Ghế Thường *</label>
                    <input type="number" id="price_normal" class="form-control" value="45000">
                </div>
                <div class="form-group">
                    <label>Ghế VIP *</label>
                    <input type="number" id="price_vip" class="form-control" value="65000">
                </div>
                <div class="form-group">
                    <label>Ghế Sweetbox *</label>
                    <input type="number" id="price_sweetbox" class="form-control" value="120000">
                </div>
            </div>

            <div class="form-group">
                <label>Chọn Combo khả dụng (Tích để kích hoạt)</label>
                <div id="st_combos_list" style="display:grid; grid-template-columns:1fr 1fr; gap:10px; max-height:150px; overflow-y:auto; border:1px solid var(--border-color); border-radius:8px; padding:12px; background:rgba(0,0,0,0.2);">
                    <p style="color:var(--text-muted); font-size:12px;">Đang tải combo...</p>
                </div>
            </div>
            <div id="st-warning" class="st-warning" style="display:none"></div>
        </div>
        <div class="modal-footer">
            <button class="btn btn-secondary" onclick="closeStModal()">Huỷ</button>
            <button class="btn btn-primary" onclick="saveShowtime()"><i class="fa-solid fa-calendar-check"></i> Tạo Suất Chiếu</button>
        </div>
    </div>
</div>

<style>
    .page-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:24px; }
    .page-header h2 { font-size:20px; font-weight:700; color:#fff; }
    .form-control { border:1px solid var(--border-color); border-radius:8px; color:#fff; padding:10px 16px; outline:none; background:var(--surface); font-size:14px; }
    .form-control option { background:#1a1d29; }
    .content-panel { background:var(--surface); border:1px solid var(--border-color); border-radius:12px; overflow:hidden; }
    
    /* Tabs & views */
    .tabs-container { display:flex; gap:5px; background:rgba(0,0,0,0.3); padding:4px; border-radius:10px; }
    .tab-btn { padding:8px 16px; font-size:13px; font-weight:600; color:var(--text-muted); cursor:pointer; border-radius:8px; transition:all 0.2s; display:flex; align-items:center; gap:8px; }
    .tab-btn:hover { color:#fff; }
    .tab-btn.active { background:var(--primary); color:#fff; box-shadow:0 2px 10px rgba(229, 9, 20, 0.3); }
    .view-content { animation: fadeIn 0.3s ease; }
    @keyframes fadeIn { from {opacity:0; transform:translateY(5px)} to {opacity:1; transform:translateY(0)} }
    
    /* List View Table */
    .admin-table { width:100%; border-collapse:collapse; text-align:left; }
    .admin-table th { padding:14px 20px; font-size:12px; text-transform:uppercase; letter-spacing:1px; color:var(--text-muted); border-bottom:1px solid var(--border-color); background:rgba(0,0,0,0.2); }
    .admin-table td { padding:14px 20px; font-size:14px; border-bottom:1px solid var(--border-color); vertical-align:middle; }
    .admin-table tbody tr:hover { background:rgba(255,255,255,0.02); }
    .loading-cell { text-align:center; padding:40px; color:var(--text-muted); }
    .time-chip { display:inline-block; background:rgba(229,9,20,0.1); color:var(--primary); border:1px solid rgba(229,9,20,0.3); border-radius:6px; padding:3px 10px; font-family:monospace; font-weight:700; font-size:14px; }
    
    /* Timetable View */
    .timetable-nav { display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; background:var(--surface); padding:10px 20px; border-radius:12px; border:1px solid var(--border-color); }
    .current-week-label { font-weight:700; font-size:15px; color:#fff; }
    
    .timetable { width:100%; border-collapse:collapse; min-width:900px; table-layout:fixed; }
    .timetable th, .timetable td { border:1px solid var(--border-color); vertical-align:top; border-bottom:1px solid var(--border-color); }
    .timetable th { padding:12px; text-align:center; background:rgba(0,0,0,0.3); font-size:13px; font-weight:600; color:var(--text-muted); }
    .timetable th .date { font-size:11px; font-weight:400; display:block; margin-top:4px; }
    .timetable td { padding:8px; height:150px; background:rgba(255,255,255,0.01); transition:0.2s;}
    .timetable td:hover { background:rgba(255,255,255,0.03); }
    .timetable .time-col { background:rgba(0,0,0,0.4); text-align:center; vertical-align:middle; width:80px; font-weight:700; color:#fff; border-bottom:1px solid var(--border-color);}
    
    .st-block { background:var(--surface-hover); border-radius:6px; padding:8px; margin-bottom:8px; font-size:11px; box-shadow:0 2px 5px rgba(0,0,0,0.2); cursor:pointer; position:relative; overflow:hidden;}
    .st-block:hover { transform:translateY(-1px); box-shadow:0 4px 8px rgba(0,0,0,0.4); }
    .st-block .title { font-weight:700; color:#fff; margin-bottom:4px; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;}
    .st-block .info { color:var(--text-muted); line-height:1.4; display:flex; flex-direction:column; gap:2px;}
    .st-block .fill { margin-top:6px; border-top:1px dashed rgba(255,255,255,0.1); padding-top:4px; font-weight:600; text-align:right;}
    
    .bg-green { background: linear-gradient(135deg, rgba(46, 204, 113, 0.15) 0%, rgba(39, 174, 96, 0.25) 100%); border-left: 3px solid #2ecc71; }
    .bg-yellow { background: linear-gradient(135deg, rgba(241, 196, 15, 0.15) 0%, rgba(243, 156, 18, 0.25) 100%); border-left: 3px solid #f1c40f; }
    .bg-red { background: linear-gradient(135deg, rgba(231, 76, 60, 0.15) 0%, rgba(192, 57, 43, 0.25) 100%); border-left: 3px solid #e74c3c; }
    
    .tt-legend { display:flex; gap:24px; justify-content:center; margin-top:20px; font-size:12px; color:var(--text-muted); }
    .tt-legend .box { display:inline-block; width:14px; height:14px; border-radius:3px; vertical-align:middle; margin-right:6px; }

    /* Commons */
    .action-btn { background:none; border:none; color:var(--text-muted); cursor:pointer; padding:5px 8px; font-size:15px; border-radius:6px; transition:all 0.2s; }
    .action-btn:hover { background:rgba(231,76,60,0.1); color:#e74c3c; }
    .modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.8); z-index:1000; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(5px); }
    .modal-box { background:var(--bg-darker); border:1px solid var(--border-color); border-radius:16px; width:100%; box-shadow:0 20px 40px rgba(0,0,0,0.5); display:flex; flex-direction:column; max-height:90vh; }
    .modal-header { padding:20px 24px; border-bottom:1px solid var(--border-color); display:flex; justify-content:space-between; align-items:center; }
    .modal-header h3 { font-size:18px; color:#fff; }
    .close-btn { background:none; border:none; color:var(--text-muted); font-size:20px; cursor:pointer; }
    .modal-body { padding:24px; overflow-y:auto; }
    .modal-footer { padding:16px 24px; border-top:1px solid var(--border-color); display:flex; justify-content:flex-end; gap:12px; }
    .form-row { display:flex; gap:16px; }
    .form-group { margin-bottom:16px; flex:1; }
    .form-group label { display:block; font-size:12px; color:var(--text-muted); margin-bottom:8px; font-weight:600; text-transform:uppercase; }
    .btn-secondary { background:var(--surface); color:var(--text-main); border:1px solid var(--border-color); }
    .st-warning { background:rgba(241,196,15,0.1); border:1px solid rgba(241,196,15,0.3); color:#f1c40f; padding:12px 16px; border-radius:8px; font-size:14px; }
</style>

<script>
let _meta = null;  // cache
let _allRooms = [];
let currentView = 'list';
let ttCurrentDate = new Date(); // Timetable reference date (start of week)

// UTILS
function getStartOfWeek(d) {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is sunday
    date.setDate(diff);
    return date;
}
function formatDate(d) {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}

async function loadMeta() {
    console.log("🔍 loadMeta call...");
    if (_meta) {
        renderCombos(); // Vẫn render lại lỡ modal bị reset
        return _meta;
    }
    
    try {
        _meta = await API.get("/showtimes/admin/meta");
        console.log("✅ loadMeta response:", _meta);
        
        _allRooms = _meta.rooms || [];

        if (_meta.movies) {
            const movieSel = document.getElementById("st_movie");
            movieSel.innerHTML = _meta.movies.map(m => `<option value="${m.id}">${m.title}</option>`).join("");
        }

        if (_meta.cinemas) {
            const cinemaSel = document.getElementById("st_cinema");
            const cinemaFilter = document.getElementById("st-cinema-filter");
            const cinemaOpts = _meta.cinemas.map(c => `<option value="${c.id}">${c.name}</option>`).join("");
            if (cinemaSel) cinemaSel.innerHTML = cinemaOpts;
            if (cinemaFilter) cinemaFilter.innerHTML = `<option value="">Tất cả rạp</option>` + cinemaOpts;
        }

        filterRooms();

        if (_meta.formats) {
            document.getElementById("st_format").innerHTML = _meta.formats.map(f => `<option value="${f.id}">${f.name}</option>`).join("");
        }
        if (_meta.languages) {
            document.getElementById("st_language").innerHTML = _meta.languages.map(l => `<option value="${l.id}">${l.name}</option>`).join("");
        }

        renderCombos();

    } catch (err) {
        console.error("❌ loadMeta fatal error:", err);
    }
    return _meta;
}

function renderCombos() {
    const comboList = document.getElementById("st_combos_list");
    if (!comboList) return;
    
    if (!_meta || !_meta.combos || _meta.combos.length === 0) {
        comboList.innerHTML = `<p style="color:var(--text-muted); font-size:12px; grid-column:1/-1;">Không có combo nào hoặc lỗi tải.</p>`;
        return;
    }

    comboList.innerHTML = _meta.combos.map(c => `
        <div style="display:flex; align-items:center; gap:8px; background:rgba(255,255,255,0.03); padding:8px; border-radius:6px;">
            <input type="checkbox" class="st-combo-check" data-id="${c.id}" checked style="width:16px; height:16px; cursor:pointer;">
            <div style="flex:1">
                <div style="font-size:12px; font-weight:600; color:#fff;">${c.name}</div>
                <div style="display:flex; align-items:center; gap:4px; margin-top:4px;">
                    <span style="font-size:10px; color:var(--text-muted)">Giá:</span>
                    <input type="number" class="st-combo-price form-control" data-id="${c.id}" value="${c.price}" style="padding:2px 6px; font-size:11px; width:80px; height:24px;">
                </div>
            </div>
        </div>
    `).join("");
}

function filterRooms() {
    const cinemaId = parseInt(document.getElementById("st_cinema").value);
    const roomSel = document.getElementById("st_room");
    const filtered = _allRooms.filter(r => !cinemaId || r.cinema_id === cinemaId);
    roomSel.innerHTML = filtered.map(r => `<option value="${r.id}">${r.room_name}</option>`).join("");
}

// VIEW SWITCH
function switchView(view) {
    currentView = view;
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`.tab-btn[onclick="switchView('${view}')"]`).classList.add('active');
    
    document.getElementById('view-list').style.display = view === 'list' ? 'block' : 'none';
    document.getElementById('view-timetable').style.display = view === 'timetable' ? 'block' : 'none';
    
    reloadCurrentView();
}
function reloadCurrentView() {
    if(currentView === 'list') loadShowtimes();
    else loadTimetable();
}

// ─────────────────────────────────────────
// LIST VIEW
// ─────────────────────────────────────────
async function loadShowtimes() {
    const date = document.getElementById("st-date-filter").value;
    const cinema_id = document.getElementById("st-cinema-filter").value;
    const tbody = document.getElementById("st-tbody");
    tbody.innerHTML = `<tr><td colspan="8" class="loading-cell"><i class="fa-solid fa-spinner fa-spin"></i> Đang tải...</td></tr>`;

    try {
        const params = [];
        if (date) params.push(`date=${date}`);
        if (cinema_id) params.push(`cinema_id=${cinema_id}`);
        const rows = await API.get(`/showtimes/admin/all?${params.join("&")}`);

        document.getElementById("st-count").textContent = `${rows.length} suất chiếu`;

        if (!rows.length) {
            tbody.innerHTML = `<tr><td colspan="8" class="loading-cell">Không có suất chiếu trong ngày này.</td></tr>`;
            return;
        }

        tbody.innerHTML = rows.map(r => `
        <tr>
            <td><strong style="color:#fff">${r.movie_title}</strong></td>
            <td style="color:var(--text-muted)">${r.show_date}</td>
            <td><span class="time-chip">${r.show_time?.slice(0,5)}</span></td>
            <td style="color:var(--text-muted)">
                ${r.cinema_name}<br>
                <small style="font-size:11px; opacity:0.7">${r.cinema_address}</small>
            </td>
            <td style="color:var(--text-muted)">${r.room_name}</td>
            <td style="color:#3498db;font-size:13px">${r.format_name}</td>
            <td style="color:var(--text-muted);font-size:13px">${r.language_name}</td>
            <td>
                <div style="display:flex; gap:8px;">
                    <button class="action-btn" title="Sửa suất chiếu" onclick="openStModal(${r.id})" style="color:#3498db;">
                        <i class="fa-solid fa-pen-to-square"></i>
                    </button>
                    <button class="action-btn" title="Xoá suất chiếu" onclick="deleteShowtime(${r.id})">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </div>
            </td>
        </tr>`).join("");
    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="8" class="loading-cell" style="color:#e74c3c">Lỗi: ${err.message}</td></tr>`;
    }
}

// ─────────────────────────────────────────
// TIMETABLE VIEW
// ─────────────────────────────────────────
function changeWeek(offset) {
    ttCurrentDate.setDate(ttCurrentDate.getDate() + (offset * 7));
    loadTimetable();
}

async function loadTimetable() {
    const startOfWeek = getStartOfWeek(ttCurrentDate);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    document.getElementById("week-label").innerText = `Tuần từ ${startOfWeek.toLocaleDateString('vi-VN')} đến ${endOfWeek.toLocaleDateString('vi-VN')}`;
    
    // Build Headers
    const days = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];
    let headerHTML = `<th width="80" class="time-col">Ca chiếu</th>`;
    let bodyData = { sang: [], chieu: [], toi: [] };
    
    const weekDates = [];
    for(let i=0; i<7; i++) {
        let d = new Date(startOfWeek);
        d.setDate(d.getDate() + i);
        let dateStr = formatDate(d);
        weekDates.push(dateStr);
        let displayDate = `${d.getDate()}/${d.getMonth()+1}`;
        headerHTML += `<th>${days[i]}<span class="date">${displayDate}</span></th>`;
        // init empty HTML for cells
        bodyData.sang[dateStr] = '';
        bodyData.chieu[dateStr] = '';
        bodyData.toi[dateStr] = '';
    }
    document.getElementById("tt-header").innerHTML = headerHTML;

    // Fetch API
    const cinema_id = document.getElementById("st-cinema-filter").value;
    try {
        const rows = await API.get(`/showtimes/admin/timetable?start_date=${weekDates[0]}&end_date=${weekDates[6]}${cinema_id ? '&cinema_id='+cinema_id : ''}`);
        document.getElementById("st-count").textContent = `${rows.length} suất chiếu (Lịch tuần)`;
        
        // Map to body data
        rows.forEach(r => {
            const h = parseInt(r.show_time.split(':')[0]);
            let session = 'sang';
            if(h >= 12 && h < 18) session = 'chieu';
            if(h >= 18) session = 'toi';
            
            let bgClass = 'bg-green';
            let statusText = 'Trống';
            if(r.fill_rate > 30) { bgClass = 'bg-yellow'; statusText = 'Đang đông'; }
            if(r.fill_rate > 70) { bgClass = 'bg-red'; statusText = 'Sắp Full'; }
            
            const blockHTML = `
            <div class="st-block ${bgClass}" title="Tỉ lệ lấp đầy: ${r.fill_rate}%" onclick="deleteShowtime(${r.id}, true)">
                <div class="title">${r.movie_title}</div>
                <div class="info">
                    <span><i class="fa-regular fa-clock"></i> ${r.show_time.slice(0,5)}</span>
                    <span><i class="fa-solid fa-door-open"></i> ${r.room_name}</span>
                    <span><i class="fa-solid fa-location-dot"></i> ${r.cinema_address}</span>
                </div>
                <div class="fill" style="color: ${bgClass === 'bg-red' ? '#ff7675' : (bgClass === 'bg-yellow' ? '#ffeaa7' : '#55efc4')}">
                    ${r.booked_seats} / ${r.total_seats} <small>(${statusText})</small>
                </div>
            </div>`;
            
            if(bodyData[session][r.show_date] !== undefined) {
                bodyData[session][r.show_date] += blockHTML;
            }
        });

        // Render HTML
        document.getElementById("row-sang").innerHTML = `<td class="time-col">Sáng<br><small>&lt; 12:00</small></td>` + weekDates.map(d => `<td>${bodyData.sang[d]}</td>`).join("");
        document.getElementById("row-chieu").innerHTML = `<td class="time-col">Chiều<br><small>12:00-18:00</small></td>` + weekDates.map(d => `<td>${bodyData.chieu[d]}</td>`).join("");
        document.getElementById("row-toi").innerHTML = `<td class="time-col">Tối<br><small>&gt; 18:00</small></td>` + weekDates.map(d => `<td>${bodyData.toi[d]}</td>`).join("");

    } catch (err) {
        console.error(err);
        showToast("Lỗi tải lịch chiếu: " + err.message, "error");
    }
}

// ─────────────────────────────────────────
// CRUD ACTIONS 
// ─────────────────────────────────────────
let _editingId = null;

async function openStModal(id = null) {
    _editingId = id;
    const modal = document.getElementById("stModal");
    const title = modal.querySelector(".modal-header h3");
    const warn = document.getElementById("st-warning");
    
    modal.style.display = "flex";
    warn.style.display = "none";
    title.innerText = id ? "Cập Nhật Suất Chiếu" : "Tạo Suất Chiếu Mới";
    const saveBtn = modal.querySelector(".modal-footer .btn-primary");
    saveBtn.innerHTML = id ? `<i class="fa-solid fa-save"></i> Lưu Thay Đổi` : `<i class="fa-solid fa-calendar-check"></i> Tạo Suất Chiếu`;

    await loadMeta();

    if (id) {
        try {
            const data = await API.get(`/showtimes/admin/${id}`);
            document.getElementById("st_movie").value = data.movie_id;
            document.getElementById("st_date").value = data.show_date;
            document.getElementById("st_time").value = data.show_time;
            document.getElementById("st_cinema").value = data.cinema_id;
            filterRooms();
            document.getElementById("st_room").value = data.room_id;
            document.getElementById("st_format").value = data.format_id;
            document.getElementById("st_language").value = data.language_id;
            
            // Set giá ghế
            if (data.seat_prices) {
                document.getElementById("price_normal").value = data.seat_prices.normal || 45000;
                document.getElementById("price_vip").value = data.seat_prices.vip || 65000;
                document.getElementById("price_sweetbox").value = data.seat_prices.sweetbox || 120000;
            }

            // Set combos
            document.querySelectorAll(".st-combo-check").forEach(chk => {
                const comboId = parseInt(chk.dataset.id);
                const item = data.combo_items.find(c => c.combo_id === comboId);
                chk.checked = !!item;
                if (item) {
                   const priceInput = document.querySelector(`.st-combo-price[data-id="${comboId}"]`);
                   if (priceInput) priceInput.value = item.price;
                }
            });

        } catch (err) {
            warn.innerText = "❌ Lỗi lấy thông tin: " + err.message;
            warn.style.display = "block";
        }
    } else {
        // Reset form for New
        document.getElementById("st_time").value = "09:00";
        // Giữ nguyên rạp/phòng nếu muốn, hoặc reset tùy ý.
    }
}

function closeStModal() { document.getElementById("stModal").style.display = "none"; }

async function saveShowtime() {
    const warn = document.getElementById("st-warning");
    warn.style.display = "none";
    
    // Thu thập giá ghế
    const seat_prices = {
        normal: parseInt(document.getElementById("price_normal").value) || 0,
        vip: parseInt(document.getElementById("price_vip").value) || 0,
        sweetbox: parseInt(document.getElementById("price_sweetbox").value) || 0
    };

    // Thu thập combo
    const combo_items = [];
    document.querySelectorAll(".st-combo-check:checked").forEach(chk => {
        const combo_id = chk.dataset.id;
        const priceInput = document.querySelector(`.st-combo-price[data-id="${combo_id}"]`);
        combo_items.push({
            combo_id: parseInt(combo_id),
            price: parseInt(priceInput.value) || 0
        });
    });

    try {
        const payload = {
            movie_id: document.getElementById("st_movie").value,
            cinema_id: document.getElementById("st_cinema").value,
            room_id: document.getElementById("st_room").value,
            show_date: document.getElementById("st_date").value,
            show_time: document.getElementById("st_time").value,
            format_id: document.getElementById("st_format").value,
            language_id: document.getElementById("st_language").value,
            seat_prices,
            combo_items
        };

        // FRONTEND VALIDATION: Check 3-hour gap
        try {
            const currentSTs = await API.get(`/showtimes/admin/all?date=${payload.show_date}&cinema_id=${payload.cinema_id}`);
            const timeToSec = (t) => {
                const [h, m] = t.split(':').map(Number);
                return h * 3600 + m * 60;
            };
            const targetSec = timeToSec(payload.show_time);
            
            const conflict = currentSTs.find(st => {
                // Trùng phòng và không phải chính suất đang sửa (nếu có)
                if (st.room_id != payload.room_id) return false;
                if (_editingId && st.id == _editingId) return false;
                
                const stSec = timeToSec(st.show_time);
                return Math.abs(stSec - targetSec) < 10800; // 3 hours
            });

            if (conflict) {
                warn.textContent = `⚠️ Khoảng cách với suất chiếu "${conflict.movie_title}" (${conflict.show_time.slice(0,5)}) tại phòng này không đủ 3 tiếng. Vui lòng chọn giờ khác.`;
                warn.style.display = "block";
                return;
            }
        } catch(e) { console.warn("Skip pre-check:", e); }

        if (_editingId) {
            await API.put(`/showtimes/admin/${_editingId}`, payload);
            showToast("Cập nhật suất chiếu thành công!");
        } else {
            await API.post("/showtimes/admin", payload);
            showToast("Tạo suất chiếu thành công!");
        }
        
        closeStModal();
        reloadCurrentView();
    } catch (err) {
        warn.textContent = "⚠️ " + err.message;
        warn.style.display = "block";
    }
}

async function deleteShowtime(id, fromTimetable = false) {
    let msg = fromTimetable ? `Suất chiếu #${id} - Bạn muốn xoá suất chiếu này?` : "Bạn có chắc muốn xoá suất chiếu này? Nếu đã có khách đặt vé, thao tác này sẽ thất bại.";
    showConfirm(msg, async () => {
        try {
            await API.delete(`/showtimes/admin/${id}`);
            showToast("Đã xoá suất chiếu");
            reloadCurrentView();
        } catch (err) {
            showToast("Lỗi: " + err.message, "error");
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    loadMeta(); // preload meta
    loadShowtimes(); // default view
});
</script>
