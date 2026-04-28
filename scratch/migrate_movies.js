const mysql = require("mysql2/promise");
async function migrate() {
    const connection = await mysql.createConnection({
        host: "127.0.0.1",
        user: "root",
        password: "root_password",
        database: "movie_db",
        port: 3306
    });
    try {
        console.log("Adding seat_styles column to movies table...");
        await connection.query("ALTER TABLE movies ADD COLUMN IF NOT EXISTS seat_styles TEXT DEFAULT NULL");
        console.log("Success!");
    } catch (err) {
        if (err.code === 'ER_DUP_FIELDNAME') {
            console.log("Column already exists.");
        } else {
            console.error("Migration failed:", err.message);
        }
    } finally {
        await connection.end();
    }
}
migrate();
