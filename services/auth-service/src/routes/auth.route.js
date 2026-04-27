const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const isAdmin = require("../middlewares/isAdmin.middleware");
const upload = require("../middlewares/uploadAvatar");
const adminUserCtrl = require("../controllers/admin.user.controller");

// ==============================
// ADMIN ROUTES (protected)
// ==============================
router.get("/admin/users", isAdmin, adminUserCtrl.getAllUsers);
router.put("/admin/users/:id/role", isAdmin, adminUserCtrl.updateRole);
router.patch("/admin/users/:id/ban", isAdmin, adminUserCtrl.toggleBan);

// ─── Notifications ────────────────────────────
const notifCtrl = require("../controllers/admin.notification.controller");
router.get("/admin/notifications", isAdmin, notifCtrl.getAll);
router.post("/admin/notifications", isAdmin, notifCtrl.send);
router.delete("/admin/notifications/:id", isAdmin, notifCtrl.remove);

// ==============================
// PUBLIC AUTH ROUTES
// ==============================

router.post("/register", authController.register);
router.post("/login", authController.login);

router.post("/forgot-password", authController.forgotPassword);
router.get("/reset-password/confirm", authController.resetPasswordConfirm);

router.get("/me", authMiddleware, authController.me);

router.post(
  "/avatar",
  authMiddleware,
  upload.single("avatar"),
  authController.uploadAvatar
);

router.put("/update-profile", authMiddleware, authController.updateProfile);

module.exports = router;