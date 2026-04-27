require("dotenv").config();
const mysql = require("mysql2/promise");
const slugify = require("slugify");

async function initDB() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "127.0.0.1",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "movie_db",
  });

  console.log("🚀 Initializing Blog Tables...");

  try {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS blog_posts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        summary TEXT,
        content LONGTEXT NOT NULL,
        image_url VARCHAR(255),
        author_id INT,
        author_name VARCHAR(100),
        views INT DEFAULT 0,
        category VARCHAR(50) DEFAULT 'Tin tức',
        status ENUM('draft', 'published') DEFAULT 'published',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    console.log("✅ Blog table created successfully!");

    // Add dummy data if empty
    const [rows] = await connection.query("SELECT COUNT(*) as count FROM blog_posts");
    if (rows[0].count === 0) {
      console.log("📝 Generating dummy data...");
      const dummyPosts = [
        {
          title: "Wicked: For Good - Nội dung, đánh giá, và lịch chiếu",
          summary: "Wicked - hiện tượng Broadway Musical về tình bạn và định mệnh, sắp trở lại với phần kết Wicked: For Good....",
          content: "Nội dung chi tiết của bài viết Wicked: For Good...",
          image_url: "https://homepage.momocdn.net/blogs/momo-amazont3-c25-241121102555637.jpg",
          author_name: "Admin D Prime",
          category: "Review",
          views: 388
        },
        {
          title: "Cần Biết Gì Về Avatar trước khi xem Avatar 2: Dòng Chảy Của Nước?",
          summary: "Avatar: Dòng Chảy Của Nước sắp chiếu lại trong một tuần duy nhất tại Việt Nam từ 03/10/2025! Bài tóm tắt...",
          content: "Nội dung chi tiết của bài viết Avatar 2...",
          image_url: "https://homepage.momocdn.net/blogs/momo-amazont3-c20-220914101511631.jpg",
          author_name: "Admin D Prime",
          category: "Tin tức",
          views: 910
        },
        {
          title: "Phim chiếu rạp 2025 đáng mong đợi dành cho fan cine",
          summary: "Cùng MoMo điểm qua nhanh những cái tên sẽ làm mưa làm gió trong năm 2025 với các tác phẩm điện ảnh nổ...",
          content: "Nội dung chi tiết của bài viết Phim 2025...",
          image_url: "https://homepage.momocdn.net/blogs/momo-amazont3-c25-241125095522637.jpg",
          author_name: "Admin D Prime",
          category: "Tin tức",
          views: 30400
        },
        {
          title: "Giới thiệu về Bộ Huy hiệu Đánh giá Phim: Điểm càng cao, phim càng đỉnh!",
          summary: "Với hơn 30.000 lượt đánh giá chân thực từ người dùng cho mỗi phim, MoMo hứa hẹn trở thành nơi \"review phim\" đáng tin cậy. Cùng tìm hiểu về...",
          content: "Nội dung chi tiết của bài viết Huy hiệu...",
          image_url: "https://homepage.momocdn.net/blogs/momo-amazont3-c23-230522101544634.jpg",
          author_name: "Admin D Prime",
          category: "Hướng dẫn",
          views: 4100000
        }
      ];

      for (const p of dummyPosts) {
        const slug = slugify(p.title, { lower: true, strict: true });
        await connection.query(
          `INSERT INTO blog_posts (title, slug, summary, content, image_url, author_name, category, views) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [p.title, slug, p.summary, p.content, p.image_url, p.author_name, p.category, p.views]
        );
      }
      console.log("✅ Dummy data added!");
    }

  } catch (err) {
    console.error("❌ Error initializing database:", err);
  } finally {
    await connection.end();
  }
}

initDB();
