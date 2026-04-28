const db = require("../config/db");

// Gửi yêu cầu đổi quà
exports.createExchange = async (req, res) => {
    console.log("DEBUG: req.user content ->", req.user);
    const user_id = req.user.id || req.user.user_id || req.user.userId;
    const { item_id, item_name, points_spent, delivery_method, pickup_cinema, ship_info } = req.body;

    if (!user_id) {
        console.error("❌ createExchange ERROR: No user_id found in token!");
        return res.status(401).json({ success: false, message: "Không tìm thấy thông tin người dùng trong Token" });
    }

    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();

        // 2. Trừ điểm người dùng (ở database auth_db)
        const [updateResult] = await conn.query(
            "UPDATE auth_db.users SET reward_points = reward_points - ? WHERE id = ? AND reward_points >= ?",
            [points_spent, user_id, points_spent]
        );

        if (updateResult.affectedRows === 0) {
            throw new Error("Không đủ điểm thưởng hoặc người dùng không tồn tại");
        }

        // 3. Tạo bản ghi đổi quà
        const [result] = await conn.query(`
            INSERT INTO reward_exchanges 
            (user_id, item_id, item_name, points_spent, delivery_method, pickup_cinema, ship_name, ship_phone, ship_email, ship_address, qr_code)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            user_id, item_id, item_name, points_spent, delivery_method, 
            pickup_cinema || null,
            ship_info?.name || null,
            ship_info?.phone || null,
            ship_info?.email || null,
            ship_info?.address || null,
            delivery_method === 'cinema' ? `QR-${Date.now()}-${user_id}` : null
        ]);

        await conn.commit();
        res.json({ success: true, message: "Đổi quà thành công!", exchange_id: result.insertId });

    } catch (err) {
        await conn.rollback();
        console.error("❌ createExchange ERROR:", err);
        res.status(500).json({ success: false, error: err.message });
    } finally {
        conn.release();
    }
};

// Admin: Lấy danh sách yêu cầu đổi quà
exports.getAdminExchanges = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT * FROM reward_exchanges ORDER BY created_at DESC
        `);
        res.json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// Admin: Cập nhật trạng thái
exports.updateExchangeStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        await db.query("UPDATE reward_exchanges SET status = ? WHERE id = ?", [status, id]);
        res.json({ success: true, message: "Cập nhật trạng thái thành công!" });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
