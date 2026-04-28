const mysql = require("mysql2/promise");

async function check() {
  const pool = mysql.createPool({
    host: "127.0.0.1",
    user: "root",
    password: "root_password", // let's try root_password if root doesn't work, or check env
    database: "movie_db",
    port: 3306
  });

  try {
    const [rows] = await pool.query("SELECT id, title, release_date, end_date, status FROM movies");
    console.log(JSON.stringify(rows, null, 2));
  } catch (err) {
    console.error("DB Query error:", err.message);
  } finally {
    await pool.end();
  }
}

check();
