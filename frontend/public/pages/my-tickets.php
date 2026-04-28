<?php
// my-tickets.php  –  Trang vé của tôi (CGV-style redesign)
?>
<link rel="stylesheet" href="./assets/css/my-tickets.css">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Barlow+Condensed:wght@400;600;700;800;900&family=Barlow:wght@400;500;600&display=swap" rel="stylesheet">

<script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>

<div class="tickets-page">

    <!-- HERO -->
    <div class="tickets-hero">
        <div class="tickets-hero-inner">
            <div>
                <h1 class="tickets-hero-title">Vé của tôi</h1>
                <p class="tickets-hero-sub">Lịch sử đặt vé và vé đang có hiệu lực</p>
            </div>
        </div>
        <div class="tickets-tabs">
            <button class="tab-btn active" data-filter="all">Tất cả</button>
            <button class="tab-btn" data-filter="paid">Đã thanh toán</button>
            <button class="tab-btn" data-filter="pending">Chờ thanh toán</button>
            <button class="tab-btn" data-filter="cancelled">Đã hủy</button>
        </div>
    </div>

    <div class="tickets-content">
        <div class="tickets-loading" id="tickets-loading">
            <div class="loading-spinner"></div>
            <p>Đang tải vé...</p>
        </div>
        <div class="tickets-empty" id="tickets-empty" style="display:none">
            <h3>chưa có vé nào</h3>
            <p>Bạn chưa đặt vé nào. Hãy chọn ngày phim bạn yêu thích</p>
            <a href="index.php" class="btn-browse">Xem phim ngay</a>
        </div>
        <div class="tickets-list" id="tickets-list" style="display:none"></div>
    </div>
</div>

