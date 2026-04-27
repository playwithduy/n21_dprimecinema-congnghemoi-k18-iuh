const db = require("../config/db");

// ================= MASTER COUPON METHODS =================
exports.findMasterByCode = async (code) => {
    const [rows] = await db.query(
        "SELECT * FROM coupons_master WHERE code = ? AND is_active = TRUE LIMIT 1",
        [code]
    );
    return rows[0];
};

// ================= USER COUPON METHODS =================
exports.checkUserClaimed = async (userId, code) => {
    const [rows] = await db.query(
        "SELECT * FROM user_coupons WHERE user_id = ? AND code = ? LIMIT 1",
        [userId, code]
    );
    return rows[0];
};

exports.claimCoupon = async (data) => {
    const { user_id, code, name, expiry_date } = data;
    const [result] = await db.query(
        `INSERT INTO user_coupons (user_id, code, name, expiry_date) 
         VALUES (?, ?, ?, ?)`,
        [user_id, code, name, expiry_date]
    );
    return result;
};

exports.getByUserId = async (userId) => {
    const [rows] = await db.query(
        "SELECT * FROM user_coupons WHERE user_id = ? ORDER BY registered_at DESC",
        [userId]
    );
    return rows;
};

exports.findUserCouponWithDiscount = async (userId, code) => {
    const [rows] = await db.query(
        `SELECT uc.*, cm.discount_value 
         FROM user_coupons uc
         JOIN coupons_master cm ON uc.code = cm.code
         WHERE uc.user_id = ? AND uc.code = ? 
         AND uc.status = 'active'
         AND uc.expiry_date > NOW()
         LIMIT 1`,
        [userId, code]
    );
    return rows[0];
};
