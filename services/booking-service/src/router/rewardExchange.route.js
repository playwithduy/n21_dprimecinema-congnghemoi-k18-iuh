const authMiddleware = require("../middlewares/auth.middleware");
const isAdmin = require("../middlewares/isAdmin.middleware");
const controller = require("../controllers/rewardExchange.controller");

module.exports = (app) => {
    // User routes
    app.post("/reward-exchanges", authMiddleware, controller.createExchange);

    // Admin routes
    app.get("/admin/reward-exchanges", authMiddleware, isAdmin, controller.getAdminExchanges);
    app.put("/admin/reward-exchanges/:id/status", authMiddleware, isAdmin, controller.updateExchangeStatus);
};
