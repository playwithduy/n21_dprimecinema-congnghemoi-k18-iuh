const isAdmin = require("../middlewares/isAdmin.middleware");
const ctrl = require("../controllers/admin.booking.controller");
const invCtrl = require("../controllers/admin.inventory.controller");

module.exports = (app) => {
  // ─── Bookings ─────────────────────────────────────
  app.get("/admin/bookings", isAdmin, ctrl.getAllBookings);
  app.get("/admin/bookings/:booking_code", isAdmin, ctrl.getBookingDetail);
  app.patch("/admin/bookings/:booking_code/cancel", isAdmin, ctrl.cancelBooking);
  app.get("/admin/revenue", isAdmin, ctrl.getRevenue);
  app.get("/admin/reports/stats", isAdmin, ctrl.getDetailedStats);
  app.get("/admin/tickets", isAdmin, ctrl.getAllTickets);
  app.post("/admin/checkin", isAdmin, ctrl.checkinTicket);

  // ─── Coupons / Promotions ─────────────────────────
  app.get("/admin/coupons", isAdmin, ctrl.getAllCoupons);
  app.post("/admin/coupons", isAdmin, ctrl.createCoupon);
  app.delete("/admin/coupons/:code", isAdmin, ctrl.deleteCoupon);

  // ─── Combos ───────────────────────────────────────
  app.get("/admin/combos", isAdmin, ctrl.getAllCombos);
  app.post("/admin/combos", isAdmin, ctrl.createCombo);
  app.put("/admin/combos/:id", isAdmin, ctrl.updateCombo);
  app.delete("/admin/combos/:id", isAdmin, ctrl.deleteCombo);

  // ─── Inventory (Bắp nước) ────────────────────────
  app.get("/admin/cinemas", isAdmin, invCtrl.getCinemas);
  app.get("/admin/inventory/items", isAdmin, invCtrl.getInventoryItems);
  app.get("/admin/inventory/central", isAdmin, invCtrl.getCentralInventory);
  app.post("/admin/inventory/items", isAdmin, invCtrl.createItem);
  app.delete("/admin/inventory/items/:id", isAdmin, invCtrl.deleteItem);
  app.post("/admin/inventory/import", isAdmin, invCtrl.importStock);
  app.post("/admin/inventory/import-central", isAdmin, invCtrl.importToCentral);
  app.get("/admin/inventory/recipes", isAdmin, invCtrl.getRecipes);
  app.post("/admin/inventory/recipes", isAdmin, invCtrl.updateRecipe);
  app.get("/admin/inventory/logs", isAdmin, invCtrl.getInventoryLogs);
  app.get("/admin/inventory/report", isAdmin, invCtrl.getCOGSReport);
};
