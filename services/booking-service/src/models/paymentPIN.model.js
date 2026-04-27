const db = require("../config/db");

// ================= GET BY USER ID =================
exports.getByUserId = async (userId) => {
    const [rows] = await db.query(
        "SELECT * FROM payment_codes WHERE user_id = ? LIMIT 1",
        [userId]
    );
    return rows[0];
};

// ================= SET/UPDATE PIN =================
exports.setPIN = async (userId, pinHash) => {
    const [result] = await db.query(
        `INSERT INTO payment_codes (user_id, pin_hash) 
         VALUES (?, ?)
         ON DUPLICATE KEY UPDATE pin_hash = ?`,
        [userId, pinHash, pinHash]
    );
    return result;
};
