const mysql = require("./node_modules/mysql2/promise");

async function check() {
  const pool = mysql.createPool({
    host: "127.0.0.1",
    user: "root",
    password: "",
    database: "movie_db",
    port: 3306
  });

  try {
    const tables = ['showtimes', 'movies', 'rooms'];
    for (const table of tables) {
      console.log(`--- ${table.toUpperCase()} ---`);
      const [cols] = await pool.query(`DESCRIBE ${table}`);
      cols.forEach(c => {
        console.log(`${c.Field} - ${c.Type}`);
      });
    }
  } catch (err) {
    console.error("ERROR:", err.message);
  } finally {
    await pool.end();
  }
}

check();
