const mysql = require('mysql2/promise');
require('dotenv').config({ path: 'e:/N25_CNM_DPRIME/services/booking-service/.env' });

async function check() {
    const db = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'movie_db'
    });

    const [rows] = await db.query("SELECT booking_code, payment_status, payment_note FROM bookings ORDER BY created_at DESC LIMIT 5");
    console.table(rows);
    await db.end();
}

check();
