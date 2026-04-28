<div class="page-header">
    <h2>Quản Lý Kho Nguyên Liệu (F&B)</h2>
    <div class="header-actions">
        <select id="cinema-filter" class="form-control" style="width: 250px; margin-right: 10px;" onchange="onCinemaChange()">
            <!-- Cinema options -->
        </select>
        <button class="btn btn-primary" id="btn-add-item" onclick="openItemModal()"><i class="fa-solid fa-share-nodes"></i> Cấp Hàng Về Rạp</button>
        <button class="btn btn-success" id="btn-import-stock" onclick="openImportModal()"><i class="fa-solid fa-truck-ramp-box"></i> Nhập Kho Tổng</button>
    </div>
</div>

<div class="inventory-stats">
    <div class="stat-card">
        <div class="stat-icon" style="background: rgba(52, 152, 219, 0.1); color: #3498db;">
            <i class="fa-solid fa-boxes-stacked"></i>
        </div>
        <div class="stat-info">
            <span class="stat-label">Tổng Nguyên Liệu</span>
            <span class="stat-value" id="total-items-count">0</span>
        </div>
    </div>
    <div class="stat-card">
        <div class="stat-icon" style="background: rgba(231, 76, 60, 0.1); color: #e74c3c;">
            <i class="fa-solid fa-triangle-exclamation"></i>
        </div>
        <div class="stat-info">
            <span class="stat-label">Sắp Hết Hàng</span>
            <span class="stat-value" id="low-stock-count">0</span>
        </div>
    </div>
    <div class="stat-card">
        <div class="stat-icon" style="background: rgba(46, 204, 113, 0.1); color: #2ecc71;">
            <i class="fa-solid fa-clock-rotate-left"></i>
        </div>
        <div class="stat-info">
            <span class="stat-label">Nhập Kho (Tháng này)</span>
            <span class="stat-value" id="monthly-import-count">0</span>
        </div>
    </div>
</div>

<div class="tabs-container">
    <div class="tab-btn active" onclick="switchTab('central')">
        <i class="fa-solid fa-warehouse"></i> Tổng Kho
    </div>
    <div class="tab-btn" onclick="switchTab('items')">
        <i class="fa-solid fa-list-check"></i> Danh Sách Kho Rạp
    </div>
    <div class="tab-btn" onclick="switchTab('recipes')">
        <i class="fa-solid fa-mortar-pestle"></i> Công Thức Combo
    </div>
    <div class="tab-btn" onclick="switchTab('logs')">
        <i class="fa-solid fa-history"></i> Lịch Sử Nhập/Xuất
    </div>
    <div class="tab-btn" onclick="switchTab('reports')">
        <i class="fa-solid fa-chart-line"></i> Báo Cáo COGS
    </div>
</div>
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

<!-- Tab: Tổng kho -->
<div class="content-panel tab-content active" id="tab-central">
    <table class="admin-table">
        <thead>
            <tr>
                <th width="80">ID</th>
                <th>Tên Nguyên Liệu</th>
                <th>Đơn Vị</th>
                <th>Tồn Kho Tổng</th>
                <th>Cập Nhật Lần Cuối</th>
            </tr>
        </thead>
        <tbody id="central-tbody">
            <tr><td colspan="5" class="loading-cell"><i class="fa-solid fa-spinner fa-spin"></i> Đang tải kho tổng...</td></tr>
        </tbody>
    </table>
</div>

<!-- Tab: Danh sách kho -->
<div class="content-panel tab-content" id="tab-items" style="display: none;">
    <table class="admin-table">
        <thead>
            <tr>
                <th width="60">ID</th>
                <th>Tên Nguyên Liệu</th>
                <th>Đơn Vị</th>
                <th>Tồn Kho Hiện Tại</th>
                <th>Mức Cảnh Báo</th>
                <th>Trạng Thái</th>
                <th width="100" style="text-align: right">Thao Tác</th>
            </tr>
        </thead>
        <tbody id="inventory-tbody">
            <tr><td colspan="7" class="loading-cell"><i class="fa-solid fa-spinner fa-spin"></i> Đang tải dữ liệu...</td></tr>
        </tbody>
    </table>
</div>

<!-- Tab: Công thức Combo -->
<div class="content-panel tab-content" id="tab-recipes" style="display: none;">
    <div class="recipe-grid" id="recipes-container">
        <!-- Rendered by JS -->
        <div class="loading-cell" style="grid-column: 1/-1;"><i class="fa-solid fa-spinner fa-spin"></i> Đang tải công thức...</div>
    </div>
</div>

<!-- Tab: Báo cáo COGS -->
<div class="content-panel tab-content" id="tab-reports" style="display: none; padding: 24px;">
    <div class="inventory-stats" style="margin-bottom: 24px;">
        <div class="stat-card">
            <div class="stat-icon" style="background: rgba(231, 76, 60, 0.1); color: #e74c3c;">
                <i class="fa-solid fa-file-invoice-dollar"></i>
            </div>
            <div class="stat-info">
                <span class="stat-label">Tổng Chi Phí Vốn (COGS)</span>
                <span class="stat-value" id="total-cogs-value">0đ</span>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon" style="background: rgba(46, 204, 113, 0.1); color: #2ecc71;">
                <i class="fa-solid fa-hand-holding-dollar"></i>
            </div>
            <div class="stat-info">
                <span class="stat-label">Doanh Thu Combo</span>
                <span class="stat-value" id="total-revenue-value">0đ</span>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon" style="background: rgba(241, 196, 15, 0.1); color: #f1c40f;">
                <i class="fa-solid fa-chart-pie"></i>
            </div>
            <div class="stat-info">
                <span class="stat-label">Lợi Nhuận Thực Tế</span>
                <span class="stat-value" id="net-profit-value">0đ</span>
            </div>
        </div>
    </div>

    <div style="background: rgba(0,0,0,0.2); border-radius: 16px; padding: 24px; margin-bottom: 24px; border: 1px solid var(--border-color);">
        <h4 style="color:#fff; margin-bottom:20px">Biểu đồ Doanh thu vs Chi phí (Tháng hiện tại)</h4>
        <div style="height: 300px;">
            <canvas id="cogsChart"></canvas>
        </div>
    </div>

    <table class="admin-table">
        <thead>
            <tr>
                <th>Nguyên Liệu</th>
                <th>Giá Nhập (Đơn vị)</th>
                <th>Lượng Tiêu Thụ</th>
                <th>Tổng Chi Phí</th>
            </tr>
        </thead>
        <tbody id="cogs-tbody">
            <!-- Rendered by JS -->
        </tbody>
    </table>
