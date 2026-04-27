<div class="page-header">
    <h2>Cấu Hình Hệ Thống</h2>
    <button class="btn btn-primary"><i class="fa-solid fa-floppy-disk"></i> Lưu Cấu Hình</button>
</div>

<div class="content-panel" style="padding: 30px; display: grid; gap: 30px;">
    <div>
        <h4 style="margin-bottom: 15px; color: var(--primary);">Thông tin rạp</h4>
        <div class="form-group">
            <label>Tên Rạp Cơ Sở</label>
            <input type="text" class="form-control" value="D Prime Cinema" style="width: 400px; background: var(--surface); border: 1px solid var(--border-color); padding: 10px; color: #fff; border-radius: 8px;">
        </div>
        <div class="form-group" style="margin-top: 15px;">
            <label>Logo (URL)</label>
            <input type="text" class="form-control" value="/assets/images/logo.png" style="width: 400px; background: var(--surface); border: 1px solid var(--border-color); padding: 10px; color: #fff; border-radius: 8px;">
        </div>
    </div>
    
    <div style="border-top: 1px solid var(--border-color); padding-top: 30px;">
        <h4 style="margin-bottom: 15px; color: var(--primary);">API & Tích Hợp</h4>
        <div class="form-group">
            <label>VNPay Merchant Code</label>
            <input type="text" class="form-control" value="DPRIME_VNPAY_2026" style="width: 400px; background: var(--surface); border: 1px solid var(--border-color); padding: 10px; color: #fff; border-radius: 8px;">
        </div>
        <div class="form-group" style="margin-top: 15px;">
            <label>Momo API Endpoint</label>
            <input type="text" class="form-control" value="https://test-payment.momo.vn/v2/gateway/api/create" style="width: 400px; background: var(--surface); border: 1px solid var(--border-color); padding: 10px; color: #fff; border-radius: 8px;">
        </div>
    </div>
</div>
