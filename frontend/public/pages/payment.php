<style>
    /* OPTIMIZED GLASSMORPHISM FOR PAYMENT */
    .pay-root { background: #0b0c10; color: #fff; min-height: 100vh; font-family: 'Segoe UI', sans-serif; }
    .pay-card { 
        background: rgba(255, 255, 255, 0.03); 
        backdrop-filter: blur(15px); 
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 16px; 
        padding: 24px; 
        box-shadow: 0 10px 30px rgba(0,0,0,0.4);
    }
    .pay-card-head { font-size: 1.1rem; font-weight: 600; color: #e71a0f; margin-bottom: 20px; text-transform: uppercase; letter-spacing: 1px; }
    
    /* COUPON BOX */
    .coupon-box { display: flex; gap: 10px; margin-top: 5px; }
    .coupon-box input { 
        flex: 1; 
        background: rgba(255, 255, 255, 0.05); 
        border: 1px dashed rgba(255, 255, 255, 0.2); 
        border-radius: 8px; 
        padding: 12px; color: #fff; font-weight: 600; text-transform: uppercase;
    }
    .btn-apply-coupon { 
        background: #e71a0f; color: #fff; border: none; padding: 0 20px; border-radius: 8px; 
        font-weight: 600; cursor: pointer; transition: 0.3s;
    }
    .btn-apply-coupon:hover { background: #ff2a1a; transform: translateY(-2px); }
    .coupon-msg { font-size: 0.85rem; margin-top: 8px; min-height: 1.2em; }
    
    /* PIN MODAL */
    .pin-modal-overlay {
        position: fixed; inset: 0; background: rgba(0,0,0,0.85); backdrop-filter: blur(8px);
        display: none; align-items: center; justify-content: center; z-index: 10001;
    }
    .pin-box {
        width: 100%; max-width: 400px; padding: 35px; text-align: center;
        background: rgba(25, 25, 25, 0.95); border: 1px solid rgba(255,255,255,0.1); border-radius: 24px;
        box-shadow: 0 20px 50px rgba(0,0,0,0.5); transform: translateY(20px); transition: 0.3s;
    }
    .pin-modal-overlay.show .pin-box { transform: translateY(0); }
    .pin-title { font-size: 1.5rem; font-weight: 700; margin-bottom: 10px; }
    .pin-desc { color: #888; margin-bottom: 25px; }
    .pin-inputs { display: flex; justify-content: center; gap: 12px; margin-bottom: 30px; }
    .pin-digit {
        width: 45px; height: 55px; background: rgba(255,255,255,0.05); border: 2px solid rgba(255,255,255,0.1);
        border-radius: 12px; font-size: 1.5rem; font-weight: 700; color: #fff; text-align: center;
        transition: 0.2s;
    }
    .pin-digit:focus { border-color: #e71a0f; background: rgba(231, 26, 15, 0.1); outline: none; }
    .btn-verify-pin { 
        width: 100%; padding: 15px; background: #e71a0f; color: #fff; border: none; border-radius: 12px;
        font-size: 1.1rem; font-weight: 700; cursor: pointer; transition: 0.3s;
    }
    .btn-verify-pin:hover { background: #ff2a1a; }
    .btn-close-pin { position: absolute; top: 20px; right: 20px; background: none; border: none; color: #888; font-size: 1.5rem; cursor: pointer; }

    /* SUMMARY ENHANCEMENT */
    .pay-card-total { background: linear-gradient(145deg, rgba(231, 26, 15, 0.1), rgba(0,0,0,0)); }
    .discount-row { color: #44ff88; font-weight: 600; display: none; }

    /* BACK BUTTON STYLE */
    .btn-pay-back {
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.1);
        color: #fff;
        padding: 8px 16px;
        border-radius: 8px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 0.9rem;
        transition: 0.3s;
    }
    .btn-pay-back:hover {
        background: rgba(255, 255, 255, 0.2);
        transform: translateX(-5px);
    }
</style>

<div class="pay-root">
    
    <!-- PIN VERIFICATION MODAL -->
    <div class="pin-modal-overlay" id="pin-modal">
        <div class="pin-box">
            <button class="btn-close-pin" onclick="closePinModal()">✕</button>
            <div class="pin-title" data-i18n="step_pay">Mật mã thanh toán</div>
            <p class="pin-desc">Vui lòng nhập 6 số mật mã để xác nhận giao dịch</p>
            <div class="pin-inputs">
                <input type="password" class="pin-digit" maxlength="1" data-index="0">
                <input type="password" class="pin-digit" maxlength="1" data-index="1">
                <input type="password" class="pin-digit" maxlength="1" data-index="2">
                <input type="password" class="pin-digit" maxlength="1" data-index="3">
                <input type="password" class="pin-digit" maxlength="1" data-index="4">
                <input type="password" class="pin-digit" maxlength="1" data-index="5">
            </div>
            <button class="btn-verify-pin" onclick="handlePinSubmit()">XÁC NHẬN THANH TOÁN</button>
            <div id="pin-error" style="color:#ff4444; margin-top:15px; font-size:0.9rem; display:none"></div>
        </div>
    </div>

    <!-- HEADER BAR -->
    <div class="pay-topbar">
        <button class="btn-pay-back" onclick="goBackToCombo()">
            <i class="fa-solid fa-arrow-left"></i> <span data-i18n="back">Quay lại</span>
        </button>
        <div class="pay-topbar-brand">🎬 DPrime Cinema</div>
        <div class="pay-topbar-steps">
            <span class="pay-step done" data-i18n="step_seat">① Chọn ghế</span>
            <span class="pay-step-arrow">→</span>
            <span class="pay-step done" data-i18n="step_combo">② Combo</span>
            <span class="pay-step-arrow">→</span>
            <span class="pay-step active" data-i18n="step_pay">③ Thanh toán</span>
        </div>
        <div class="pay-topbar-timer">
            <span class="pay-timer-icon">⏳</span>
            <span id="pay-countdown">--:--</span>
        </div>
    </div>

    <!-- HERO INFO BAR -->
    <div class="pay-hero">
        <div class="pay-hero-inner">
            <div class="pay-hero-movie">
                <div class="pay-hero-label" data-i18n="nav_movies">Phim</div>
                <div id="pay-movie-name" class="pay-hero-title" data-i18n="Đang tải...">Đang tải...</div>
            </div>
            <div class="pay-hero-divider"></div>
            <div class="pay-hero-cinema">
                <div class="pay-hero-label">Suất chiếu</div>
                <div id="pay-cinema-info" class="pay-hero-sub">Đang tải...</div>
            </div>
        </div>
    </div>

    <!-- MAIN BODY -->
    <div class="pay-body">

        <!-- CỘT TRÁI: Tóm tắt -->
        <div class="pay-col-summary">

            <div class="pay-card">
                <div class="pay-card-head">🎟️ Chi tiết đặt vé</div>
                <div class="pay-rows">
                    <div class="pay-row">
                        <span class="pr-label">Phim</span>
                        <span class="pr-val" id="sum-movie">---</span>
                    </div>
                    <div class="pay-row">
                        <span class="pr-label">Rạp / Phòng</span>
                        <span class="pr-val" id="sum-cinema">---</span>
                    </div>
                    <div class="pay-row">
                        <span class="pr-label">Suất chiếu</span>
                        <span class="pr-val" id="sum-showtime">---</span>
                    </div>
                    <div class="pay-row">
                        <span class="pr-label">Ghế đã chọn</span>
                        <span class="pr-val seat-tags" id="sum-seats">---</span>
                    </div>
                </div>
            </div>

            <div class="pay-card" id="combo-card" style="display:none">
                <div class="pay-card-head">Combo đã chọn</div>
                <div id="sum-combo-list" class="pay-rows"></div>
            </div>

            <!-- CHƯƠNG TRÌNH KHUYẾN MÃI (COUPON) -->
            <div class="pay-card">
                <div class="pay-card-head" data-i18n="total_money">Mã giảm giá</div>
                <div class="coupon-box">
                    <input type="text" id="coupon-input" placeholder="Nhập mã ưu đãi...">
                    <button class="btn-apply-coupon" onclick="applyCheckoutCoupon()">ÁP DỤNG</button>
                </div>
                <div id="coupon-msg" class="coupon-msg"></div>
            </div>

            <div class="pay-card pay-card-total">
                <div class="pay-row">
                    <span class="pr-label">Tiền ghế</span>
                    <span class="pr-val" id="sum-seat-total">---</span>
                </div>
                <div class="pay-row" id="row-combo">
                    <span class="pr-label">Tiền combo</span>
                    <span class="pr-val" id="sum-combo-total">---</span>
                </div>
                <div class="pay-row discount-row" id="row-discount">
                    <span class="pr-label">Giảm giá Coupon</span>
                    <span class="pr-val" id="sum-discount">-0đ</span>
                </div>
                <div class="pay-divider"></div>
                <div class="pay-row pay-row-grand">
                    <span class="pr-label" data-i18n="total_money">TỔNG CỘNG</span>
                    <span class="pr-val grand-val" id="sum-final-total">---</span>
                </div>
            </div>

        </div>

        <!-- CỘT PHẢI: Thanh toán -->
        <div class="pay-col-method">

            <div class="pay-card">
                <div class="pay-card-head">💳 Phương thức thanh toán</div>

                <div class="pm-list">

                    <label class="pm-item active" data-method="bank_transfer">
                        <input type="radio" name="payment_method" value="bank_transfer" checked>
                        <div class="pm-item-inner">
                            <div class="pm-item-icon"><i class="fa-solid fa-building-columns"></i></div>
                            <div class="pm-item-text">
                                <div class="pm-item-name">Chuyển khoản ngân hàng</div>
                                <div class="pm-item-desc">Quét QR — xác nhận tự động trong 1–3 phút</div>
                            </div>
                            <div class="pm-check-mark">✓</div>
                        </div>
                    </label>

                    <label class="pm-item" data-method="vnpay">
                        <input type="radio" name="payment_method" value="vnpay">
                        <div class="pm-item-inner">
                            <div class="pm-item-icon">
                                <img src="./assets/images/icons/vnpay.png" alt="VNPay"
                                     style="height:28px;object-fit:contain"
                                     onerror="this.outerHTML=''">
                            </div>
                            <div class="pm-item-text">
                                <div class="pm-item-name">VNPay</div>
                                <div class="pm-item-desc">ATM, thẻ quốc tế, ví VNPay</div>
                            </div>
                            <div class="pm-check-mark">✓</div>
                        </div>
                    </label>

                </div>



                <!-- BANK TRANSFER PANEL -->
                <div id="bank-panel" class="method-panel" style="display:none">
                    <div id="bank-before-confirm" class="bank-pre-note">
                        <span></span> Nhấn <b>Xác nhận đặt vé</b> để nhận mã QR thanh toán
                    </div>

                    <div id="bank-qr-section" style="display:none">
                        <div class="bank-qr-wrap">
                            <img id="bank-qr-img" src="" alt="QR Code" class="bank-qr-img">
                            <div class="bank-qr-badge">Quét bằng app ngân hàng bất kỳ</div>
                        </div>

                        <div class="bank-info-grid">
                            <div class="bank-info-row">
                                <span class="bi-label">Ngân hàng</span>
                                <span class="bi-val">MB Bank</span>
                            </div>
                            <div class="bank-info-row">
                                <span class="bi-label">Số tài khoản</span>
                                <span class="bi-val" id="bk-acc">131020047979</span>
                            </div>
                            <div class="bank-info-row">
                                <span class="bi-label">Chủ tài khoản</span>
                                <span class="bi-val">NGUYEN VAN DUY</span>
                            </div>
                            <div class="bank-info-row">
                                <span class="bi-label">Số tiền</span>
                                <span class="bi-val bi-amount" id="bk-amount">---</span>
                            </div>
                            <div class="bank-info-row">
                                <span class="bi-label">Nội dung CK</span>
                                <span class="bi-val bi-content" id="bk-content">---</span>
                                <button class="btn-copy-inline" id="btn-copy-ck" onclick="copyBankContent()">📋 Copy</button>
                            </div>
                        </div>

                        <div class="bank-note">Nhập đúng nội dung chuyển khoản. Hệ thống tự xác nhận sau 1–3 phút.</div>

                        <div class="bank-status-bar" id="bank-status-bar">
                            <div class="status-dot pending" id="status-dot"></div>
                            <span id="bank-status-text">⏳ Đang chờ chuyển khoản...</span>
                        </div>

                        <div style="margin-top:12px">
                            <button class="btn-simulate" id="btn-simulate" onclick="simulatePayment()">
                                🧪 [Dev] Giả lập nhận tiền
                            </button>
                        </div>
                    </div>
                </div>

                <!-- VNPAY PANEL -->
                <div id="vnpay-panel" class="method-panel" style="display:none">
                    <div class="vnpay-note">
                        <span></span> Bạn sẽ được chuyển đến cổng thanh toán VNPay an toàn sau khi xác nhận.
                    </div>
                </div>

            </div>

            <!-- NÚT XÁC NHẬN -->
            <button class="btn-pay-confirm" id="btn-confirm" onclick="confirmPayment()">
                <span id="btn-text" data-i18n="btn_confirm_pay">Xác nhận đặt vé</span>
                <span id="btn-loading" style="display:none">
                    <span class="spinner"></span> Đang xử lý...
                </span>
            </button>

        </div>

    </div>

</div>

<!-- SUCCESS OVERLAY -->
<div id="success-overlay" class="success-overlay" style="display:none">
    <div class="success-box">
        <div class="success-anim">
            <div class="success-circle">
                <svg viewBox="0 0 52 52" class="checkmark">
                    <circle cx="26" cy="26" r="25" fill="none" class="checkmark-circle"/>
                    <path d="M14.1 27.2l7.1 7.2 16.7-16.8" fill="none" class="checkmark-check"/>
                </svg>
            </div>
        </div>
        <h2 class="success-title">Đặt vé thành công!</h2>
        <div class="success-code-wrap">
            <div class="success-code-label">Mã đặt vé của bạn</div>
            <div class="success-code" id="overlay-code">---</div>
        </div>
        <p class="success-msg" id="overlay-msg"></p>
        <div class="success-actions">
            <button onclick="goHome()" class="btn-go-home">🏠 Về trang chủ</button>
            <button onclick="window.location.href='my-tickets.php'" class="btn-view-ticket">🎟️ Xem vé của tôi</button>
        </div>
    </div>
</div>

<script src="./assets/js/payment.js?v=<?php echo time(); ?>"></script>
