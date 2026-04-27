const authMiddleware = require("../middlewares/auth.middleware");
const controller = require("../controllers/coupon.controller");

module.exports = (app) => {
    // Đăng ký Coupon mới từ mã master
    app.post("/coupons/register", authMiddleware, controller.registerCoupon);
    
    // Lấy danh sách Coupon của tôi
    app.get("/coupons/my-coupons", authMiddleware, controller.getMyCoupons);

    // Kiểm tra & Áp dụng Coupon khi thanh toán
    app.post("/coupons/apply", authMiddleware, controller.applyCoupon);
};
