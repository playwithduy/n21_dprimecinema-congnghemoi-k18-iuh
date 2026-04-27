// LOAD ENV (BẮT BUỘC)
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const express = require("express");
const cors = require("cors");

const helmet = require("helmet");

const compression = require("compression");

const app = express();

// ===== MIDDLEWARE =====
app.use(cors());
app.use(express.json());

// 🔥 SERVE STATIC AVATAR (BẮT BUỘC)
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
app.use("/auth/uploads", express.static(path.join(__dirname, "../uploads")));

// ===== ROUTES =====
app.use("/", require("./routes/auth.route"));

// ===== HEALTH CHECK =====
app.get("/", (req, res) => {
  res.json({ message: "Auth Service OK" });
});

// ===== START SERVER =====
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`✅ Auth Service running on port ${PORT}`);
  console.log("DB:", process.env.DB_NAME);
});