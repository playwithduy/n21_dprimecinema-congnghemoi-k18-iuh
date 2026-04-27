const express = require("express");
const proxy = require("../middlewares/proxy");

const router = express.Router();

// forward toàn bộ /api/movies → movie-service
router.use("/", proxy("movie-service"));

module.exports = router;
