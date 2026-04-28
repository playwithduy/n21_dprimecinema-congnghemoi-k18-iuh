const db = require("../config/db");

// 1. Lấy danh sách rạp
exports.getCinemas = async (req, res) => {
    try {
        const [rows] = await db.query("SELECT id, name FROM movie_db.cinemas ORDER BY id ASC");
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: "Lỗi khi lấy danh sách rạp: " + err.message });
    }
};

// 1.1 Lấy tồn kho TỔNG
exports.getCentralInventory = async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM central_inventory ORDER BY item_name ASC");
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: "Lỗi lấy kho tổng: " + err.message });
    }
};

// 1.2 Nhập hàng vào KHO TỔNG
exports.importToCentral = async (req, res) => {
    try {
        const { item_name, unit, qty, note } = req.body;
        const adminName = req.user.fullname || req.user.email || "Admin";

        await db.query(`
            INSERT INTO central_inventory (item_name, unit, current_stock) 
            VALUES (?, ?, ?) 
            ON DUPLICATE KEY UPDATE current_stock = current_stock + ?, unit = ?
        `, [item_name, unit, qty, qty, unit]);

        res.json({ message: `Đã nhập ${qty} ${unit} "${item_name}" vào kho tổng.` });
    } catch (err) {
        res.status(500).json({ message: "Lỗi nhập kho tổng: " + err.message });
    }
};

// 2. Lấy danh sách nguyên liệu (có lọc theo rạp hoặc lấy tất cả)
exports.getInventoryItems = async (req, res) => {
    try {
        const { cinema_id } = req.query;
        let query = `
            SELECT ii.*, c.name as cinema_name 
            FROM inventory_items ii
            JOIN movie_db.cinemas c ON ii.cinema_id = c.id
        `;
        let params = [];
        
        if (cinema_id && cinema_id !== 'all') {
            query += " WHERE ii.cinema_id = ?";
            params.push(cinema_id);
        }
        
        query += " ORDER BY c.id ASC, ii.item_name ASC";
        const [rows] = await db.query(query, params);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: "Lỗi khi lấy danh sách kho: " + err.message });
    }
};

// 3. Thêm nguyên liệu cho rạp (LẤY TỪ KHO TỔNG)
exports.createItem = async (req, res) => {
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();
        const { cinema_id, item_name, unit, min_stock_level, initial_qty, apply_to_all } = req.body;
        const qty = parseFloat(initial_qty) || 0;
        const adminName = req.user.fullname || req.user.email || "Admin";
        
        // Kiểm tra tồn kho tổng trước
        const [[central]] = await conn.query("SELECT current_stock FROM central_inventory WHERE item_name = ?", [item_name]);
        const totalNeeded = apply_to_all ? (qty * 6) : qty; 

        if (qty > 0) {
            if (!central || central.current_stock < totalNeeded) {
                throw new Error(`Kho tổng không đủ hàng cho món "${item_name}". Hiện còn: ${central ? central.current_stock : 0} ${unit}`);
            }
            // Trừ kho tổng
            await conn.query("UPDATE central_inventory SET current_stock = current_stock - ? WHERE item_name = ?", [totalNeeded, item_name]);
        }

        if (apply_to_all) {
            const [cinemas] = await db.query("SELECT id FROM movie_db.cinemas");
            for (const cinema of cinemas) {
                const [result] = await conn.query(
                    "INSERT INTO inventory_items (cinema_id, item_name, unit, current_stock, min_stock_level) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE current_stock = current_stock + ?",
                    [cinema.id, item_name, unit, qty, min_stock_level || 10, qty]
                );

                if (qty > 0) {
                    await conn.query(
                        "INSERT INTO inventory_logs (item_id, cinema_id, created_by, change_qty, type, note) VALUES (?, ?, ?, ?, 'import', ?)",
                        [result.insertId || 0, cinema.id, adminName, qty, "Cấp hàng từ kho tổng"]
                    );
                }
            }
            await conn.commit();
            return res.status(201).json({ message: `Đã cấp "${item_name}" từ kho tổng cho tất cả các rạp.` });
        } else {
            if (!cinema_id || cinema_id === 'all') throw new Error("Vui lòng chọn 1 cơ sở cụ thể!");
            
            const [result] = await conn.query(
                "INSERT INTO inventory_items (cinema_id, item_name, unit, current_stock, min_stock_level) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE current_stock = current_stock + ?",
                [cinema_id, item_name, unit, qty, min_stock_level || 10, qty]
            );

            if (qty > 0) {
                await conn.query(
                    "INSERT INTO inventory_logs (item_id, cinema_id, created_by, change_qty, type, note) VALUES (?, ?, ?, ?, 'import', ?)",
                    [result.insertId || 0, cinema_id, adminName, qty, "Cấp hàng từ kho tổng"]
                );
            }
            
            await conn.commit();
            res.status(201).json({ message: "Đã cấp hàng từ kho tổng về rạp thành công" });
        }
    } catch (err) {
        await conn.rollback();
        res.status(500).json({ message: "Lỗi: " + err.message });
    } finally {
        conn.release();
    }
};

