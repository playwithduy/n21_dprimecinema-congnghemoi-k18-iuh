const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Try to find .env
let envPath = path.join(__dirname, '..', 'services', 'booking-service', '.env');
if (!fs.existsSync(envPath)) {
    envPath = path.join(process.cwd(), '.env');
}

require('dotenv').config({ path: envPath });

async function migrate() {
    console.log("Using DB_HOST:", process.env.DB_HOST || '127.0.0.1');
    const db = await mysql.createConnection({
        host: process.env.DB_HOST || '127.0.0.1',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '123456',
        database: 'booking_db',
        multipleStatements: true
    });

    const sql = `
    -- Kho tổng lưu tên nguyên liệu, đơn vị tính và số lượng tồn tổng
    CREATE TABLE IF NOT EXISTS central_inventory (
        item_name VARCHAR(255) PRIMARY KEY,
        unit VARCHAR(50) NOT NULL,
        current_stock DECIMAL(10,2) DEFAULT 0.00
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    -- Tồn kho chi tiết tại từng rạp (có cinema_id và cost_price)
    CREATE TABLE IF NOT EXISTS inventory_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        cinema_id INT NOT NULL,
        item_name VARCHAR(255) NOT NULL,
        unit VARCHAR(50) NOT NULL,
        current_stock DECIMAL(10,2) DEFAULT 0.00,
        min_stock_level DECIMAL(10,2) DEFAULT 10.00,
        cost_price DECIMAL(10,2) DEFAULT 0.00,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uq_cinema_item (cinema_id, item_name)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    -- Nhật ký xuất/nhập/điều chỉnh kho hàng (có cinema_id và created_by)
    CREATE TABLE IF NOT EXISTS inventory_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        item_id INT NOT NULL,
        cinema_id INT NOT NULL,
        created_by VARCHAR(255) NOT NULL DEFAULT 'system',
        change_qty DECIMAL(10,2) NOT NULL,
        type ENUM('import', 'export', 'adjustment') NOT NULL,
        note TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (item_id) REFERENCES inventory_items(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    -- Định mức nguyên liệu cho từng Combo (Công thức pha chế/đóng gói)
    CREATE TABLE IF NOT EXISTS combo_ingredients (
        id INT AUTO_INCREMENT PRIMARY KEY,
        combo_id INT NOT NULL,
        item_id INT NOT NULL,
        required_qty DECIMAL(10,2) NOT NULL,
        FOREIGN KEY (item_id) REFERENCES inventory_items(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    -- Bảng đổi quà thưởng
    CREATE TABLE IF NOT EXISTS reward_exchanges (
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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `;

    try {
        await db.query(sql);
        console.log("✅ Migration successful - All inventory & reward tables created/verified.");
    } catch (err) {
        console.error("❌ Migration failed:", err);
    } finally {
        await db.end();
    }
}

migrate();
