const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
dotenv.config();

(async () => {
  try {
    const db = await mysql.createConnection({
      host: '127.0.0.1',
      user: 'root',
      password: '',
      database: 'movie_db'
    });

    console.log("🔍 Testing cross-db query...");
    const [rows] = await db.query(`SELECT id, name, price FROM booking_db.combos ORDER BY name`);
    console.log("✅ Results:", rows);
    
    process.exit(0);
  } catch (err) {
    console.error("❌ SQL ERROR:", err.message);
    process.exit(1);
  }
})();
