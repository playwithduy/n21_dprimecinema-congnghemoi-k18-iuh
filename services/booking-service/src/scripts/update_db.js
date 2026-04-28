const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../../.env") });
const db = require("../config/db");

// Helper: Thêm cột nếu chưa tồn tại (tương thích MySQL 8.0)
async function addColumnIfNotExists(database, table, column, definition) {
    const [rows] = await db.query(
        `SELECT COUNT(*) as cnt FROM information_schema.COLUMNS 
         WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
        [database, table, column]
    );
    if (rows[0].cnt === 0) {
        await db.query(`ALTER TABLE \`${database}\`.\`${table}\` ADD COLUMN \`${column}\` ${definition}`);
        console.log(`      + Added column: ${database}.${table}.${column}`);
    } else {
        console.log(`      ✓ Column exists: ${database}.${table}.${column}`);
    }
}

(async () => {
    try {
        console.log("🚀 DPrime Cinema - Database Schema Upgrade Script (MySQL 8.0)");
        console.log("=".repeat(60));

        // ──────────────────────────────────────────────
        // 1. auth_db.users: Bổ sung cột thành viên & tích điểm
        // ──────────────────────────────────────────────
        console.log("\n📌 [1/7] Upgrading auth_db.users (membership columns)...");
        await addColumnIfNotExists("auth_db", "users", "reward_points", "INT DEFAULT 0");
        await addColumnIfNotExists("auth_db", "users", "total_spending", "DECIMAL(15,2) DEFAULT 0.00");
        await addColumnIfNotExists("auth_db", "users", "membership_rank", "VARCHAR(50) DEFAULT 'Đồng'");
        await addColumnIfNotExists("auth_db", "users", "first_transaction_date", "DATETIME DEFAULT NULL");
        await addColumnIfNotExists("auth_db", "users", "last_transaction_date", "DATETIME DEFAULT NULL");
        console.log("   ✅ auth_db.users upgraded.");

        // ──────────────────────────────────────────────
        // 2. booking_db.bookings: Bổ sung cột coupon
        // ──────────────────────────────────────────────
        console.log("\n📌 [2/7] Upgrading booking_db.bookings (coupon columns)...");
        await addColumnIfNotExists("booking_db", "bookings", "coupon_code", "VARCHAR(50) DEFAULT NULL");
        await addColumnIfNotExists("booking_db", "bookings", "discount_amount", "DECIMAL(10,2) DEFAULT 0");
        console.log("   ✅ booking_db.bookings upgraded.");

        // ──────────────────────────────────────────────
        // 3. booking_db.tickets: Bổ sung cột QR & check-in
        // ──────────────────────────────────────────────
        console.log("\n📌 [3/7] Upgrading booking_db.tickets (QR & check-in columns)...");
        await addColumnIfNotExists("booking_db", "tickets", "user_id", "INT DEFAULT NULL");
        await addColumnIfNotExists("booking_db", "tickets", "qr_hash", "VARCHAR(255) DEFAULT ''");
        await addColumnIfNotExists("booking_db", "tickets", "checkin_time", "DATETIME DEFAULT NULL");
        console.log("   ✅ booking_db.tickets upgraded.");

        // ──────────────────────────────────────────────
        // 4. booking_db.reward_exchanges
        // ──────────────────────────────────────────────
        console.log("\n📌 [4/7] Creating booking_db.reward_exchanges...");
        await db.query(`
            CREATE TABLE IF NOT EXISTS booking_db.reward_exchanges (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                item_id INT NOT NULL,
                item_name VARCHAR(255) NOT NULL,
                points_spent INT NOT NULL,
                delivery_method VARCHAR(50) NOT NULL,
                pickup_cinema VARCHAR(255) DEFAULT NULL,
                ship_name VARCHAR(255) DEFAULT NULL,
                ship_phone VARCHAR(50) DEFAULT NULL,
                ship_email VARCHAR(255) DEFAULT NULL,
                ship_address TEXT DEFAULT NULL,
                qr_code VARCHAR(255) DEFAULT NULL,
                status VARCHAR(50) DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                KEY idx_user_reward (user_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        `);
        console.log("   ✅ reward_exchanges created/verified.");

        // ──────────────────────────────────────────────
        // 5. booking_db.central_inventory
        // ──────────────────────────────────────────────
        console.log("\n📌 [5/7] Creating booking_db.central_inventory...");
        await db.query(`
            CREATE TABLE IF NOT EXISTS booking_db.central_inventory (
                item_name VARCHAR(255) NOT NULL PRIMARY KEY,
                unit VARCHAR(50) NOT NULL,
                current_stock DECIMAL(10,2) DEFAULT 0.00
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        `);
        console.log("   ✅ central_inventory created/verified.");

        // ──────────────────────────────────────────────
        // 6. booking_db.inventory_items + inventory_logs
        // ──────────────────────────────────────────────
        console.log("\n📌 [6/7] Creating booking_db.inventory_items & inventory_logs...");
        await db.query(`
            CREATE TABLE IF NOT EXISTS booking_db.inventory_items (
                id INT AUTO_INCREMENT PRIMARY KEY,
                cinema_id INT NOT NULL,
                item_name VARCHAR(255) NOT NULL,
                unit VARCHAR(50) NOT NULL,
                current_stock DECIMAL(10,2) DEFAULT 0.00,
                min_stock_level DECIMAL(10,2) DEFAULT 10.00,
                cost_price DECIMAL(10,2) DEFAULT 0.00,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                UNIQUE KEY uq_cinema_item (cinema_id, item_name),
                KEY idx_cinema_inventory (cinema_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        `);
        // Bổ sung cột cost_price và cinema_id nếu bảng đã tồn tại từ migration cũ
        await addColumnIfNotExists("booking_db", "inventory_items", "cost_price", "DECIMAL(10,2) DEFAULT 0.00");
        await addColumnIfNotExists("booking_db", "inventory_items", "cinema_id", "INT NOT NULL DEFAULT 0");

        await db.query(`
            CREATE TABLE IF NOT EXISTS booking_db.inventory_logs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                item_id INT NOT NULL,
                cinema_id INT NOT NULL DEFAULT 0,
                created_by VARCHAR(255) NOT NULL DEFAULT 'system',
                change_qty DECIMAL(10,2) NOT NULL,
                type ENUM('import', 'export', 'adjustment') NOT NULL,
                note TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                KEY idx_log_item (item_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        `);
        // Bổ sung cột cinema_id và created_by nếu bảng đã tồn tại từ migration cũ
        await addColumnIfNotExists("booking_db", "inventory_logs", "cinema_id", "INT NOT NULL DEFAULT 0");
        await addColumnIfNotExists("booking_db", "inventory_logs", "created_by", "VARCHAR(255) NOT NULL DEFAULT 'system'");
        console.log("   ✅ inventory_items & inventory_logs created/verified.");

        // ──────────────────────────────────────────────
        // 7. booking_db.combo_ingredients
        // ──────────────────────────────────────────────
        console.log("\n📌 [7/7] Creating booking_db.combo_ingredients...");
        await db.query(`
            CREATE TABLE IF NOT EXISTS booking_db.combo_ingredients (
                id INT AUTO_INCREMENT PRIMARY KEY,
                combo_id INT NOT NULL,
                item_id INT NOT NULL,
                required_qty DECIMAL(10,2) NOT NULL,
                KEY idx_ingredient_combo (combo_id),
                KEY idx_ingredient_item (item_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        `);
        console.log("   ✅ combo_ingredients created/verified.");

        console.log("\n" + "=".repeat(60));
        console.log("🎉 Database schema upgrade completed successfully!");
        process.exit(0);
    } catch (err) {
        console.error("\n❌ Upgrade failed:", err.message);
        process.exit(1);
    }
})();
