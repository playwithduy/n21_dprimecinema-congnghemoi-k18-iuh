const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/blog.controller");
const { requireAdmin } = require("../middleware/auth");
const multer = require("multer");
const path = require("path");

// Tái định nghĩa storage trong route để dễ truy cập
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, "../../../../frontend/public/assets/images/blog");
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// Public
router.get("/posts",        ctrl.getPosts);
router.get("/trending",     ctrl.getTrending);
router.get("/posts/:slug",  ctrl.getPostBySlug);

// Admin-only actions
router.post("/posts",       requireAdmin, upload.single("image"), ctrl.createPost);
router.put("/posts/:id",    requireAdmin, upload.single("image"), ctrl.updatePost);
router.delete("/posts/:id", requireAdmin, ctrl.deletePost);

module.exports = router;
