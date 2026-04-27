require("dotenv").config();
const mysql = require("mysql2/promise");

async function initDB() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "127.0.0.1",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "movie_db",
  });

  console.log("🚀 Initializing Forum Tables...");

  try {
    // 1. forum_posts
    await connection.query(`
      CREATE TABLE IF NOT EXISTS forum_posts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        username VARCHAR(100),
        avatar VARCHAR(255),
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        movie_id INT,
        movie_title VARCHAR(255),
        type ENUM('review','discussion','news') DEFAULT 'review',
        rating TINYINT DEFAULT NULL,
        likes INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 2. forum_comments
    await connection.query(`
      CREATE TABLE IF NOT EXISTS forum_comments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        post_id INT NOT NULL,
        user_id INT NOT NULL,
        username VARCHAR(100),
        avatar VARCHAR(255),
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX (post_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 3. forum_likes
    await connection.query(`
      CREATE TABLE IF NOT EXISTS forum_likes (
        user_id INT NOT NULL,
        post_id INT NOT NULL,
        PRIMARY KEY (user_id, post_id),
        INDEX (post_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    console.log("✅ Forum tables created successfully!");
  } catch (err) {
    console.error("❌ Error creating forum tables:", err);
  } finally {
    await connection.end();
  }
}

initDB();
