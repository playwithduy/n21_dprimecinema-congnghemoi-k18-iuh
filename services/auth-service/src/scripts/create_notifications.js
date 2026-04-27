const mysql = require('mysql2/promise');

async function run() {
  const conn = await mysql.createConnection({
    host: '127.0.0.1', user: 'root', password: '', database: 'auth_db'
  });
  
  await conn.query(`
    CREATE TABLE IF NOT EXISTS notifications (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      body TEXT NOT NULL,
      target_type ENUM('all', 'admin', 'user') DEFAULT 'all',
      sent_by INT,
      reach_count INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log('Table notifications created!');
  process.exit();
}

run().catch(e => { console.log('Error:', e.message); process.exit(1); });