</div>

<!-- Tab: Lịch sử -->
<div class="content-panel tab-content" id="tab-logs" style="display: none;">
    <table class="admin-table">
        <thead>
            <tr>
                <th width="180">Thời Gian</th>
                <th>Nguyên Liệu</th>
                <th>Số Lượng</th>
                <th>Người Thực Hiện</th>
                <th>Loại</th>
                <th>Ghi Chú</th>
            </tr>
        </thead>
        <tbody id="logs-tbody">
            <tr><td colspan="6" class="loading-cell">Chưa có dữ liệu lịch sử.</td></tr>
        </tbody>
    </table>
</div>

<!-- Modal: Thêm Nguyên Liệu -->
<div id="itemModal" class="modal-overlay" style="display:none">
    <div class="modal-box" style="max-width:400px">
        <div class="modal-header">
            <h3>Thêm Nguyên Liệu Mới</h3>
            <button class="close-btn" onclick="closeItemModal()"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <div class="modal-body">
            <div class="form-group">
                <label>Chọn nguyên liệu từ danh mục *</label>
                <select id="item_catalog" class="form-control" onchange="onCatalogSelect()">
                    <option value="">-- Chọn món --</option>
                    <optgroup label="Bắp & Gia vị">
                        <option value="Hạt bắp Mỹ" data-unit="kg">Hạt bắp Mỹ</option>
                        <option value="Dầu Bơ" data-unit="lít">Dầu Bơ</option>
                        <option value="Bột Phô Mai" data-unit="kg">Bột Phô Mai</option>
                        <option value="Đường Caramel" data-unit="kg">Đường Caramel</option>
                    </optgroup>
                    <optgroup label="Nước giải khát">
                        <option value="Coca-Cola (Siro)" data-unit="Thùng">Coca-Cola (Siro)</option>
                        <option value="Sprite (Siro)" data-unit="Thùng">Sprite (Siro)</option>
                        <option value="Fanta (Siro)" data-unit="Thùng">Fanta (Siro)</option>
                        <option value="Nước suối Dasani" data-unit="Thùng">Nước suối Dasani</option>
                    </optgroup>
                    <optgroup label="Vật tư & Bao bì">
                        <option value="Ly giấy D-Prime (Size L)" data-unit="Cái">Ly giấy D-Prime (Size L)</option>
                        <option value="Ly giấy D-Prime (Size M)" data-unit="Cái">Ly giấy D-Prime (Size M)</option>
                        <option value="Túi đựng bắp D-Prime" data-unit="Cái">Túi đựng bắp D-Prime</option>
                        <option value="Ống hút D-Prime" data-unit="Gói">Ống hút D-Prime</option>
                    </optgroup>
                    <option value="custom">-- Khác (Tự nhập tên) --</option>
                </select>
            </div>
            <div class="form-group" id="custom-item-name-group" style="display:none">
                <label>Tên nguyên liệu mới *</label>
                <input type="text" id="item_name" class="form-control" placeholder="Nhập tên món mới">
            </div>
            <div style="display: flex; gap: 15px;">
                <div class="form-group" style="flex: 1;">
                    <label>Đơn vị tính</label>
                    <input type="text" id="item_unit" class="form-control" placeholder="kg, cái..." readonly style="background: rgba(255,255,255,0.05); color: #94a3b8;">
                </div>
                <div class="form-group" style="flex: 1;">
                    <label>Số lượng nhập kho *</label>
                    <input type="number" id="initial_qty" class="form-control" value="0" min="0" placeholder="0">
                </div>
            </div>
            <div class="form-group">
                <label>Mức tồn tối thiểu (Báo đỏ khi dưới mức này)</label>
                <input type="number" id="min_stock" class="form-control" value="10" min="0">
            </div>
            <div class="form-group" style="display: flex; align-items: center; gap: 10px; margin-top: 20px; background: rgba(229,9,20,0.05); padding: 12px; border-radius: 10px; border: 1px solid rgba(229,9,20,0.2);">
                <input type="checkbox" id="apply_to_all" style="width: 20px; height: 20px; cursor: pointer;">
                <label for="apply_to_all" style="margin: 0; color: #fff; cursor: pointer; text-transform: none; font-size: 14px;">Áp dụng cho tất cả 6 chi nhánh</label>
            </div>
        </div>
        <div class="modal-footer">
            <button class="btn btn-secondary" onclick="closeItemModal()">Huỷ</button>
            <button class="btn btn-primary" onclick="saveItem()">Lưu Lại</button>
        </div>
    </div>
</div>

