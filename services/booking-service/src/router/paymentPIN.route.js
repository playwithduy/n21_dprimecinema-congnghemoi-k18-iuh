const authMiddleware = require("../middlewares/auth.middleware");
const controller = require("../controllers/paymentPIN.controller");

module.exports = (app) => {
    // Cập nhật/Tạo mới PIN
    app.post("/payment-pin/update", authMiddleware, controller.updatePIN);
    
    // Check xem đã có PIN chưa
    app.get("/payment-pin/check", authMiddleware, controller.checkPIN);

    // Xác thực PIN khi thanh toán
    app.post("/payment-pin/verify", authMiddleware, controller.verifyPIN);
};