<!-- MODAL OVERLAY -->
<div class="ticket-modal-overlay" id="ticket-modal" style="display:none" onclick="closeTicketModal(event)">
    <div class="ticket-modal-wrap" onclick="event.stopPropagation()">

        <button class="ticket-modal-close" onclick="closeTicketModal()">X</button>

        <!-- CAPTURE ZONE: thermal-print CGV ticket -->
        <div class="cgv-ticket" id="ticket-card-capture">

            <!-- HEADER BAND -->
            <div class="cgv-header">
                <div class="cgv-brand-row">
                    <span class="cgv-brand-main">DPrime</span>
                    <span class="cgv-brand-sub">CINEMA</span>
                </div>
                <div class="cgv-header-right">
                    <div class="cgv-status-badge" id="modal-status">---</div>
                    <div class="cgv-header-label">THE VAO PHONG CHIEU PHIM</div>
                </div>
            </div>

            <!-- WATERMARK PATTERN -->
            <div class="cgv-watermark-band" aria-hidden="true">
                <div class="cgv-wm-row">
                    <span>DPRIME</span><span>TICKET</span><span>DPRIME</span><span>TICKET</span>
                    <span>DPRIME</span><span>TICKET</span><span>DPRIME</span><span>TICKET</span>
                </div>
                <div class="cgv-wm-row">
                    <span>TICKET</span><span>DPRIME</span><span>TICKET</span><span>DPRIME</span>
                    <span>TICKET</span><span>DPRIME</span><span>TICKET</span><span>DPRIME</span>
                </div>
                <div class="cgv-wm-row">
                    <span>DPRIME</span><span>TICKET</span><span>DPRIME</span><span>TICKET</span>
                    <span>DPRIME</span><span>TICKET</span><span>DPRIME</span><span>TICKET</span>
                </div>
            </div>

            <!-- VENUE -->
            <div class="cgv-body">
                <div class="cgv-venue" id="modal-cinema">D Prime Cinema Nguyen Van Bao</div>
                <div class="cgv-venue-addr">Ho Chi Minh City</div>

                <div class="cgv-separator">=================================</div>

                <!-- MOVIE -->
                <div class="cgv-movie-block">
                    <div class="cgv-movie-title" id="modal-movie">---</div>
                    <div class="cgv-movie-meta">
                        <span id="modal-showtime">---</span>
                    </div>
                </div>

                <div class="cgv-separator">=================================</div>

                <!-- SEAT / CLASS -->
                <div class="cgv-row-data">
                    <span class="cgv-field">Ghe / Phong</span>
                    <span class="cgv-value" id="modal-seats">---</span>
                </div>
                <div class="cgv-row-data">
                    <span class="cgv-field">Ngay dat</span>
                    <span class="cgv-value" id="modal-date">---</span>
                </div>

                <div class="cgv-separator">---------------------------------</div>

                <!-- PRICING -->
                <div class="cgv-row-data">
                    <span class="cgv-field">Thanh toan</span>
                    <span class="cgv-value" id="modal-method">---</span>
                </div>
                <div class="cgv-row-data">
                    <span class="cgv-field">Gia ve (ghe)</span>
                    <span class="cgv-value" id="modal-seat-price">---</span>
                </div>

                <!-- COMBO -->
                <div id="modal-combo-wrap" style="display:none">
                    <div class="cgv-separator">---------------------------------</div>
                    <div class="cgv-combo-title">COMBO DA CHON</div>
                    <div id="modal-combo-list" class="cgv-combo-list"></div>
                </div>

                <div class="cgv-separator">---------------------------------</div>

                <div class="cgv-row-data cgv-total-row">
                    <span class="cgv-field">TONG TIEN</span>
                    <span class="cgv-value cgv-total" id="modal-total">---</span>
                </div>

                <div class="cgv-separator">=================================</div>

                <!-- SMART QR CODE (PRIORITY 1) -->
                <div class="cgv-code-section" style="padding: 5px 0;">
                    <div class="cgv-qr-label" style="font-size: 10px; margin-bottom: 5px;">SMART TICKET QR (DYNAMIC)</div>
                    <div class="smart-qr-wrap" style="padding: 5px; margin: 0 auto; width: 140px; background: #fff; border: 1px solid #d0a0a3;">
                        <img id="ticket-smart-qr" src="" alt="QR" style="width:130px; height:130px; display:block;">
                        <div class="qr-refresh-timer" style="margin-top: 5px; height: 2px;"><div class="timer-bar" id="qr-timer-bar"></div></div>
                    </div>
                    <div class="cgv-code-hint" style="font-size: 8px; margin-top: 3px;">Mã tự động làm mới để bảo mật</div>
                </div>

                <div class="cgv-separator">=================================</div>

                <!-- FOOTER TEXT -->
                <div class="cgv-footer-text">
                    Cam on quy khach. Chuc quy khach xem phim vui ve!
                </div>
                <div class="cgv-footer-text cgv-footer-small">
                    dprime.cinema &nbsp;|&nbsp; hotline: 0398278164
                </div>

            </div><!-- /cgv-body -->

        </div><!-- /cgv-ticket -->

        <!-- ACTION BAR — outside capture zone -->
        <div class="ticket-download-bar">
            <button class="btn-download-ticket" id="btn-download-ticket" onclick="downloadTicketPNG()">
                <span id="btn-dl-text">Tai ve (PNG)</span>
                <span id="btn-dl-loading" style="display:none">Dang xuat...</span>
            </button>
            <button class="btn-cancel-ticket" id="btn-cancel-ticket" style="display:none" onclick="cancelTicket()">
                Huy ve
            </button>
        </div>

    </div><!-- /ticket-modal-wrap -->
</div>

<script src="./assets/js/my-tickets.js"></script>

<style>
/* ============================================================
   CGV-STYLE TICKET  –  thermal paper aesthetic
   ============================================================ */

/* Google Fonts already loaded above */

/* ---- Modal overlay ---- */
.ticket-modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.72);
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    backdrop-filter: blur(3px);
}

.ticket-modal-wrap {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    max-height: 95vh; /* Tăng chiều cao tối đa */
    overflow-y: auto;
    overflow-x: hidden;
    padding-bottom: 20px;
}

