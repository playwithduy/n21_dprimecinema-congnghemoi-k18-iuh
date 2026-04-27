const axios = require("axios");
const db = require("../config/db");

module.exports = (app) => {

    // ✅ THÊM MỚI: Danh sách chi nhánh
    app.get("/showtimes/cinemas", async (req, res) => {
        try {
            const r = await axios.get("http://movie-service:3002/showtimes/cinemas");
            res.json(r.data);
        } catch (err) {
            console.error("❌ CINEMAS ERROR:", err.message);
            res.status(500).json({ message: "Lỗi server" });
        }
    });

    // ✅ THÊM MỚI: Lịch chiếu theo ngày
    app.get("/showtimes/by-date", async (req, res) => {
        const date = req.query.date || new Date().toISOString().slice(0, 10);
        try {
            const r = await axios.get("http://movie-service:3002/showtimes/by-date", { params: { date } });
            res.json(r.data);
        } catch (err) {
            console.error("❌ BY-DATE ERROR:", err.message);
            res.status(500).json({ message: "Lỗi server" });
        }
    });

    app.get("/showtimes", async (req, res) => {

        const movieId = req.query.movie_id;

        try {

            if (!movieId) {
                return res.status(400).json({ message: "Thiếu movie_id" });
            }

            console.log("👉 CALL MOVIE SERVICE LIST:", movieId);

            const response = await axios.get(
                "http://movie-service:3002/showtimes",
                {
                    params: { movie_id: movieId }
                }
            );

            console.log("✅ RESPONSE:", response.data);

            res.json(response.data);

        } catch (err) {
            console.log("❌ LIST SHOWTIME ERROR:");
            console.log("➡️ message:", err.message);
            console.log("➡️ data:", err.response?.data);

            res.status(500).json({
                message: err.response?.data || "Lỗi server"
            });
        }
    });

    app.get("/showtimes/:id", async (req, res) => {

        const id = req.params.id;

        try {

            console.log("👉 CALL MOVIE SERVICE DETAIL:", id);

            const response = await axios.get(
                `http://movie-service:3002/showtimes/${id}`
            );

            console.log("✅ DETAIL:", response.data);

            res.json(response.data);

        } catch (err) {
            console.log("❌ DETAIL SHOWTIME ERROR:");
            console.log("➡️ message:", err.message);
            console.log("➡️ data:", err.response?.data);

            res.status(500).json({
                message: err.response?.data || "Lỗi server"
            });
        }
    });

    app.get("/showtimes/:id/prices", async (req, res) => {

        const showtimeId = req.params.id;

        try {

            console.log("💰 GET SEAT PRICES:", showtimeId);

            const [rows] = await db.query(
                "SELECT seat_type, price FROM seat_prices WHERE showtime_id = ?",
                [showtimeId]
            );

            res.json(rows);

        } catch (err) {
            console.error("❌ PRICE ERROR:", err);

            res.status(500).json({
                message: "Lỗi lấy giá ghế"
            });
        }
    });

    app.get("/combos/:showtime_id", async (req, res) => {

        const showtimeId = req.params.showtime_id;

        try {

            console.log("🍿 GET COMBOS:", showtimeId);

            const [rows] = await db.query(`
                SELECT 
                    c.id,
                    c.name,
                    c.description,
                    cp.price,
                    c.image
                FROM combos c
                JOIN combo_prices cp 
                    ON c.id = cp.combo_id
                WHERE cp.showtime_id = ?
            `, [showtimeId]);

            res.json(rows);

        } catch (err) {
            console.error("❌ COMBO ERROR:", err);

            res.status(500).json({
                message: "Lỗi lấy combo"
            });
        }
    });
};