<!-- Modal: Nhập Kho Tổng -->
<div id="importModal" class="modal-overlay" style="display:none">
    <div class="modal-box" style="max-width:400px">
        <div class="modal-header">
            <h3>Nhập Hàng Vào Kho Tổng</h3>
            <button class="close-btn" onclick="closeImportModal()"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <div class="modal-body">
            <div class="form-group">
                <label>Chọn mặt hàng *</label>
                <select id="import_item_catalog" class="form-control" onchange="onImportCatalogSelect()">
                    <option value="">-- Chọn món --</option>
                    <optgroup label="Bắp & Gia vị">
                        <option value="Hạt bắp Mỹ" data-unit="kg">Hạt bắp Mỹ</option>
                        <option value="Dầu Bơ" data-unit="lít">Dầu Bơ</option>
                        <option value="Bột Phô Mai" data-unit="kg">Bột Phô Mai</option>
                        <option value="Đường Caramel" data-unit="kg">Đường Caramel</option>
                    </optgroup>
                    <optgroup label="Nước giải khát">
                        <option value="Coca-Cola (Siro)" data-unit="Thùng">Coca-Cola (Siro)</option>
                        <option value="Sprite (Siro)" data-unit="Thùng">Sprite (Siro)</option>
                        <option value="Fanta (Siro)" data-unit="Thùng">Fanta (Siro)</option>
                        <option value="Nước suối Dasani" data-unit="Thùng">Nước suối Dasani</option>
                    </optgroup>
                    <optgroup label="Vật tư & Bao bì">
                        <option value="Ly giấy D-Prime (Size L)" data-unit="Cái">Ly giấy D-Prime (Size L)</option>
                        <option value="Ly giấy D-Prime (Size M)" data-unit="Cái">Ly giấy D-Prime (Size M)</option>
                        <option value="Túi đựng bắp D-Prime" data-unit="Cái">Túi đựng bắp D-Prime</option>
                        <option value="Ống hút D-Prime" data-unit="Gói">Ống hút D-Prime</option>
                    </optgroup>
                </select>
            </div>
            <div class="form-group">
                <label>Số lượng nhập *</label>
                <div style="display:flex; gap:10px">
                    <input type="number" id="import_qty" class="form-control" placeholder="0.00" step="0.01" style="flex:2">
                    <input type="text" id="import_unit" class="form-control" placeholder="Đơn vị" readonly style="flex:1; background:rgba(255,255,255,0.05); color:#94a3b8">
                </div>
            </div>
            <div class="form-group">
                <label>Giá nhập mỗi đơn vị (VNĐ)</label>
                <input type="number" id="import_cost" class="form-control" placeholder="VD: 45000">
            </div>
            <div class="form-group">
                <label>Ghi chú</label>
                <textarea id="import_note" class="form-control" rows="3" placeholder="VD: Nhập từ NPP ABC..."></textarea>
            </div>
        </div>
        <div class="modal-footer">
            <button class="btn btn-secondary" onclick="closeImportModal()">Đóng</button>
            <button class="btn btn-primary" onclick="executeImport()">Xác Nhận Nhập Kho Tổng</button>
        </div>
    </div>
</div>

<!-- Modal: Điều Chỉnh Kho Rạp (Nhập kho/Điều chỉnh trực tiếp) -->
<div id="adjustModal" class="modal-overlay" style="display:none">
    <div class="modal-box" style="max-width:400px">
        <div class="modal-header">
            <h3>Nhập Hàng / Điều Chỉnh Kho Rạp</h3>
            <button class="close-btn" onclick="closeAdjustModal()"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <div class="modal-body">
            <input type="hidden" id="adjust_item_id">
            <div class="form-group">
                <label>Nguyên liệu</label>
                <input type="text" id="adjust_item_name" class="form-control" readonly style="background: rgba(255,255,255,0.05); color: #fff;">
            </div>
            <div class="form-group">
                <label>Rạp chi nhánh</label>
                <input type="text" id="adjust_cinema_name" class="form-control" readonly style="background: rgba(255,255,255,0.05); color: #fff;">
            </div>
            <div class="form-group">
                <label>Tồn hiện tại</label>
                <input type="text" id="adjust_current_stock" class="form-control" readonly style="background: rgba(255,255,255,0.05); color: #fff;">
            </div>
            <div class="form-group">
                <label>Số lượng thay đổi *</label>
                <div style="display:flex; gap:10px">
                    <input type="number" id="adjust_qty" class="form-control" placeholder="0.00" step="0.01" style="flex:2">
                    <input type="text" id="adjust_unit" class="form-control" readonly style="flex:1; background:rgba(255,255,255,0.05); color:#94a3b8">
                </div>
                <small style="color: #94a3b8; font-size: 11px; margin-top: 5px; display: block;">Nhập số dương để cộng thêm, số âm để trừ bớt.</small>
            </div>
            <div class="form-group">
                <label>Ghi chú / Lý do *</label>
                <textarea id="adjust_note" class="form-control" rows="3" placeholder="VD: Nhập bổ sung khẩn cấp, hao hụt kiểm kê..."></textarea>
            </div>
        </div>
        <div class="modal-footer">
            <button class="btn btn-secondary" onclick="closeAdjustModal()">Đóng</button>
            <button class="btn btn-primary" onclick="executeAdjust()">Xác Nhận</button>
        </div>
    </div>
</div>

