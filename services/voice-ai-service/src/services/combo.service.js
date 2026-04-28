const pool = require("../config/db");

// ===================================================================
// Combo Service — Quản lý thông tin bắp nước
// ===================================================================

/**
 * Lấy danh sách tất cả các combo đang kinh doanh
 */
exports.findAllCombos = async () => {
    try {
        const [rows] = await pool.query("SELECT * FROM booking_db.combos ORDER BY price ASC");
        return rows;
    } catch (err) {
        console.error("Error finding combos:", err);
        return [];
    }
};

/**
 * Lấy danh sách combo kèm giá đặc biệt theo suất chiếu (nếu có)
 */
exports.findCombosByShowtime = async (showtimeId) => {
    try {
        // Query lấy combo và ưu tiên giá từ bảng combo_prices nếu có
        const query = `
            SELECT 
                c.id, 
                c.name, 
                c.description, 
                COALESCE(cp.price, c.price) as price, 
                c.image
            FROM booking_db.combos c
            LEFT JOIN booking_db.combo_prices cp ON c.id = cp.combo_id AND cp.showtime_id = ?
            ORDER BY price ASC
        `;
        const [rows] = await pool.query(query, [showtimeId]);
        return rows;
    } catch (err) {
        console.error("Error finding combos by showtime:", err);
        return [];
    }
};

/**
 * Tìm combo theo tên hoặc từ khóa
 */
exports.findComboByName = async (name) => {
    try {
        const [rows] = await pool.query(
            "SELECT * FROM booking_db.combos WHERE name LIKE ? OR description LIKE ? LIMIT 1",
            [`%${name}%`, `%${name}%`]
        );
        return rows[0] || null;
    } catch (err) {
        console.error("Error finding combo by name:", err);
        return null;
    }
};
