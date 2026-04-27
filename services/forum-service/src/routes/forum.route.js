const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/forum.controller");
const { requireAuth, optionalAuth } = require("../middleware/auth");

// Public
router.get("/posts",        optionalAuth, ctrl.getPosts);
router.get("/posts/:id",    optionalAuth, ctrl.getPostById);
router.get("/movies",       ctrl.getMoviesForTag);

// Cần đăng nhập
router.post("/posts",                 requireAuth, ctrl.createPost);
router.put("/posts/:id",            requireAuth, ctrl.updatePost);
router.delete("/posts/:id",           requireAuth, ctrl.deletePost);
router.post("/posts/:id/like",        requireAuth, ctrl.toggleLike);
router.post("/posts/:id/comments",    requireAuth, ctrl.addComment);

module.exports = router;
