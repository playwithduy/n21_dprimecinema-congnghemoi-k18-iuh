const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const express = require("express");
const cors = require("cors");


const helmet = require("helmet");
const compression = require("compression");

const db = require("./config/db");
const app = express();

// Migration: Thêm cột seat_styles vào bảng rooms nếu chưa có
(async () => {
    try {
        const [columns] = await db.query("SHOW COLUMNS FROM rooms LIKE 'seat_styles'");
        if (columns.length === 0) {
            await db.query("ALTER TABLE rooms ADD COLUMN seat_styles JSON DEFAULT NULL");
            console.log("✅ Added seat_styles column to rooms table");
        }
    } catch (err) {
        console.error("Migration error:", err.message);
    }
})();

app.use(cors());
app.use(express.json());

const uploadPath = path.join(__dirname, "../uploads");

app.use("/uploads", express.static(uploadPath));

console.log("📁 Upload path:", uploadPath);

// Mount with explicit prefixes
app.use("/movies", require("./routes/movie.route"));
app.use("/showtimes", require("./routes/showtime.route"));
app.use("/uploads/actions", require("./routes/upload.route"));

// Thêm một route dự phòng để kiểm tra nếu cần
app.get("/health", (req, res) => res.json({ status: "ok" }));

const PORT = process.env.PORT || 3002;

app.listen(PORT, () => {
  console.log(`🎬 Movie service running on port ${PORT}`);
});