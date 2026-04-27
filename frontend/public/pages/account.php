<?php
// account.php
?>
<link rel="stylesheet" href="assets/css/account.css?v=<?php echo time(); ?>">

<div class="account-container">
    
    <!-- SIDEBAR -->
    <div class="account-sidebar">
        <h3>TÀI KHOẢN</h3>
        <ul>
            <li class="menu-item active" data-section="section-info">Thông tin chung</li>
            <li class="menu-item" data-section="section-detail">Chi tiết tài khoản</li>
            <li class="menu-item" data-section="section-payment-pin">Mật mã thanh toán</li>
            <li class="menu-item" data-section="section-membership">Thẻ thành viên</li>
            <li class="menu-item" data-section="section-points">Điểm thưởng</li>
            <li class="menu-item" data-section="section-voucher">Voucher</li>
            <li class="menu-item" data-section="section-coupon">Coupon</li>
            <li class="menu-item" data-section="section-history">Lịch sử giao dịch</li>
        </ul>
    </div>

    <!-- CONTENT -->
    <div class="account-content">

        <!-- 1. THÔNG TIN CHUNG -->
        <div id="section-info" class="tab-content" style="display: block;">
            <h2 class="title">THÔNG TIN CHUNG</h2>
            <div class="account-header">
                <div class="avatar">
                    <img id="avatar-img" src="assets/images/avatar-default.png" alt="Avatar">
                    <input type="file" id="avatar-file-input" accept="image/*" style="display:none;">
                    <button type="button" id="change-avatar-btn">Thay đổi</button>
                </div>
                <div class="welcome">
                    <h3>Xin chào <span id="fullname">Khách hàng</span>,</h3>
                    <p>Với trang này, bạn sẽ quản lý được tất cả thông tin tài khoản của mình.</p>
                    <div class="member-box">
                        <div><strong>Cấp độ thẻ</strong><p class="member">MEMBER</p></div>
                        <div><strong>Tổng chi tiêu</strong><p>0 đ</p></div>
                        <div><strong>Điểm</strong><p>0 P</p></div>
                    </div>
                </div>
            </div>
            
            <div class="account-stats">
                <div class="stat">Thẻ quà tặng<br><b>0</b><button>Xem</button></div>
                <div class="stat">Voucher<br><b>0</b><button>Xem</button></div>
                <div class="stat">Coupon<br><b><span id="stat-coupon-count">0</span></b><button>Xem</button></div>
                <div class="stat">Thẻ thành viên<br><b>1</b><button>Xem</button></div>
            </div>

            <div class="account-info">
                <h3>Thông tin tài khoản</h3>
                <p><b>Tên:</b> <span id="info-name">---</span></p>
                <p><b>Email:</b> <span id="info-email">---</span></p>
                <p><b>Điện thoại:</b> <span id="info-phone">---</span></p>
                <p><b>Ngày sinh:</b> <span id="info-birthday">---</span></p>
                <p><b>Giới tính:</b> <span id="info-gender">---</span></p>
                <p><b>Khu vực:</b> <span id="info-region">---</span></p>
                <p><b>Rạp yêu thích:</b> <span id="info-cinema">---</span></p>
            </div>
        </div>

        <!-- 2. CHI TIẾT TÀI KHOẢN -->
        <div id="section-detail" class="tab-content" style="display: none;">
            <h2 class="title">CHI TIẾT TÀI KHOẢN</h2>
            <form id="form-update-profile" class="glass-form">
                <div class="form-grid">
                    <div class="form-group">
                        <label>Tên *</label>
                        <input type="text" name="fullname" id="edit-fullname" required>
                    </div>
                    <div class="form-group">
                        <label>Thành phố/Tỉnh *</label>
                        <select name="city" id="edit-city" required></select>
                    </div>
                    <div class="form-group">
                        <label>Điện thoại *</label>
                        <input type="text" name="phone" id="edit-phone" required>
                    </div>
                    <div class="form-group">
                        <label>Rạp yêu thích</label>
                        <select name="favorite_cinema" id="edit-cinema"></select>
                    </div>
                    <div class="form-group">
                        <label>Giới tính</label>
                        <div class="radio-group">
                            <label><input type="radio" name="gender" value="Nam"> Nam</label>
                            <label><input type="radio" name="gender" value="Nữ"> Nữ</label>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Ngày sinh</label>
                        <input type="date" name="birthday" id="edit-birthday">
                    </div>
                    <div class="form-group full-width">
                        <label>Mật khẩu cũ (Để xác nhận thay đổi) *</label>
                        <input type="password" name="old_password" id="edit-old-password" required>
                    </div>
                </div>

                <div class="form-group full-width">
                    <label class="checkbox-label">
                        <input type="checkbox" id="check-change-pass"> Thay đổi mật khẩu đăng nhập
                    </label>
                </div>

                <div id="change-pass-fields" style="display:none;" class="form-grid">
                    <div class="form-group">
                        <label>Mật khẩu mới</label>
                        <input type="password" name="new_password" id="edit-new-password">
                    </div>
                    <div class="form-group">
                        <label>Nhập lại mật khẩu mới</label>
                        <input type="password" id="edit-confirm-password">
                    </div>
                </div>

                <div class="form-actions">
                    <button type="submit" class="btn-save">LƯU THÔNG TIN</button>
                </div>
            </form>
        </div>

        <!-- 3. MẬT MÃ THANH TOÁN -->
        <div id="section-payment-pin" class="tab-content" style="display: none;">
            <h2 class="title">MẬT MÃ THANH TOÁN</h2>
            <div class="pin-instruction">
                <p>- Mật mã dùng để xác minh các giao dịch thanh toán bằng Coupon, Voucher...</p>
                <p>- Phải có đúng 6 chữ số và không được là 6 số trùng nhau.</p>
            </div>
            <form id="form-payment-pin" class="glass-form narrow">
                <div id="pin-old-group" class="form-group" style="display:none;">
                    <label>Mật mã hiện tại *</label>
                    <input type="password" id="pin-old" maxlength="6" placeholder="6 số cũ">
                </div>
                <div class="form-group">
                    <label>Mật mã mới *</label>
                    <input type="password" id="pin-new" maxlength="6" placeholder="6 số mới" required>
                </div>
                <div class="form-group">
                    <label>Nhập lại mật mã mới *</label>
                    <input type="password" id="pin-confirm" maxlength="6" placeholder="Xác nhận 6 số" required>
                </div>
                <button type="submit" class="btn-save">XÁC NHẬN</button>
            </form>
        </div>

        <!-- 4. COUPON -->
        <div id="section-coupon" class="tab-content" style="display: none;">
            <h2 class="title">COUPON</h2>
            <div class="coupon-registration-box glass-form">
                <div class="reg-content">
                    <h3>Đăng Ký Coupon</h3>
                    <form id="form-register-coupon" class="inline-form">
                        <input type="text" id="coupon-code-input" placeholder="Nhập mã coupon" required>
                        <button type="submit" class="btn-save">Đăng Ký</button>
                    </form>
                </div>
            </div>
            <h3 class="form-subtitle">Coupon Của Bạn</h3>
            <div class="table-container">
                <table class="account-table">
                    <thead>
                        <tr><th>Tên Coupon</th><th>Mã</th><th>Ngày nhận</th><th>Hạn dùng</th><th>Trạng thái</th></tr>
                    </thead>
                    <tbody id="coupon-list-body"></tbody>
                </table>
            </div>
        </div>

        <!-- 5. LỊCH SỬ GIAO DỊCH -->
        <div id="section-history" class="tab-content" style="display: none;">
            <h2 class="title">LỊCH SỬ GIAO DỊCH</h2>
            <div class="table-container">
                <table class="account-table">
                    <thead>
                        <tr><th>Phim</th><th>Rạp</th><th>Ghế</th><th>Ngày đặt</th><th>Tổng tiền</th><th>Trạng thái</th></tr>
                    </thead>
                    <tbody id="history-list-body"></tbody>
                </table>
            </div>
        </div>

    </div>
</div>