// 4. Nhập hàng (Import Stock)
exports.importStock = async (req, res) => {
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();
        const { item_id, qty, note } = req.body;
        const adminName = req.user.fullname || req.user.email || "Admin";

        // Lấy thông tin cinema_id của item này
        const [[item]] = await conn.query("SELECT cinema_id FROM inventory_items WHERE id = ?", [item_id]);
        if (!item) throw new Error("Không tìm thấy nguyên liệu");

        // Cập nhật số lượng tồn
        await conn.query(
            "UPDATE inventory_items SET current_stock = current_stock + ? WHERE id = ?",
            [qty, item_id]
        );

        // Lưu log (kèm cinema_id và người thực hiện)
        await conn.query(
            "INSERT INTO inventory_logs (item_id, cinema_id, created_by, change_qty, type, note) VALUES (?, ?, ?, ?, 'import', ?)",
            [item_id, item.cinema_id, adminName, qty, note || "Nhập hàng định kỳ"]
        );

        await conn.commit();
        res.json({ message: "Nhập hàng thành công" });
    } catch (err) {
        await conn.rollback();
        res.status(500).json({ message: "Lỗi khi nhập hàng: " + err.message });
    } finally {
        conn.release();
    }
};

// 5. Lấy công thức của các combo (Công thức là chung cho toàn hệ thống)
exports.getRecipes = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT cr.*, c.name as combo_name, ii.item_name, ii.unit
            FROM combo_ingredients cr
            JOIN combos c ON cr.combo_id = c.id
            JOIN inventory_items ii ON cr.item_id = ii.id
            GROUP BY cr.id
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: "Lỗi khi lấy công thức: " + err.message });
    }
};

// 6. Cập nhật công thức cho combo
exports.updateRecipe = async (req, res) => {
    try {
        const { combo_id, ingredients } = req.body;
        await db.query("DELETE FROM combo_ingredients WHERE combo_id = ?", [combo_id]);

        if (ingredients && ingredients.length > 0) {
            const values = ingredients.map(ing => [combo_id, ing.item_id, ing.qty]);
            await db.query(
                "INSERT INTO combo_ingredients (combo_id, item_id, required_qty) VALUES ?",
                [values]
            );
        }
        res.json({ message: "Cập nhật công thức thành công" });
    } catch (err) {
        res.status(500).json({ message: "Lỗi khi cập nhật công thức: " + err.message });
    }
};

// 7. Lịch sử kho theo rạp
exports.getInventoryLogs = async (req, res) => {
    try {
        const { cinema_id } = req.query;
        let query = `
            SELECT il.*, ii.item_name, ii.unit, c.name as cinema_name
            FROM inventory_logs il
            JOIN inventory_items ii ON il.item_id = ii.id
            JOIN movie_db.cinemas c ON il.cinema_id = c.id
        `;
        let params = [];

        if (cinema_id) {
            query += " WHERE il.cinema_id = ?";
            params.push(cinema_id);
        }

        query += " ORDER BY il.created_at DESC LIMIT 100";
        const [rows] = await db.query(query, params);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: "Lỗi khi lấy lịch sử kho: " + err.message });
    }
};

// 8. Xoá nguyên liệu
exports.deleteItem = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query("DELETE FROM inventory_items WHERE id = ?", [id]);
        res.json({ message: "Đã xoá nguyên liệu" });
    } catch (err) {
        res.status(500).json({ message: "Lỗi khi xoá: " + err.message });
    }
};

// 9. Báo cáo COGS (Chi phí & Lợi nhuận)
exports.getCOGSReport = async (req, res) => {
    try {
        const { cinema_id } = req.query;
        
        // 1. Tính chi phí nguyên liệu đã tiêu thụ (từ logs type='export')
        let costQuery = `
            SELECT ii.item_name, ii.unit, ii.cost_price, 
                   SUM(ABS(il.change_qty)) as total_consumed,
                   SUM(ABS(il.change_qty) * ii.cost_price) as total_cost
            FROM inventory_logs il
            JOIN inventory_items ii ON il.item_id = ii.id
            WHERE il.type = 'export'
        `;
        let params = [];
        if (cinema_id && cinema_id !== 'all') {
            costQuery += " AND il.cinema_id = ?";
            params.push(cinema_id);
        }
        costQuery += " GROUP BY ii.item_name, ii.unit, ii.cost_price";
        
        const [costDetails] = await db.query(costQuery, params);
        const totalCost = costDetails.reduce((sum, item) => sum + parseFloat(item.total_cost || 0), 0);

        // 2. Tính doanh thu từ Combo (từ booking_combos)
        let revenueQuery = `
            SELECT SUM(bc.total_price) as total_revenue
            FROM booking_combos bc
            JOIN bookings b ON bc.booking_id = b.id
            JOIN movie_db.showtimes s ON b.showtime_id = s.id
            WHERE b.payment_status = 'paid'
        `;
        let revParams = [];
        if (cinema_id && cinema_id !== 'all') {
            revenueQuery += " AND s.cinema_id = ?";
            revParams.push(cinema_id);
        }
        
        const [[revResult]] = await db.query(revenueQuery, revParams);
        const totalRevenue = parseFloat(revResult.total_revenue || 0);

        res.json({
            total_cost: totalCost,
            total_revenue: totalRevenue,
            net_profit: totalRevenue - totalCost,
            details: costDetails
        });
    } catch (err) {
        res.status(500).json({ message: "Lỗi báo cáo: " + err.message });
    }
};
