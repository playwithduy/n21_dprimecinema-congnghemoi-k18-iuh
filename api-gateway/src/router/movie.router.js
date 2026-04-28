const express = require("express");
const proxy = require("../middlewares/proxy");

const router = express.Router();

router.use("/", proxy("movie-service"));

module.exports = router;
