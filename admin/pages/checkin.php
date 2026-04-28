<div class="checkin-container">
    <div class="checkin-header-tools">
        <div class="report-title-group">
            <h2 class="page-sec-title">Soát vé bằng mã QR</h2>
            <p class="text-muted">Sử dụng camera để quét mã QR JSON từ thiết bị của khách hàng</p>
        </div>
    </div>

    <div class="checkin-main-grid">
        <!-- SCANNER BOX -->
        <div class="scanner-card">
            <div class="scanner-viewport-wrapper">
                <div id="reader"></div>
                <!-- Overlay while scanning -->
                <div class="scanner-overlay" id="scanner-overlay">
                    <div class="scan-frame"></div>
                </div>
            </div>
            
            <div class="scanner-actions">
                <div class="camera-status" id="camera-status">
                    <span class="status-dot"></span>
                    <span id="status-msg">Camera chưa sẵn sàng</span>
                </div>
                <div class="btn-group-center" style="flex-wrap: wrap;">
                    <button class="btn btn-primary" id="start-btn" onclick="startScanner()">
                        <i class="fa-solid fa-camera"></i> Mở Camera
                    </button>
                    <button class="btn btn-logout" id="stop-btn" onclick="stopScanner()" style="display:none">
                        <i class="fa-solid fa-video-slash"></i> Tạm dừng
                    </button>
                    <!-- Fallback: Upload Image -->
                    <button class="btn btn-secondary" onclick="document.getElementById('qr-input-file').click()">
                        <i class="fa-solid fa-file-image"></i> Tải ảnh QR
                    </button>
                    <input type="file" id="qr-input-file" accept="image/*" style="display:none" onchange="handleFileSelect(event)">
                </div>
            </div>
        </div>

        <!-- RESULT CARD -->
        <div class="result-card" id="result-card">
            <div class="empty-state" id="empty-state-msg">
                <i class="fa-solid fa-qrcode"></i>
                <p>Vui lòng quét mã để hiển thị thông tin</p>
            </div>

            <div class="result-content" id="result-content" style="display:none">
                <div id="status-badge" class="status-badge success">
                    <i id="status-icon" class="fa-solid fa-circle-check"></i>
                    <span id="status-text">Hợp lệ - Mời vào</span>
                </div>

                <div class="ticket-details-box">
                    <div class="movie-header">
                        <h3 id="res-movie-title">---</h3>
                        <p id="res-show-date">---</p>
                    </div>

                    <div class="info-grid">
                        <div class="info-item">
                            <i class="fa-regular fa-clock"></i>
                            <div>
                                <label>Giờ chiếu</label>
                                <span id="res-show-time">---</span>
                            </div>
                        </div>
                        <div class="info-item">
                            <i class="fa-solid fa-couch"></i>
                            <div>
                                <label>Phòng / Ghế</label>
                                <span id="res-room-seat">---</span>
                            </div>
                        </div>
                        <div class="info-item">
                            <i class="fa-regular fa-user"></i>
                            <div>
                                <label>Khách hàng</label>
                                <span id="res-fullname">---</span>
                            </div>
                        </div>
                        <div class="info-item">
                            <i class="fa-solid fa-barcode"></i>
                            <div>
                                <label>Mã vé</label>
                                <span id="res-ticket-id">---</span>
                            </div>
                        </div>
                        <div class="info-item" style="grid-column: span 2; border-top: 1px dashed rgba(255,255,255,0.05); padding-top: 10px;">
                            <i class="fa-solid fa-location-dot"></i>
                            <div>
                                <label>Rạp chiếu</label>
                                <span id="res-cinema-name">---</span>
                            </div>
                        </div>
                    </div>

                    <!-- Combo List -->
                    <div id="res-combos" style="margin-top: 15px;"></div>
                </div>

                <div class="btn-group-vertical" style="display: flex; flex-direction: column; gap: 10px;">
                    <button class="btn btn-primary" id="btn-print" style="height: 50px; font-size: 16px; gap: 10px;">
                        <i class="fa-solid fa-print"></i> IN VÉ VẬT LÝ
                    </button>
                    <button class="btn btn-secondary" onclick="resumeScanning()">
                        <i class="fa-solid fa-rotate-right"></i> Tiếp tục quét
                    </button>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Sound effects -->
