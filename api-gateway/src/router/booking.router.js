const proxy = require("../middlewares/proxy");
module.exports = (app) => {
  app.use("/api/booking", proxy("booking-service"));
};
