const express = require("express");
const router = express.Router();
const proxy = require("../middlewares/proxy");

router.post("/register", proxy("auth-service"));
router.post("/login", proxy("auth-service"));
router.get("/me", proxy("auth-service"));
router.post("/avatar", proxy("auth-service"));

module.exports = router;