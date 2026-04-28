const mysql = require("mysql2/promise");

// ===================================================================
// Database Connection — Cấu hình kết nối bền bỉ
// ===================================================================

const dbConfig = {
    host: process.env.DB_HOST || "db-main",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "root_password",
    database: process.env.DB_NAME_MOVIE || "movie_db",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 10000 // 10 giây timeout
};

const pool = mysql.createPool(dbConfig);

// Test kết nối ngay khi load module
pool.getConnection()
    .then(conn => {
        console.log("✅ [DB] Initial connection pool established");
        conn.release();
    })
    .catch(err => {
        console.error("❌ [DB] Error creating pool:", err.message);
    });

module.exports = pool;
