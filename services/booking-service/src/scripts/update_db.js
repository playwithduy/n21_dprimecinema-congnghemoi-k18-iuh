const db = require("../config/db");

(async () => {
    try {
        console.log("🚀 Updating bookings table...");
        await db.query("ALTER TABLE bookings ADD COLUMN IF NOT EXISTS coupon_code VARCHAR(50) DEFAULT NULL");
        await db.query("ALTER TABLE bookings ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10,2) DEFAULT 0");
        console.log("✅ Bookings table updated successfully!");
        process.exit(0);
    } catch (err) {
        console.error("❌ Update failed:", err.message);
        process.exit(1);
    }
})();
