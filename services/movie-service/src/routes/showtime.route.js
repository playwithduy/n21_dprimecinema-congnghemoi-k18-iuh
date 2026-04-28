const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { isAdmin } = require("../middlewares/auth.middleware");
const controller = require("../controllers/showtime.controller");
const adminCtrl = require("../controllers/admin.showtime.controller");

console.log("🛣️ SHOWTIME ROUTES LOADED");

// ==============================
// ADMIN ROUTES (MUST BE FIRST)
// ==============================
router.get("/admin/all",           isAdmin, adminCtrl.getAllAdmin);
router.get("/admin/timetable",     isAdmin, adminCtrl.getTimetableAdmin);
router.get("/admin/meta",          isAdmin, adminCtrl.getMeta);
router.get("/admin/rooms",         isAdmin, adminCtrl.getRooms);
router.get("/admin/rooms/:id",     isAdmin, adminCtrl.getRoom);
router.get("/admin/rooms/:id/seats", isAdmin, adminCtrl.getRoomSeats);
router.post("/admin/rooms",        isAdmin, adminCtrl.createRoom);
router.put("/admin/rooms/:id",     isAdmin, adminCtrl.updateRoom);
router.put("/admin/rooms/:id/central", isAdmin, adminCtrl.updateRoomCentral);
router.delete("/admin/rooms/:id",  isAdmin, adminCtrl.deleteRoom);
router.post("/admin/rooms/:id/init", isAdmin, adminCtrl.initRoomLayout);
router.patch("/admin/seats/batch", isAdmin, adminCtrl.updateSeatsBatch);

// New Filtering & Styles
router.get("/admin/cinemas/:id/movies", isAdmin, adminCtrl.getCinemaMovies);
router.get("/admin/cinemas/:id/movies/:movieId/dates", isAdmin, adminCtrl.getMovieDates);
router.get("/admin/cinemas/:id/movies/:movieId/dates/:date/times", isAdmin, adminCtrl.getMovieTimes);
router.patch("/admin/rooms/:id/styles",     isAdmin, adminCtrl.updateRoomStyles);
router.patch("/admin/movies/:id/styles",    isAdmin, adminCtrl.updateMovieStyles);
router.patch("/admin/showtimes/:id/styles", isAdmin, adminCtrl.updateShowtimeStyles);
router.get("/admin/movies/:id/config",      isAdmin, adminCtrl.getMovieConfig);
router.get("/admin/showtimes/:id/config",   isAdmin, adminCtrl.getShowtimeConfig);

router.get("/admin/:id",           isAdmin, adminCtrl.getShowtimeDetailAdmin);
router.post("/admin",              isAdmin, adminCtrl.createShowtime);
router.put("/admin/:id",           isAdmin, adminCtrl.updateShowtime);
router.delete("/admin/:id",        isAdmin, adminCtrl.deleteShowtime);

// ==============================
// PUBLIC ROUTES
// ==============================
router.get("/cinemas", controller.getCinemas);
router.get("/cities", controller.getCities);
router.get("/by-date", controller.getByDate);  
router.get("/movie/:movieId", controller.getByMovie);

// HELPER
const getAssetUrl = (path) => 
    path && !path.startsWith('http') ? `/uploads/posters/${path.split('/').pop()}` : path;

router.get("/:id(\\d+)", async (req, res) => {
    const id = req.params.id;
    try {
        const [rows] = await db.query(`
            SELECT st.id, TIME_FORMAT(st.show_time, '%H:%i') AS show_time,
                m.title AS movie_name, m.poster AS poster,
                c.name AS cinema_name, r.room_name AS room_name,
                r.central_metadata
            FROM showtimes st
            JOIN movies m ON st.movie_id = m.id
            JOIN cinemas c ON st.cinema_id = c.id
            JOIN rooms r ON st.room_id = r.id
            WHERE st.id = ?
        `, [id]);
        
        if (!rows.length) return res.status(404).json({ message: "Không tìm thấy suất chiếu" });

        const row = rows[0];

        // NEW: Check styles separately or use fallbacks to avoid 500 if columns are missing
        let showtime_styles = null, movie_styles = null, room_styles = null;
        try {
            const [extra] = await db.query("SELECT seat_styles FROM showtimes WHERE id = ?", [id]);
            if (extra.length) showtime_styles = extra[0].seat_styles;
        } catch(e) {}
        try {
            const [extra] = await db.query("SELECT seat_styles FROM movies m JOIN showtimes st ON st.movie_id = m.id WHERE st.id = ?", [id]);
            if (extra.length) movie_styles = extra[0].seat_styles;
        } catch(e) {}
        try {
            const [extra] = await db.query("SELECT seat_styles FROM rooms r JOIN showtimes st ON st.room_id = r.id WHERE st.id = ?", [id]);
            if (extra.length) room_styles = extra[0].seat_styles;
        } catch(e) {}

        let effectiveStyles = null;

        const parseJSON = (str) => {
            if (!str) return null;
            if (typeof str !== 'string') return str;
            try { return JSON.parse(str); } catch (e) { return null; }
        };

        // Fallback Logic: Showtime > Movie > Room
        const sStyles = parseJSON(showtime_styles);
        const mStyles = parseJSON(movie_styles);
        const rStyles = parseJSON(room_styles);

        if (sStyles && (sStyles.colors || sStyles.images)) {
            effectiveStyles = sStyles;
        } else if (mStyles && (mStyles.colors || mStyles.images)) {
            effectiveStyles = mStyles;
        } else if (rStyles && (rStyles.colors || rStyles.images)) {
            effectiveStyles = rStyles;
        }

        res.json({ 
            id: row.id,
            show_time: row.show_time,
            movie_name: row.movie_name,
            poster: getAssetUrl(row.poster),
            cinema_name: row.cinema_name,
            room_name: row.room_name,
            central_metadata: row.central_metadata,
            seat_styles: effectiveStyles 
        });
    } catch (err) {
        console.error("Detail Error:", err);
        res.status(500).json({ message: "Lỗi server" });
    }
});

router.get("/", async (req, res) => {
    const movieId = req.query.movie_id;
    try {
        let sql = `
            SELECT st.id, TIME_FORMAT(st.show_time, '%H:%i') AS show_time,
                m.title AS movie_name, m.poster AS poster,
                c.name AS cinema_name, r.room_name AS room_name
            FROM showtimes st
            JOIN movies m ON st.movie_id = m.id
            JOIN cinemas c ON st.cinema_id = c.id
            JOIN rooms r ON st.room_id = r.id
        `;
        let params = [];
        if (movieId) {
            sql += " WHERE st.movie_id = ?";
            params.push(movieId);
        }
        sql += " ORDER BY st.show_time ASC";
        const [rows] = await db.query(sql, params);
        res.json(rows.map(r => ({ ...r, poster: getAssetUrl(r.poster) })));
    } catch (err) {
        res.status(500).json({ message: "Lỗi server" });
    }
});

module.exports = router;