<audio id="sound-success" src="https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3" preload="auto"></audio>
<audio id="sound-error" src="https://assets.mixkit.co/active_storage/sfx/2658/2658-preview.mp3" preload="auto"></audio>

<script src="https://unpkg.com/html5-qrcode"></script>

<style>
    .checkin-container { animation: fadeIn 0.4s ease-out; }
    .checkin-main-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-top: 24px; }
    @media (max-width: 900px) { .checkin-main-grid { grid-template-columns: 1fr; } }

    .scanner-card { background: var(--surface); border: 1px solid var(--border-color); border-radius: 16px; overflow: hidden; }
    .scanner-viewport-wrapper { position: relative; background: #000; aspect-ratio: 4/3; }
    #reader { width: 100% !important; border: none !important; }
    #reader video { width: 100% !important; object-fit: cover !important; }
    
    .scanner-actions { padding: 20px; border-top: 1px solid var(--border-color); }
    .camera-status { display: flex; align-items: center; gap: 8px; margin-bottom: 16px; justify-content: center; }
    .status-dot { width: 8px; height: 8px; background: #94a3b8; border-radius: 50%; }
    .status-dot.active { background: #2ecc71; box-shadow: 0 0 10px #2ecc71; }
    #status-msg { font-size: 13px; color: var(--text-muted); }
    .btn-group-center { display: flex; justify-content: center; gap: 12px; }

    .result-card { background: var(--surface); border: 1px solid var(--border-color); border-radius: 16px; padding: 32px; min-height: 400px; display: flex; flex-direction: column; justify-content: center; position: relative; }
    .empty-state { text-align: center; color: var(--text-muted); }
    .empty-state i { font-size: 64px; margin-bottom: 20px; opacity: 0.2; }

    .status-badge { display: flex; align-items: center; justify-content: center; gap: 12px; padding: 16px; border-radius: 12px; margin-bottom: 24px; font-weight: 700; font-size: 18px; }
    .status-badge.success { background: rgba(46, 204, 113, 0.1); color: #2ecc71; }
    .status-badge.error { background: rgba(229, 9, 20, 0.1); color: #e50914; }

    .ticket-details-box { background: var(--bg-darker); padding: 24px; border-radius: 12px; margin-bottom: 24px; border: 1px solid var(--border-color); }
    .movie-header { margin-bottom: 20px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 16px; }
    .movie-header h3 { font-size: 20px; color: #fff; margin-bottom: 4px; }
    .movie-header p { font-size: 14px; color: var(--text-muted); }

    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .info-item { display: flex; align-items: flex-start; gap: 12px; }
    .info-item i { font-size: 16px; color: var(--primary); margin-top: 4px; }
    .info-item label { display: block; font-size: 11px; color: var(--text-muted); text-transform: uppercase; margin-bottom: 4px; }
    .info-item span { font-size: 14px; color: #fff; font-weight: 600; }
    
    .btn-full-width { width: 100%; padding: 14px; border-radius: 10px; }

    .scan-frame { position: absolute; top: 15%; left: 15%; width: 70%; height: 70%; border: 2px solid rgba(229, 9, 20, 0.5); border-radius: 20px; box-shadow: 0 0 0 400px rgba(0,0,0,0.4); pointer-events: none; }
    .scan-frame::after { content: ""; position: absolute; top: 0; left: 0; width: 100%; height: 2px; background: rgba(229,9,20,0.8); animation: scanLoop 2s infinite linear; }
    @keyframes scanLoop { from { top: 0; } to { top: 100%; } }
</style>

<script>
let scanner = null;
let isProcessing = false;

function startScanner() {
    scanner = new Html5Qrcode("reader");
    // Thử dùng facingMode environment (camera sau), nếu lỗi thì dùng camera bất kỳ
    const config = { fps: 10, qrbox: { width: 250, height: 250 } };
    
    scanner.start(
        { facingMode: "environment" }, 
        config, 
        onScanSuccess
    ).catch(() => {
        // Fallback cho PC/Laptop không có camera sau
        return scanner.start({ facingMode: "user" }, config, onScanSuccess);
    }).then(() => {
        document.getElementById('start-btn').style.display = 'none';
        document.getElementById('stop-btn').style.display = 'block';
        document.querySelector('.status-dot').classList.add('active');
        document.getElementById('status-msg').innerText = "Đang quét...";
    }).catch(err => {
        console.error(err);
        let msg = "Không thể mở camera.\n\n";
        if (err.toString().includes("NotAllowedError")) {
            msg += "HƯỚNG DẪN FIX:\n1. Bấm vào biểu tượng Ổ KHÓA trên thanh địa chỉ.\n2. Chọn 'Cho phép' (Allow) cho Camera.\n3. Tải lại trang (F5).";
        } else {
            msg += "Lỗi: " + err;
        }
        alert(msg + "\n\nHoặc bạn có thể dùng nút 'Tải ảnh QR' để quét từ file ảnh.");
    });
}

function handleFileSelect(event) {
    const file = event.target.result || event.target.files[0];
    if (!file) return;

    if (!scanner) scanner = new Html5Qrcode("reader");
    
    document.getElementById('status-msg').innerText = "Đang đọc ảnh...";
    
    scanner.scanFile(file, true)
        .then(decodedText => {
            onScanSuccess(decodedText);
        })
        .catch(err => {
            alert("Không tìm thấy mã QR trong ảnh này. Vui lòng thử ảnh khác.");
            console.error(err);
        });
}

function stopScanner() {
    if (scanner) {
        scanner.stop().then(() => {
            document.getElementById('start-btn').style.display = 'block';
            document.getElementById('stop-btn').style.display = 'none';
            document.querySelector('.status-dot').classList.remove('active');
            document.getElementById('status-msg').innerText = "Đã dừng quét";
        });
    }
}

async function onScanSuccess(decodedText) {
    if (isProcessing) return;
    isProcessing = true;
    
    try {
        const qrData = JSON.parse(decodedText);
        if (!qrData.ticket_id || !qrData.hash) throw new Error("QR không đúng định dạng JSON yêu cầu");
        
        const res = await API.post("/booking/admin/checkin", qrData);
        showResult(res);
    } catch (err) {
        showResult({ success: false, message: err.message || "Mã QR không hợp lệ" });
    }
}

function showResult(res) {
    const soundSuccess = document.getElementById('sound-success');
    const soundError = document.getElementById('sound-error');
    
    document.getElementById('empty-state-msg').style.display = 'none';
    document.getElementById('result-content').style.display = 'block';
    
    const badge = document.getElementById('status-badge');
    const icon = document.getElementById('status-icon');
    const text = document.getElementById('status-text');
    
    if (res.success) {
        soundSuccess.play();
        badge.className = "status-badge success";
        icon.className = "fa-solid fa-circle-check";
        text.innerText = res.message;
        
        const t = res.ticket;
        document.getElementById('res-movie-title').innerText = t.movie_title;
        document.getElementById('res-show-date').innerText = t.show_date;
        document.getElementById('res-show-time').innerText = t.show_time;
        document.getElementById('res-room-seat').innerText = `${t.room_name} / Ghế ${t.seat_code}`;
        document.getElementById('res-fullname').innerText = t.fullname;
        document.getElementById('res-ticket-id').innerText = "#" + t.id;
        document.getElementById('res-cinema-name').innerText = t.cinema_name || "D'PRIME CINEMA";

        // Render Combos
        const comboDiv = document.getElementById('res-combos');
        comboDiv.innerHTML = '';
        if (t.combos && t.combos.length > 0) {
            comboDiv.innerHTML = `
                <div style="font-size: 11px; color: var(--primary); font-weight: 700; text-transform: uppercase; margin-bottom: 8px;">Bắp nước kèm theo</div>
                ${t.combos.map(c => `
                    <div style="display: flex; justify-content: space-between; font-size: 13px; color: #fff; margin-bottom: 4px;">
                        <span>${c.combo_name}</span>
                        <span style="font-weight: 700;">x${c.qty}</span>
                    </div>
                `).join('')}
            `;
        }

        // Setup Print Button
        const printBtn = document.getElementById('btn-print');
        printBtn.style.display = 'flex';
        printBtn.onclick = () => printTicket(t);

    } else {
        soundError.play();
        badge.className = "status-badge error";
        icon.className = "fa-solid fa-circle-xmark";
        text.innerText = res.message;
        
        document.querySelector('.ticket-details-box').style.opacity = "0.3";
        document.getElementById('btn-print').style.display = 'none';
    }
    
    // Pause scanner if success or critical error
    if (scanner) scanner.pause();
}

function printTicket(res) {
    const printWin = window.open('', '_blank', 'width=400,height=600');
    
    const combosText = (res.combos && res.combos.length > 0) 
        ? res.combos.map(c => `<div style="display:flex; justify-content:space-between;"><span>${c.combo_name}</span> <span>x${c.qty}</span></div>`).join('')
        : '<em>Không có</em>';

    const html = `
        <html>
        <head>
            <title>In vé - D'PRIME</title>
            <style>
                @page { margin: 0; }
                body { font-family: 'Courier New', Courier, monospace; width: 80mm; padding: 5mm; margin: 0; color: #000; background: #fff; }
                .center { text-align: center; }
                .line { border-top: 1px dashed #000; margin: 8px 0; }
                .title { font-size: 20px; font-weight: bold; margin: 10px 0; }
                .movie { font-size: 16px; font-weight: bold; margin: 8px 0; text-transform: uppercase; line-height: 1.2; }
                .info { font-size: 13px; margin: 4px 0; text-align: left; }
                .seat { font-size: 28px; font-weight: bold; margin: 15px 0; border: 2px solid #000; display: inline-block; padding: 8px 20px; }
                .footer { font-size: 10px; margin-top: 20px; line-height: 1.4; }
                .barcode { font-size: 12px; margin: 10px 0; letter-spacing: 2px; }
            </style>
        </head>
        <body onload="window.print(); window.close();">
            <div class="center">
                <div class="title">D'PRIME CINEMA</div>
                <div style="font-size: 12px;">${res.cinema_name}</div>
                <div class="line"></div>
                <div class="movie">${res.movie_title}</div>
                <div class="line"></div>
                <div class="info">Ngày chiếu: <b>${res.show_date}</b></div>
                <div class="info">Giờ chiếu: <b>${res.show_time}</b></div>
                <div class="info">Phòng chiếu: ${res.room_name}</div>
                <div class="seat">${res.seat_code}</div>
                <div class="line"></div>
                <div style="text-align: left; font-size: 12px;">
                    <b style="text-transform: uppercase;">Dịch vụ đi kèm:</b><br>
                    ${combosText}
                </div>
                <div class="line"></div>
                <div class="barcode">CODE: ${res.booking_code}</div>
                <div class="info">ID Vé: #${res.id}</div>
                <div class="info">Khách hàng: ${res.fullname}</div>
                <div class="line"></div>
                <div class="footer">
                    VUI LÒNG GIỮ VÉ ĐỂ VÀO PHÒNG CHIẾU<br>
                    VÀ NHẬN BẮP NƯỚC TẠI QUẦY<br>
                    ------------------------------<br>
                    Cảm ơn quý khách!
                </div>
            </div>
        </body>
        </html>
    `;
    
    printWin.document.write(html);
    printWin.document.close();
}

function resumeScanning() {
    isProcessing = false;
    document.getElementById('result-content').style.display = 'none';
    document.getElementById('empty-state-msg').style.display = 'block';
    document.querySelector('.ticket-details-box').style.opacity = "1";
    
    if (scanner) scanner.resume();
}
</script>