.ticket-modal-close {
    position: absolute;
    top: -4px;
    right: 4px;
    background: none;
    border: none;
    color: #fff;
    font-family: 'Share Tech Mono', monospace;
    font-size: 18px;
    font-weight: 700;
    cursor: pointer;
    z-index: 10;
    padding: 4px 8px;
    letter-spacing: 0;
}
.ticket-modal-close:hover { color: #e8b4b8; }

/* ---- CGV Ticket shell ---- */
.cgv-ticket {
    width: 380px; /* Tăng chiều rộng để vé cân đối hơn */
    background: #f5c8cc; 
    font-family: 'Share Tech Mono', 'Courier New', monospace;
    color: #111;
    box-shadow: 0 8px 40px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.3);
    position: relative;
    overflow: hidden;
    /* Tear notches at sides */
    -webkit-mask:
        radial-gradient(circle 10px at 0 50%, transparent 98%, #000 100%) left,
        radial-gradient(circle 10px at 100% 50%, transparent 98%, #000 100%) right,
        linear-gradient(#000,#000) center;
    -webkit-mask-size: 10px 100%, 10px 100%, calc(100% - 20px) 100%;
    -webkit-mask-repeat: no-repeat;
    mask:
        radial-gradient(circle 10px at 0 50%, transparent 98%, #000 100%) left,
        radial-gradient(circle 10px at 100% 50%, transparent 98%, #000 100%) right,
        linear-gradient(#000,#000) center;
    mask-size: 10px 100%, 10px 100%, calc(100% - 20px) 100%;
    mask-repeat: no-repeat;
}

/* ---- Header band ---- */
.cgv-header {
    background: #c0373d;   /* deep CGV red */
    color: #fff;
    padding: 14px 18px 12px;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
}

.cgv-brand-row {
    display: flex;
    flex-direction: column;
    line-height: 1;
}
.cgv-brand-main {
    font-family: 'Barlow Condensed', sans-serif;
    font-weight: 900;
    font-size: 30px;
    letter-spacing: 1px;
    color: #fff;
}
.cgv-brand-sub {
    font-family: 'Barlow Condensed', sans-serif;
    font-weight: 600;
    font-size: 13px;
    letter-spacing: 4px;
    color: rgba(255,255,255,0.7);
    margin-top: 2px;
}

.cgv-header-right {
    text-align: right;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 6px;
}

.cgv-status-badge {
    background: #fff;
    color: #c0373d;
    font-family: 'Barlow Condensed', sans-serif;
    font-weight: 800;
    font-size: 11px;
    letter-spacing: 1.5px;
    padding: 3px 10px;
    border-radius: 2px;
    text-transform: uppercase;
}

.cgv-header-label {
    font-family: 'Barlow Condensed', sans-serif;
    font-weight: 700;
    font-size: 10px;
    letter-spacing: 2px;
    color: rgba(255,255,255,0.65);
    text-transform: uppercase;
    max-width: 130px;
    text-align: right;
    line-height: 1.3;
}

/* ---- Watermark band ---- */
.cgv-watermark-band {
    background: #e8a0a6;
    padding: 6px 0;
    overflow: hidden;
    user-select: none;
}
.cgv-wm-row {
    display: flex;
    gap: 12px;
    padding: 2px 8px;
    overflow: hidden;
    white-space: nowrap;
}
.cgv-wm-row span {
    font-family: 'Barlow Condensed', sans-serif;
    font-weight: 700;
    font-size: 9px;
    letter-spacing: 2px;
    color: rgba(192,55,61,0.35);
    text-transform: uppercase;
    flex-shrink: 0;
}

/* ---- Body ---- */
.cgv-body {
    padding: 8px 15px 10px;
    display: flex;
    flex-direction: column;
    gap: 3px;
}

.cgv-venue {
    font-family: 'Barlow Condensed', sans-serif;
    font-weight: 700;
    font-size: 13px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: #1a1a1a;
}
.cgv-venue-addr {
    font-size: 10px;
    color: #555;
    margin-top: -2px;
}

.cgv-separator {
    font-size: 9px;
    letter-spacing: 0;
    color: #b08085;
    line-height: 1;
    margin: 2px 0;
    overflow: hidden;
    white-space: nowrap;
}

/* Movie block */
.cgv-movie-block { margin: 4px 0; }
.cgv-movie-title {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 18px; /* Thu nhỏ tiêu đề phim */
    text-transform: uppercase;
    letter-spacing: 0.5px;
    line-height: 1;
    color: #1a1a1a;
}
.cgv-movie-meta {
    font-size: 11px;
    color: #444;
    margin-top: 4px;
}

/* Row data */
.cgv-row-data {
    display: flex;
    justify-content: space-between;
    font-size: 11px;
    line-height: 1.5;
}
.cgv-field {
    color: #666;
    text-transform: uppercase;
    font-size: 10px;
    letter-spacing: 0.5px;
}
.cgv-value {
    font-weight: 700;
    text-align: right;
    max-width: 180px;
    color: #111;
    font-size: 10px; /* Thu nhỏ text thông tin */
}

/* Total row */
.cgv-total-row { margin: 2px 0; }
.cgv-total-row .cgv-field {
    font-family: 'Barlow Condensed', sans-serif;
    font-weight: 800;
    font-size: 12px;
    color: #1a1a1a;
    letter-spacing: 1px;
}
.cgv-total {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 20px;
    font-weight: 900;
    color: #c0373d;
}

/* Combo */
.cgv-combo-title {
    font-size: 9px;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: #888;
    margin: 2px 0;
}
.cgv-combo-list { display: flex; flex-direction: column; gap: 2px; }
.cgv-combo-list .cgv-row-data { font-size: 11px; }

/* Booking code */
.cgv-code-section {
    text-align: center;
    padding: 10px 0 6px;
}
.cgv-code-label {
    font-size: 9px;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: #888;
    margin-bottom: 6px;
}
.cgv-code {
    font-family: 'Share Tech Mono', monospace;
    font-size: 20px;
    font-weight: 700;
    letter-spacing: 3px;
    color: #c0373d;
    word-break: break-all;
}
.cgv-code-hint {
    font-size: 9px;
    color: #888;
    margin-top: 5px;
    letter-spacing: 0.3px;
}

/* QR code */
.cgv-qr-section {
    text-align: center;
    padding: 8px 0 4px;
}
.cgv-qr-label {
    font-size: 9px;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: #888;
    margin-bottom: 10px;
}
.cgv-qr-wrap {
    display: flex;
    justify-content: center;
    margin-bottom: 6px;
}
.cgv-qr-img {
    width: 160px;
    height: 160px;
    background: #fff;
    padding: 6px;
    border: 1px solid #d0a0a3;
}
.cgv-qr-hint {
    font-size: 9px;
    color: #999;
    letter-spacing: 0.3px;
}

/* Footer */
.cgv-footer-text {
    text-align: center;
    font-size: 10px;
    color: #888;
    margin-top: 4px;
    letter-spacing: 0.3px;
}
.cgv-footer-small { font-size: 9px; color: #aaa; }

/* Barcode style */
.cgv-barcode-wrap {
    display: flex;
    justify-content: center;
    background: #fff;
    padding: 8px 4px;
    margin: 6px 0 10px;
    border: 1px solid #d0a0a3;
    border-radius: 2px;
}
#ticket-barcode {
    max-width: 100%;
    height: auto;
}

/* ---- Action bar ---- */
.ticket-download-bar {
    width: 340px;
    padding: 12px 0 0;
    display: flex;
    gap: 8px;
}
.btn-download-ticket {
    flex: 1;
    background: #c0373d;
    color: #fff;
    font-family: 'Barlow Condensed', sans-serif;
    font-weight: 800;
    font-size: 15px;
    letter-spacing: 2px;
    text-transform: uppercase;
    border: none;
    padding: 13px 0;
    cursor: pointer;
    transition: background 0.18s;
}
.btn-download-ticket:hover  { background: #a82d32; }
.btn-download-ticket:active { background: #8f1f24; }
.btn-download-ticket:disabled { opacity: 0.5; cursor: not-allowed; }

.btn-cancel-ticket {
    background: transparent;
    color: #c0373d;
    font-family: 'Barlow Condensed', sans-serif;
    font-weight: 800;
    font-size: 13px;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    border: 2px solid #c0373d;
    padding: 13px 16px;
    cursor: pointer;
    transition: background 0.18s, color 0.18s;
    white-space: nowrap;
}
.btn-cancel-ticket:hover  { background: #c0373d; color: #fff; }
.btn-cancel-ticket:active { background: #a82d32; color: #fff; border-color: #a82d32; }

/* Scrollbar inside modal */
.ticket-modal-wrap::-webkit-scrollbar { width: 4px; }
.ticket-modal-wrap::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 2px; }
/* Smart QR styling */
.smart-qr-wrap {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    background: #fff;
    padding: 6px;
    border: 1px solid #d0a0a3;
    border-radius: 6px;
    margin: 4px 0;
}
.smart-qr-wrap img {
    width: 120px; /* Thu nhỏ QR thêm chút nữa */
    height: 120px;
}
.qr-refresh-timer {
    width: 100%;
    height: 2px;
    background: #f0f0f0;
    margin-top: 5px;
    border-radius: 1px;
    overflow: hidden;
}
.timer-bar {
    height: 100%;
    width: 100%;
    background: #c0373d;
    transition: width 1s linear;
}

/* Wallet Integration */
.wallet-integration {
    display: flex;
    justify-content: center;
    gap: 8px;
    padding: 5px 0;
}
.wallet-btn {
    height: 24px;
    cursor: pointer;
    transition: transform 0.2s;
}
.wallet-btn:hover { transform: scale(1.05); }
.wallet-btn img { height: 100%; }

.ticket-modal-wrap {
    padding-bottom: 40px;
}
</style>
