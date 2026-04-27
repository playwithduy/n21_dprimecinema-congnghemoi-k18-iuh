const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const express = require('express');
const db = require('./config/db');

const cors = require('cors');

const helmet = require('helmet');
const compression = require('compression');

const app = express();

// 1. Security Headers
app.use(helmet());

// 2. Compression (Speed)
app.use(compression());

app.use(cors({
    origin: "*", 
}));

app.use(express.json());

require('./router/seat.route')(app, db);
require('./router/showtime.route')(app);
require('./router/payment.route')(app);    
require('./router/paymentPIN.route')(app);
require('./router/coupon.route')(app);
require('./router/admin.route')(app);  // 🔐 Admin endpoints


const PORT = process.env.PORT || 3004;
app.listen(PORT, () => {
  console.log(`🚀 Booking Service API running on ${PORT}`);
});