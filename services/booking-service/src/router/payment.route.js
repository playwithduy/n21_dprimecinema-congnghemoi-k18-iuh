// ============================================================
// payment.route.js
// Đặt tại: services/booking-service/src/router/payment.route.js
// ============================================================

const {
    createPayment,
    getPaymentStatus,
    confirmBankPayment,
    confirmCashPayment,
    simulateBankReceived,
    getMyTickets,
    cancelPayment,
    sepayWebhook,
} = require("../controllers/payment.controller");


module.exports = (app) => {

    app.post("/payment/create",                createPayment);

    app.get("/payment/status/:booking_code",   getPaymentStatus);

    app.post("/payment/confirm-cash",          confirmCashPayment);

    app.post("/payment/confirm-bank",          confirmBankPayment);

    app.post("/payment/simulate-bank",         simulateBankReceived);

    app.get("/payment/my-tickets/:user_id",    getMyTickets);

    app.post("/payment/cancel/:booking_code",  cancelPayment);

    app.post("/payment/sepay-webhook",         sepayWebhook);
};