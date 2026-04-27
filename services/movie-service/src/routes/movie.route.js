const express = require("express");
const router = express.Router();
const controller = require("../controllers/movie.controller");
const { isAdmin } = require("../middlewares/auth.middleware");

// ==========================
// ADMIN ROUTES (PROTECTED)
// ==========================
router.get("/admin/all", isAdmin, controller.getAllAdmin);
router.post("/admin", isAdmin, controller.createMovie);
router.put("/admin/:id", isAdmin, controller.updateMovie);
router.delete("/admin/:id", isAdmin, controller.deleteMovie);

// ==========================
// PUBLIC ROUTES
// ==========================
router.get("/now-showing", controller.getNowShowing);
router.get("/coming-soon", controller.getComingSoon);
router.get("/ranking", controller.getRanking);
router.get("/slug/:slug", controller.getMovieBySlug);
router.get("/search", controller.search);
router.post("/chat", controller.handleChatbot);

router.get("/slug/:slug/reviews", controller.getReviews);
router.post("/slug/:slug/reviews", controller.createReview);

module.exports = router;