<!-- Modal: Thiết lập công thức -->
<div id="recipeModal" class="modal-overlay" style="display:none">
    <div class="modal-box" style="max-width:500px">
        <div class="modal-header">
            <h3 id="recipe_modal_title">Công thức: My Combo</h3>
            <button class="close-btn" onclick="closeRecipeModal()"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <div class="modal-body">
            <input type="hidden" id="recipe_combo_id">
            <div id="recipe-items-list" style="margin-bottom: 20px;">
                <!-- Ingredients rows go here -->
            </div>
            <button class="btn btn-outline-primary" style="width:100%" onclick="addIngredientRow()">
                <i class="fa-solid fa-plus"></i> Thêm nguyên liệu vào công thức
            </button>
        </div>
        <div class="modal-footer">
            <button class="btn btn-secondary" onclick="closeRecipeModal()">Huỷ</button>
            <button class="btn btn-primary" onclick="saveRecipe()">Lưu Công Thức</button>
        </div>
    </div>
</div>

<style>
    /* --- Premium Header & Layout --- */
    .page-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:24px; }
    .page-header h2 { font-size:22px; font-weight:800; color:#fff; letter-spacing:-0.5px; }
    
    .inventory-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 30px; }
    .stat-card { background: var(--surface); border: 1px solid var(--border-color); border-radius: 16px; padding: 24px; display: flex; align-items: center; gap: 20px; transition: transform 0.3s ease; }
    .stat-card:hover { transform: translateY(-5px); border-color: rgba(255,255,255,0.1); }
    .stat-icon { width: 56px; height: 56px; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 24px; }
    .stat-label { display: block; font-size: 13px; color: var(--text-muted); margin-bottom: 6px; font-weight: 500; }
    .stat-value { display: block; font-size: 28px; font-weight: 800; color: #fff; line-height: 1; }

    /* --- Tabs --- */
    .tabs-container { display:flex; gap:8px; margin-bottom:24px; border-bottom:1px solid var(--border-color); padding-bottom:12px; }
    .tab-btn { padding:12px 24px; font-size:14px; font-weight:600; color:var(--text-muted); cursor:pointer; border-radius:10px; transition:all 0.3s ease; display:flex; align-items:center; gap:10px; }
    .tab-btn:hover { background:rgba(255,255,255,0.05); color:#fff; }
    .tab-btn.active { background:var(--primary); color:#fff; box-shadow:0 8px 20px rgba(229, 9, 20, 0.3); }

    /* --- Content Panel --- */
    .content-panel { background:var(--surface); border:1px solid var(--border-color); border-radius:16px; overflow:hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
    .admin-table { width:100%; border-collapse:collapse; }
    .admin-table th { padding:16px 20px; font-size:12px; text-transform:uppercase; letter-spacing:1px; color:var(--text-muted); border-bottom:1px solid var(--border-color); background:rgba(0,0,0,0.3); font-weight:700; }
    .admin-table td { padding:18px 20px; font-size:14px; border-bottom:1px solid var(--border-color); color:#cbd5e1; }
    .admin-table tr:hover { background: rgba(255,255,255,0.02); }
    
    .status-badge { padding: 5px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
    .status-ok { background: rgba(46, 204, 113, 0.15); color: #2ecc71; border: 1px solid rgba(46, 204, 113, 0.2); }
    .status-low { background: rgba(231, 76, 60, 0.15); color: #e74c3c; border: 1px solid rgba(231, 76, 60, 0.2); }

    /* --- Recipe Grid --- */
    .recipe-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 24px; padding: 24px; }
    .recipe-card { background: rgba(255,255,255,0.03); border: 1px solid var(--border-color); border-radius: 16px; padding: 24px; transition: 0.3s; }
    .recipe-card:hover { border-color: var(--primary); background: rgba(255,255,255,0.05); }
    .recipe-card h4 { margin-bottom: 20px; color: #fff; border-bottom: 1px solid var(--border-color); padding-bottom: 12px; display: flex; justify-content: space-between; align-items: center; font-size:16px; }
    .recipe-item { display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 10px; color: var(--text-muted); }
    .recipe-item span:last-child { color: #fff; font-weight: 600; }

    /* --- Premium Modals --- */
    .modal-overlay { 
        position:fixed; inset:0; background:rgba(0,0,0,0.85); z-index:9999; 
        display:flex; align-items:center; justify-content:center; 
        backdrop-filter:blur(8px); padding:20px;
    }
    .modal-box { 
        background:#1a1d21; border:1px solid rgba(255,255,255,0.1); 
        border-radius:24px; width:100%; box-shadow:0 30px 60px rgba(0,0,0,0.5); 
        display:flex; flex-direction:column; max-height:90vh;
        animation: modalIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    }
    @keyframes modalIn {
        from { opacity: 0; transform: scale(0.95) translateY(20px); }
        to { opacity: 1; transform: scale(1) translateY(0); }
    }
    .modal-header { padding:24px 30px; border-bottom:1px solid rgba(255,255,255,0.05); display:flex; justify-content:space-between; align-items:center; }
    .modal-header h3 { font-size:20px; color:#fff; font-weight:700; }
    .modal-body { padding:30px; overflow-y:auto; }
    .modal-footer { padding:20px 30px; border-top:1px solid rgba(255,255,255,0.05); display:flex; justify-content:flex-end; gap:12px; background: rgba(0,0,0,0.1); }
    
    .form-group { margin-bottom:20px; }
    .form-group label { display:block; font-size:13px; color:#94a3b8; margin-bottom:10px; font-weight:600; text-transform:uppercase; letter-spacing:0.5px; }
    .form-control { 
        width:100%; padding:14px 18px; background:rgba(255,255,255,0.03); 
        border:1px solid rgba(255,255,255,0.1); border-radius:12px; 
        color:#fff; font-size:15px; outline:none; transition:all 0.2s ease;
    }
    .form-control:focus { border-color:var(--primary); background:rgba(255,255,255,0.05); box-shadow:0 0 0 4px rgba(229,9,20,0.15); }
    .form-control option { background:#1a1d21; color:#fff; }
    .form-control optgroup { background:#1a1d21; color:var(--primary); font-weight:700; font-style:normal; margin-top:10px; }
    
    .ingredient-row { display: grid; grid-template-columns: 2fr 1fr auto; gap: 12px; margin-bottom: 12px; align-items: center; }
    .btn-outline-primary { 
        background: transparent; border: 2px dashed rgba(229,9,20,0.3); color: var(--primary); 
        cursor: pointer; padding: 14px; border-radius: 12px; font-weight: 700; transition: 0.2s;
    }
    .btn-outline-primary:hover { background: rgba(229,9,20,0.05); border-color: var(--primary); }
    
    .action-btn { 
        width:36px; height:36px; display:inline-flex; align-items:center; justify-content:center;
        background:rgba(255,255,255,0.05); border:none; color:var(--text-muted); 
        cursor:pointer; border-radius:10px; transition:0.2s; 
    }
    .action-btn:hover { background:rgba(255,255,255,0.1); color:#fff; }
    .action-btn.delete:hover { background:rgba(231,76,60,0.2); color:#e74c3c; }
</style>

<script>
let allItems = [];
let allCombos = [];
let allRecipes = [];
let allCinemas = [];
let currentCinemaId = '';

// Tab Switching
function switchTab(tabId) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.style.display = 'none');
    
    // Find the correct button by tabId or text
    const activeBtn = document.querySelector(`.tab-btn[onclick*="'${tabId}'"]`);
    if(activeBtn) activeBtn.classList.add('active');
    
    document.getElementById(`tab-${tabId}`).style.display = 'block';

    if(tabId === 'central') loadCentralInventory();
    if(tabId === 'items') loadItems();
    if(tabId === 'recipes') loadRecipes();
    if(tabId === 'logs') loadLogs();
    if(tabId === 'reports') loadReports();
}

let cogsChart = null;

async function loadReports() {
    const tbody = document.getElementById("cogs-tbody");
    try {
        const data = await API.get(`/booking/admin/inventory/report?cinema_id=${currentCinemaId}`);
        
        document.getElementById("total-cogs-value").innerText = new Intl.NumberFormat('vi-VN').format(data.total_cost) + "đ";
        document.getElementById("total-revenue-value").innerText = new Intl.NumberFormat('vi-VN').format(data.total_revenue) + "đ";
        document.getElementById("net-profit-value").innerText = new Intl.NumberFormat('vi-VN').format(data.net_profit) + "đ";

        if (!data.details.length) {
            tbody.innerHTML = `<tr><td colspan="4" class="loading-cell">Chưa có dữ liệu tiêu thụ.</td></tr>`;
        } else {
            tbody.innerHTML = data.details.map(d => `
                <tr>
                    <td style="color:#fff; font-weight:600">${d.item_name}</td>
                    <td>${new Intl.NumberFormat('vi-VN').format(d.cost_price)}đ / ${d.unit}</td>
                    <td>${parseFloat(d.total_consumed)} ${d.unit}</td>
                    <td style="color:var(--primary); font-weight:700">${new Intl.NumberFormat('vi-VN').format(d.total_cost)}đ</td>
                </tr>
            `).join("");
        }

        // Render Chart
        const ctx = document.getElementById('cogsChart').getContext('2d');
        if (cogsChart) cogsChart.destroy();
        
        cogsChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Tài Chính Tháng Hiện Tại'],
                datasets: [
                    {
                        label: 'Chi phí vốn (COGS)',
                        data: [data.total_cost],
                        backgroundColor: 'rgba(231, 76, 60, 0.6)',
                        borderColor: '#e74c3c',
                        borderWidth: 1
                    },
                    {
                        label: 'Doanh thu Combo',
                        data: [data.total_revenue],
                        backgroundColor: 'rgba(46, 204, 113, 0.6)',
                        borderColor: '#2ecc71',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { color: '#94a3b8' },
                        grid: { color: 'rgba(255,255,255,0.05)' }
                    },
                    x: {
                        ticks: { color: '#94a3b8' },
                        grid: { display: false }
                    }
                },
                plugins: {
                    legend: { labels: { color: '#fff' } }
                }
            }
        });

    } catch (err) {
        showToast("Lỗi tải báo cáo: " + err.message, "error");
    }
}

async function loadCentralInventory() {
    const tbody = document.getElementById("central-tbody");
    try {
        const items = await API.get("/booking/admin/inventory/central");
        if (!items.length) {
            tbody.innerHTML = `<tr><td colspan="5" class="loading-cell">Kho tổng hiện chưa có mặt hàng nào.</td></tr>`;
            return;
        }
        tbody.innerHTML = items.map(i => `
            <tr>
                <td>#${i.id}</td>
                <td style="color:#fff; font-weight:600">${i.item_name}</td>
                <td>${i.unit}</td>
                <td style="font-size:18px; font-weight:800; color:var(--primary)">${parseFloat(i.current_stock)}</td>
                <td style="font-size:12px">${new Date(i.updated_at).toLocaleString('vi-VN')}</td>
            </tr>
        `).join("");
    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="5" class="loading-cell" style="color:#e74c3c">Lỗi: ${err.message}</td></tr>`;
    }
}

async function loadCinemas() {
    try {
        const cinemas = await API.get("/booking/admin/cinemas");
        allCinemas = cinemas;
        const filter = document.getElementById("cinema-filter");
        filter.innerHTML = `<option value="all">-- Tất cả cơ sở --</option>` + 
            cinemas.map(c => `<option value="${c.id}">${c.name}</option>`).join("");
        
        currentCinemaId = 'all'; // Default to show all
        loadCentralInventory();
    } catch (err) {
        showToast("Lỗi tải danh sách rạp: " + err.message, "error");
    }
}

function onCinemaChange() {
    currentCinemaId = document.getElementById("cinema-filter").value;
    const activeTab = document.querySelector(".tab-btn.active").innerText.toLowerCase();
    if(activeTab.includes("tổng kho")) loadCentralInventory();
    else if(activeTab.includes("kho rạp")) loadItems();
    else if(activeTab.includes("lịch sử")) loadLogs();
    else if(activeTab.includes("báo cáo")) loadReports();
}

async function loadItems() {
    const tbody = document.getElementById("inventory-tbody");
    const isAll = currentCinemaId === 'all';
    
    // Update table headers
    const thead = document.querySelector("#tab-items table thead tr");
    thead.innerHTML = `
        <th width="60">ID</th>
        ${isAll ? '<th>Cơ Sở</th>' : ''}
        <th>Tên Nguyên Liệu</th>
        <th>Đơn Vị</th>
        <th>Tồn Kho</th>
        <th>Cảnh Báo</th>
        <th>Trạng Thái</th>
        <th width="140" style="text-align: right">Thao Tác</th>
    `;

    try {
        const items = await API.get(`/booking/admin/inventory/items?cinema_id=${currentCinemaId}`);
        allItems = items;
        
        document.getElementById("total-items-count").innerText = items.length;
        const lowStock = items.filter(i => parseFloat(i.current_stock) <= parseFloat(i.min_stock_level)).length;
        document.getElementById("low-stock-count").innerText = lowStock;

        if (!items.length) {
            tbody.innerHTML = `<tr><td colspan="${isAll ? 8 : 7}" class="loading-cell">Không có dữ liệu.</td></tr>`;
            return;
        }

        tbody.innerHTML = items.map(i => {
            const isLow = parseFloat(i.current_stock) <= parseFloat(i.min_stock_level);
            return `
            <tr>
                <td>#${i.id}</td>
                ${isAll ? `<td style="font-size:12px; color:var(--primary)">${i.cinema_name}</td>` : ''}
                <td style="color:#fff;font-weight:600">${i.item_name}</td>
                <td>${i.unit}</td>
                <td style="font-weight:700; color:${isLow ? '#e74c3c' : '#fff'}">${parseFloat(i.current_stock)}</td>
                <td>${parseFloat(i.min_stock_level)}</td>
                <td>
                    <span class="status-badge ${isLow ? 'status-low' : 'status-ok'}">
                        ${isLow ? 'Sắp hết' : 'Ổn định'}
                    </span>
                </td>
                <td style="text-align: right; display: flex; gap: 6px; justify-content: flex-end;">
                    <button class="action-btn" style="color:#2ecc71" title="Nhập kho / Điều chỉnh" onclick="openAdjustModal(${i.id}, '${i.item_name.replace(/'/g, "\\'")  }', '${i.unit}', ${parseFloat(i.current_stock)}, '${i.cinema_name ? i.cinema_name.replace(/'/g, "\\'") : ""}')"><i class="fa-solid fa-square-plus"></i></button>
                    <button class="action-btn delete" onclick="deleteItem(${i.id})"><i class="fa-solid fa-trash-can"></i></button>
                </td>
            </tr>`;
        }).join("");

        // Note: import_item_id dropdown đã được loại bỏ, sử dụng adjustModal trực tiếp trên từng dòng

    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="7" class="loading-cell" style="color:#e74c3c">Lỗi: ${err.message}</td></tr>`;
    }
}

async function loadRecipes() {
    const container = document.getElementById("recipes-container");
    try {
        const [combos, recipes] = await Promise.all([
            API.get("/booking/admin/combos"),
            API.get("/booking/admin/inventory/recipes")
        ]);
        allCombos = combos;
        allRecipes = recipes;

        if (!combos.length) {
            container.innerHTML = `<div class="loading-cell" style="grid-column: 1/-1;">Vui lòng tạo Combo trước tại mục Khuyến Mãi.</div>`;
            return;
        }

        container.innerHTML = combos.map(cb => {
            const cbRecipes = recipes.filter(r => r.combo_id === cb.id);
            return `
            <div class="recipe-card">
                <h4>
                    ${cb.name}
                    <button class="action-btn edit" onclick="openRecipeModal(${cb.id}, '${cb.name.replace(/'/g, "\\'")}')">
                        <i class="fa-solid fa-gear"></i>
                    </button>
                </h4>
                <div class="recipe-items">
                    ${cbRecipes.length > 0 ? cbRecipes.map(r => {
                        let displayQty = parseFloat(r.required_qty);
                        let displayUnit = r.unit;
                        
                        // Nếu là Coca-Cola, hiển thị dạng ml cho dễ hiểu
                        if (r.item_name.includes("Coca-Cola")) {
                            displayQty = displayQty * 20000;
                            displayUnit = "ml";
                        }
                        
                        return `
                        <div class="recipe-item">
                            <span>${r.item_name} ${displayUnit === 'ml' ? '(Pha chế)' : ''}</span>
                            <span>${displayQty} ${displayUnit}</span>
                        </div>`;
                    }).join("") : '<div style="font-size:12px; font-style:italic; color:var(--text-muted)">Chưa có công thức</div>'}
                </div>
            </div>`;
        }).join("");

    } catch (err) {
        container.innerHTML = `<div class="loading-cell" style="color:#e74c3c">Lỗi: ${err.message}</div>`;
    }
}

async function loadLogs() {
    const tbody = document.getElementById("logs-tbody");
    try {
        const logs = await API.get(`/booking/admin/inventory/logs?cinema_id=${currentCinemaId}`);
        if (!logs.length) {
            tbody.innerHTML = `<tr><td colspan="6" class="loading-cell">Chưa có lịch sử cho rạp này.</td></tr>`;
            return;
        }

        tbody.innerHTML = logs.map(l => `
            <tr>
                <td style="font-size:12px; color:#fff">
                    <i class="fa-regular fa-clock" style="margin-right:5px; color:var(--primary)"></i>
                    ${new Date(l.created_at).toLocaleString('vi-VN')}
                </td>
                <td style="font-weight:600">${l.item_name}</td>
                <td style="color:${l.change_qty > 0 ? '#2ecc71' : '#e74c3c'}; font-weight:800">
                    ${l.change_qty > 0 ? '+' : ''}${parseFloat(l.change_qty)} ${l.unit}
                </td>
                <td>
                    <span style="background:rgba(255,255,255,0.05); padding:4px 8px; border-radius:6px; font-size:12px">
                        <i class="fa-solid fa-user-check" style="margin-right:5px; opacity:0.7"></i>
                        ${l.created_by || 'Admin'}
                    </span>
                </td>
                <td>
                    <span class="status-badge" style="background:rgba(255,255,255,0.05)">
                        ${l.type === 'import' ? 'Nhập kho' : (l.type === 'export' ? 'Bán Combo' : 'Điều chỉnh')}
                    </span>
                </td>
                <td style="font-size:12px; max-width:200px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis" title="${l.note || ''}">
                    ${l.note || '-'}
                </td>
            </tr>
        `).join("");
    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="6" class="loading-cell">Lỗi: ${err.message}</td></tr>`;
    }
}

function onCatalogSelect() {
    const select = document.getElementById("item_catalog");
    const customGroup = document.getElementById("custom-item-name-group");
    const unitInput = document.getElementById("item_unit");
    
    const selectedOption = select.options[select.selectedIndex];
    const val = select.value;

    if (val === "custom") {
        customGroup.style.display = "block";
        unitInput.value = "";
        unitInput.readOnly = false;
        unitInput.style.background = "rgba(255,255,255,0.03)";
    } else if (val) {
        customGroup.style.display = "none";
        unitInput.value = selectedOption.getAttribute("data-unit") || "";
        unitInput.readOnly = true;
        unitInput.style.background = "rgba(255,255,255,0.05)";
    } else {
        customGroup.style.display = "none";
        unitInput.value = "";
        unitInput.readOnly = true;
    }
}

// Modal Item
function openItemModal() { 
    if(!currentCinemaId) return showToast("Vui lòng chọn cơ sở trước!", "error");
    document.getElementById("item_catalog").value = "";
    document.getElementById("item_unit").value = "";
    document.getElementById("initial_qty").value = "0";
    document.getElementById("custom-item-name-group").style.display = "none";
    document.getElementById("apply_to_all").checked = false;
    document.getElementById("itemModal").style.display = "flex"; 
}
function closeItemModal() { document.getElementById("itemModal").style.display = "none"; }

async function saveItem() {
    const catalogSelect = document.getElementById("item_catalog");
    const customName = document.getElementById("item_name").value.trim();
    const unit = document.getElementById("item_unit").value.trim();
    const initial_qty = document.getElementById("initial_qty").value || 0;
    const min_stock_level = document.getElementById("min_stock").value;
    const apply_to_all = document.getElementById("apply_to_all").checked;

    let item_name = catalogSelect.value === "custom" ? customName : catalogSelect.value;

    if(!item_name || !unit) return showToast("Vui lòng chọn hoặc nhập tên món!", "error");

    try {
        await API.post("/booking/admin/inventory/items", { 
            cinema_id: currentCinemaId,
            item_name, 
            unit, 
            initial_qty,
            min_stock_level,
            apply_to_all
        });
        showToast(apply_to_all ? `Đã tạo & nhập kho "${item_name}" cho tất cả rạp!` : "Đã thêm nguyên liệu và nhập kho.");
        closeItemModal();
        loadItems();
    } catch (err) { showToast(err.message, "error"); }
}

// Modal Import (KHO TỔNG)
function openImportModal() { 
    document.getElementById("import_item_catalog").value = "";
    document.getElementById("import_qty").value = "";
    document.getElementById("import_unit").value = "";
    document.getElementById("import_cost").value = "";
    document.getElementById("import_note").value = "";
    document.getElementById("importModal").style.display = "flex"; 
}

function onImportCatalogSelect() {
    const select = document.getElementById("import_item_catalog");
    const unitInput = document.getElementById("import_unit");
    const selectedOption = select.options[select.selectedIndex];
    unitInput.value = selectedOption.getAttribute("data-unit") || "";
}

function closeImportModal() { document.getElementById("importModal").style.display = "none"; }

async function executeImport() {
    const item_name = document.getElementById("import_item_catalog").value;
    const unit = document.getElementById("import_unit").value;
    const qty = document.getElementById("import_qty").value;
    const cost_price = document.getElementById("import_cost").value;
    const note = document.getElementById("import_note").value;

    if(!item_name || !qty) return showToast("Vui lòng chọn mặt hàng và số lượng!", "error");

    try {
        await API.post("/booking/admin/inventory/import-central", { 
            item_name, 
            unit, 
            qty: parseFloat(qty), 
            note 
        });
        showToast(`Đã nhập kho tổng: ${qty} ${unit} ${item_name}`);
        closeImportModal();
        const activeTab = document.querySelector(".tab-btn.active").innerText.toLowerCase();
        if(activeTab.includes("tổng kho")) loadCentralInventory();
    } catch (err) { showToast(err.message, "error"); }
}

// Modal Recipe
function openRecipeModal(combo_id, combo_name) {
    document.getElementById("recipe_modal_title").innerText = `Công thức: ${combo_name}`;
    document.getElementById("recipe_combo_id").value = combo_id;
    
    const list = document.getElementById("recipe-items-list");
    list.innerHTML = "";
    
    // Fill with existing ingredients
    const existing = allRecipes.filter(r => r.combo_id === combo_id);
    if(existing.length) {
        existing.forEach(ex => addIngredientRow(ex.item_id, ex.required_qty));
    } else {
        addIngredientRow();
    }
    
    document.getElementById("recipeModal").style.display = "flex";
}

function addIngredientRow(selectedId = '', qty = '') {
    const div = document.createElement("div");
    div.className = "ingredient-row";
    
    let displayQty = qty;
    if (selectedId) {
        const item = allItems.find(i => i.id == selectedId);
        if (item && item.item_name.includes("Coca-Cola")) {
            displayQty = parseFloat(qty) * 20000;
        }
    }

    div.innerHTML = `
        <div class="form-group" style="flex:2">
            <select class="form-control ing-item-id" onchange="onRecipeItemChange(this)">
                <option value="">-- Chọn --</option>
                ${allItems.map(i => `<option value="${i.id}" ${i.id == selectedId ? 'selected' : ''} data-unit="${i.unit}" data-name="${i.item_name}">${i.item_name} (${i.unit})</option>`).join("")}
            </select>
        </div>
        <div class="form-group" style="flex:1">
            <input type="number" class="form-control ing-qty" placeholder="SL" value="${displayQty}" step="0.0001">
            <small class="unit-hint" style="font-size:10px; color:var(--primary); display:block; margin-top:4px"></small>
        </div>
        <button class="action-btn delete" onclick="this.parentElement.remove()" style="margin-bottom:16px"><i class="fa-solid fa-trash"></i></button>
    `;
    document.getElementById("recipe-items-list").appendChild(div);
    if(selectedId) onRecipeItemChange(div.querySelector('.ing-item-id'));
}

function onRecipeItemChange(select) {
    const option = select.options[select.selectedIndex];
    const unitHint = select.parentElement.parentElement.querySelector('.unit-hint');
    const name = option.getAttribute('data-name') || '';
    if (name.includes("Coca-Cola")) {
        unitHint.innerText = "Nhập số ml pha chế";
    } else {
        unitHint.innerText = "";
    }
}

async function saveRecipe() {
    const combo_id = document.getElementById("recipe_combo_id").value;
    const rows = document.querySelectorAll(".ingredient-row");
    const ingredients = [];
    
    rows.forEach(row => {
        const select = row.querySelector(".ing-item-id");
        const item_id = select.value;
        let qty = parseFloat(row.querySelector(".ing-qty").value);
        const option = select.options[select.selectedIndex];
        const name = option.getAttribute('data-name') || '';

        if(item_id && !isNaN(qty)) {
            // Nếu nhập ml cho Coca, đổi về Thùng để lưu DB
            if (name.includes("Coca-Cola")) {
                qty = qty / 20000;
            }
            ingredients.push({ item_id, qty });
        }
    });

    try {
        await API.post("/booking/admin/inventory/recipes", { combo_id, ingredients });
        showToast("Cập nhật công thức thành công!");
        closeRecipeModal();
        loadRecipes();
    } catch (err) { showToast(err.message, "error"); }
}

function closeRecipeModal() { document.getElementById("recipeModal").style.display = "none"; }

async function deleteItem(id) {
    showConfirm("Xoá nguyên liệu này sẽ ảnh hưởng đến các công thức đang có. Bạn chắc chắn?", async () => {
        try {
            await API.delete(`/booking/admin/inventory/items/${id}`);
            showToast("Đã xoá nguyên liệu.");
            loadItems();
        } catch (err) { showToast(err.message, "error"); }
    });
}

// Modal: Điều chỉnh kho rạp con (Adjust Stock)
function openAdjustModal(itemId, itemName, unit, currentStock, cinemaName) {
    document.getElementById('adjust_item_id').value = itemId;
    document.getElementById('adjust_item_name').value = itemName;
    document.getElementById('adjust_cinema_name').value = cinemaName || 'Chưa xác định';
    document.getElementById('adjust_current_stock').value = currentStock + ' ' + unit;
    document.getElementById('adjust_unit').value = unit;
    document.getElementById('adjust_qty').value = '';
    document.getElementById('adjust_note').value = '';
    document.getElementById('adjustModal').style.display = 'flex';
}

function closeAdjustModal() { document.getElementById('adjustModal').style.display = 'none'; }

async function executeAdjust() {
    const item_id = document.getElementById('adjust_item_id').value;
    const qty = parseFloat(document.getElementById('adjust_qty').value);
    const note = document.getElementById('adjust_note').value.trim();

    if (!qty || isNaN(qty)) return showToast('Vui lòng nhập số lượng thay đổi!', 'error');
    if (!note) return showToast('Vui lòng nhập lý do điều chỉnh kho!', 'error');

    try {
        await API.post('/booking/admin/inventory/import', { item_id, qty, note });
        const action = qty > 0 ? `Đã nhập thêm ${qty}` : `Đã trừ ${Math.abs(qty)}`;
        showToast(`${action}. Lý do: ${note}`);
        closeAdjustModal();
        loadItems();
    } catch (err) {
        showToast('Lỗi: ' + err.message, 'error');
    }
}

document.addEventListener("DOMContentLoaded", () => {
    loadCinemas();
    loadCentralInventory();
});
</script>
