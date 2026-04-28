require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const voiceController = require("./controllers/voice.controller");
const seatService = require("./services/seat-recommender.service");

// ===================================================================
// Voice AI Service — Entry Point
// ===================================================================

const app = express();
const PORT = process.env.PORT || 3007;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Routes
app.post("/process", voiceController.handleVoiceRequest);

// API riêng để lấy sơ đồ ghế (phục vụ Real-time)
app.get("/seat-map/:showtimeId", async (req, res) => {
    try {
        const layout = await seatService.getSeatMap(req.params.showtimeId);
        res.json(layout);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Health check
app.get("/health", (req, res) => res.json({ status: "ok", service: "voice-ai-service" }));

// Global Error Handler
app.use((err, req, res, next) => {
    console.error("❌ UNHANDLED ERROR:", err);
    res.status(500).json({ reply: "Có lỗi xảy ra trên server AI. Vui lòng thử lại." });
});

const pool = require("./config/db");
app.listen(PORT, "0.0.0.0", async () => {
    console.log(`🎙️ Voice AI Service running on port ${PORT}`);
    
    // Kiểm tra kết nối DB ngay khi start
    try {
        await pool.query("SELECT 1");
        console.log("✅ Database connected successfully");
    } catch (err) {
        console.error("❌ Database connection failed:", err.message);
    }
});
