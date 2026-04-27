require("dotenv").config();
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const helmet = require("helmet");
const compression = require("compression");

const app = express();
const PORT = process.env.PORT || 5556;

app.use(cors());
app.use(express.json());

// CONFIG MULTER - LƯU TRỰC TIẾP VÀO FRONTEND ASSETS
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, "../../../frontend/public/assets/images/blog");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// Routes
// Inject upload middleware into the router or handle it here
const blogRoutes = require("./routes/blog.route");
app.use("/", (req, res, next) => {
    req.upload = upload; // Pass upload middleware to routes if needed
    next();
}, blogRoutes);

app.listen(PORT, () => {
  console.log(`🎬 Blog service running on port ${PORT}`);
});
