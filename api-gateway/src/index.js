const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const proxy = require("./middlewares/proxy");
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

// 0. CORS — PHẢI ĐẶT TRƯỚC TẤT CẢ (kể cả helmet & proxy)
const corsOptions = {
  origin: true,          // Cho phép mọi origin (dev environment)
  credentials: true,
  methods: ["GET","POST","PUT","PATCH","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization","X-Requested-With"],
};
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));  // Enable pre-flight cho tất cả routes

// 1. Security Headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// 2. Compression (Speed)
app.use(compression());

// 3. Rate Limiting (Anti-DDoS/Brute-force)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per 15 mins
  message: {
    status: 429,
    message: "Too many requests from this IP, please try again after 15 minutes"
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply to all API routes
app.use("/api/", limiter);

// Stricter limit for auth routes to prevent brute force
const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20, // 20 attempts per hour
    message: "Too many login attempts. Please try again after an hour."
});
app.use("/api/auth/login", authLimiter);  // Chỉ giới hạn login, KHÔNG giới hạn /api/auth/admin/*

// ===== PROXY SERVICES =====
// PROXIES MUST BE BEFORE BODY PARSER
app.use(proxy("/api/auth", "auth-service"));
app.use(createProxyMiddleware("/api/movies", {
  target: "http://movie-service:3002",
  changeOrigin: true,
  pathRewrite: { '^/api/movies': '/movies' }
}));
app.use(createProxyMiddleware("/api/showtimes", {
  target: "http://movie-service:3002",
  changeOrigin: true,
  pathRewrite: { '^/api/showtimes': '/showtimes' }
}));
app.use(proxy("/api/booking", "booking-service"));
app.use(proxy("/api/blog", "blog-service"));
app.use(proxy("/api/forum", "forum-service"));

// ===== STATIC FILES PROXY =====
app.use('/uploads/avatars', createProxyMiddleware({ target: 'http://auth-service:3001', changeOrigin: true }));
app.use('/uploads/posters', createProxyMiddleware({ target: 'http://movie-service:3002', changeOrigin: true }));
app.use('/uploads/backgrounds', createProxyMiddleware({ target: 'http://movie-service:3002', changeOrigin: true }));

// 5. Body Parser (ONLY for routes NOT proxied)
app.use((req, res, next) => {
  if (req.headers["content-type"]?.includes("multipart/form-data")) {
    return next();
  }
  express.json()(req, res, next);
});

app.listen(3000, "0.0.0.0", () => {
  console.log("🚀 API Gateway running on port 3000 (Optimized)");
});
