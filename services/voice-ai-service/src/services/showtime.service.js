const pool = require("../config/db");
const timeParser = require("../utils/time-parser");

// ===================================================================
// Showtime Service — Tìm kiếm phim và suất chiếu
// Truy vấn database để tìm các lựa chọn phù hợp nhất với yêu cầu giọng nói
// ===================================================================

/**
 * Tìm kiếm phim dựa trên tên (flexible search)
 */
async function findMovie(movieName) {
    if (!movieName) return null;
    
    // Loại bỏ các từ khóa thừa thường gặp trong giọng nói
    const cleanName = movieName.replace(/phim|đặt vé|mua vé|mua|vé|lấy|cho|xem|tìm/gi, "").trim();
    
    const [rows] = await pool.query(
        `SELECT id, title, slug, poster, duration, age_limit 
         FROM movies 
         WHERE title LIKE ? OR slug LIKE ?
         LIMIT 1`,
        [`%${cleanName}%`, `%${cleanName}%`]
    );
    
    return rows[0] || null;
}

/**
 * Tìm các suất chiếu phù hợp với yêu cầu thời gian
 */
async function findShowtimes(movieId, timeExtracted) {
    const { date, time_range, specific_time, _prefer } = timeExtracted;
    
    const now = new Date(new Date().toLocaleString("en-US", {timeZone: "Asia/Ho_Chi_Minh"}));
    const currentDate = now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, "0") + "-" + String(now.getDate()).padStart(2, "0");
    const currentTime = String(now.getHours()).padStart(2, "0") + ":" + String(now.getMinutes()).padStart(2, "0") + ":" + String(now.getSeconds()).padStart(2, "0");

    let query = `
        SELECT 
            st.id AS showtime_id,
            TIME_FORMAT(st.show_time, '%H:%i') AS show_time,
            sd.show_date,
            c.name AS cinema_name,
            r.room_name,
            f.name AS format_name
        FROM showtimes st
        JOIN show_dates sd ON st.show_date_id = sd.id
        JOIN cinemas c ON st.cinema_id = c.id
        JOIN rooms r ON st.room_id = r.id
        JOIN formats f ON st.format_id = f.id
        WHERE st.movie_id = ? AND sd.show_date = ?
          AND (sd.show_date > ? OR (sd.show_date = ? AND st.show_time >= ?))
    `;
    
    const params = [movieId, date, currentDate, currentDate, currentTime];
    
    if (specific_time) {
        // Tìm suất gần nhất với giờ yêu cầu (trong khoảng +/- 60p)
        query += ` AND st.show_time BETWEEN SUBTIME(?, '01:00:00') AND ADDTIME(?, '01:30:00')`;
        params.push(specific_time, specific_time);
    } else if (time_range) {
        query += ` AND st.show_time BETWEEN ? AND ?`;
        params.push(time_range.from, time_range.to);
    }
    
    query += ` ORDER BY st.show_time`;
    
    const [rows] = await pool.query(query, params);
    
    if (rows.length === 0) return [];
    
    // Nếu có preference (sớm nhất/muộn nhất)
    if (_prefer === "earliest") return [rows[0]];
    if (_prefer === "latest") return [rows[rows.length - 1]];
    
    return rows;
}

/**
 * Lấy tất cả các phim đang có suất chiếu vào một ngày cụ thể
 */
async function findAllMoviesWithShowtimes(date) {
    const now = new Date(new Date().toLocaleString("en-US", {timeZone: "Asia/Ho_Chi_Minh"}));
    const currentDate = now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, "0") + "-" + String(now.getDate()).padStart(2, "0");
    const currentTime = String(now.getHours()).padStart(2, "0") + ":" + String(now.getMinutes()).padStart(2, "0") + ":" + String(now.getSeconds()).padStart(2, "0");

    const query = `
        SELECT DISTINCT m.id, m.title, m.poster, m.duration
        FROM movies m
        JOIN showtimes st ON m.id = st.movie_id
        JOIN show_dates sd ON st.show_date_id = sd.id
        WHERE sd.show_date = ?
          AND (sd.show_date > ? OR (sd.show_date = ? AND st.show_time >= ?))
    `;
    const [rows] = await pool.query(query, [date, currentDate, currentDate, currentTime]);
    return rows;
}

/**
 * Tìm ngày tiếp theo có suất chiếu tính từ một ngày cụ thể
 */
async function findNextAvailableDate(fromDate) {
    const query = `
        SELECT sd.show_date
        FROM show_dates sd
        JOIN showtimes st ON sd.id = st.show_date_id
        WHERE sd.show_date > ?
        ORDER BY sd.show_date ASC
        LIMIT 1
    `;
    const [rows] = await pool.query(query, [fromDate]);
    return rows[0] ? rows[0].show_date : null;
}

/**
 * Tìm phim theo ID
 */
async function findMovieById(id) {
    const [rows] = await pool.query(
        `SELECT id, title, slug, poster, duration, age_limit 
         FROM movies 
         WHERE id = ?
         LIMIT 1`,
        [id]
    );
    return rows[0] || null;
}

module.exports = {
    findMovie,
    findMovieById,
    findShowtimes,
    findAllMoviesWithShowtimes,
    findNextAvailableDate
};
