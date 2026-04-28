const db = require("../config/db");

// ─────────────────────────────────────────
//  ADMIN: QUẢN LÝ SUẤT CHIẾU (SHOWTIMES)
// ─────────────────────────────────────────

// GET /api/showtimes/admin/all  - Lấy toàn bộ suất chiếu (kèm join thông tin)
exports.getAllAdmin = async (req, res) => {
  try {
    const { date, cinema_id } = req.query;
    let sql = `
      SELECT
        st.id, st.show_time, st.movie_id, st.cinema_id, st.room_id,
        st.format_id, st.language_id,
        DATE_FORMAT(sd.show_date, '%Y-%m-%d') AS show_date,
        m.title AS movie_title, m.poster AS movie_poster,
        c.name AS cinema_name,
        c.address AS cinema_address,
        r.room_name,
        f.name AS format_name,
        l.name AS language_name
      FROM showtimes st
      JOIN show_dates sd ON st.show_date_id = sd.id
      JOIN movies m ON st.movie_id = m.id
      JOIN cinemas c ON st.cinema_id = c.id
      JOIN rooms r ON st.room_id = r.id
      JOIN formats f ON st.format_id = f.id
      JOIN languages l ON st.language_id = l.id
      WHERE 1=1
    `;
    const params = [];
    if (date) { sql += " AND sd.show_date = ?"; params.push(date); }
    if (cinema_id) { sql += " AND st.cinema_id = ?"; params.push(cinema_id); }
    sql += " ORDER BY sd.show_date DESC, st.show_time ASC LIMIT 200";

    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error("admin getAllShowtimes error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/showtimes/admin/timetable - Lấy lịch chiếu theo khung ngày kèm tỷ lệ lấp đầy
exports.getTimetableAdmin = async (req, res) => {
  try {
    const { start_date, end_date, cinema_id } = req.query;
    if (!start_date || !end_date) {
      return res.status(400).json({ message: "Thiếu khoảng ngày" });
    }

    let sql = `
      SELECT
        st.id, st.show_time,
        DATE_FORMAT(sd.show_date, '%Y-%m-%d') as show_date,
        m.title as movie_title, m.poster as movie_poster,
        r.room_name,
        c.name as cinema_name,
        c.address as cinema_address,
        (SELECT COUNT(*) FROM booking_db.seat_layout WHERE room_id = st.room_id) as total_seats,
        (SELECT COUNT(*) FROM booking_db.showtime_seats ss WHERE ss.showtime_id = st.id AND ss.status IN ('booked', 'held', 'locked', 'sold')) as booked_seats
      FROM showtimes st
      JOIN show_dates sd ON st.show_date_id = sd.id
      JOIN movies m ON st.movie_id = m.id
      JOIN rooms r ON st.room_id = r.id
      JOIN cinemas c ON st.cinema_id = c.id
      WHERE sd.show_date BETWEEN ? AND ?
    `;
    const params = [start_date, end_date];
    if (cinema_id) { sql += " AND st.cinema_id = ?"; params.push(cinema_id); }
    sql += " ORDER BY sd.show_date ASC, st.show_time ASC";

    const [rows] = await db.query(sql, params);
    
    // Xử lý thêm fill_rate cho từng record
    const formatted = rows.map(r => {
        const total = r.total_seats || 1; 
        const booked = r.booked_seats || 0;
        const fill_rate = Math.round((booked / total) * 100);
        return { ...r, fill_rate };
    });

    res.json(formatted);
  } catch (err) {
    console.error("admin getTimetableAdmin error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/showtimes/admin/meta - Trả về danh sách movies, cinemas, rooms, formats, languages để điền vào form
exports.getMeta = async (req, res) => {
  try {
    const [[movies], [cinemas], [rooms], [formats], [languages], [combos]] = await Promise.all([
      db.query(`SELECT id, title FROM movies WHERE status IN ('NOW_SHOWING','COMING_SOON') ORDER BY title`),
      db.query(`SELECT id, name FROM cinemas ORDER BY name`),
      db.query(`SELECT id, room_name, cinema_id FROM rooms ORDER BY room_name`),
      db.query(`SELECT id, name FROM formats`),
      db.query(`SELECT id, name FROM languages`),
      db.query(`SELECT id, name, price FROM booking_db.combos ORDER BY name`),
    ]);
    res.json({ movies, cinemas, rooms, formats, languages, combos });
  } catch (err) {
    console.error("getMeta error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/showtimes/admin - Tạo suất chiếu mới (có check overlap)
exports.createShowtime = async (req, res) => {
  const { movie_id, cinema_id, room_id, show_date, show_time, format_id, language_id } = req.body;
  if (!movie_id || !cinema_id || !room_id || !show_date || !show_time) {
    return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });
  }
  try {
    // 1. Lấy/Tạo show_date record
    let [dateRows] = await db.query("SELECT id FROM show_dates WHERE show_date = ? LIMIT 1", [show_date]);
    let show_date_id;
    if (dateRows.length === 0) {
      const [ins] = await db.query("INSERT INTO show_dates (show_date) VALUES (?)", [show_date]);
      show_date_id = ins.insertId;
    } else {
      show_date_id = dateRows[0].id;
    }

    // 2. Check overlap: cùng phòng, cùng ngày, khoảng cách ít nhất 3 tiếng (180 phút)
    const [overlap] = await db.query(`
      SELECT st.id FROM showtimes st
      JOIN show_dates sd ON st.show_date_id = sd.id
      WHERE st.room_id = CAST(? AS UNSIGNED) AND sd.show_date = ?
        AND ABS(TIME_TO_SEC(st.show_time) - TIME_TO_SEC(?)) < 10800
    `, [room_id, show_date, show_time]);

    if (overlap.length > 0) {
      return res.status(409).json({
        message: "LỖI: Khoảng cách giữa các suất chiếu trong cùng 1 phòng phải từ 3 tiếng trở lên!"
      });
    }

    // 3. Insert Showtime
    const [result] = await db.query(`
      INSERT INTO showtimes (movie_id, cinema_id, room_id, show_date_id, show_time, format_id, language_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [movie_id, cinema_id, room_id, show_date_id, show_time, format_id, language_id]);

    const newShowtimeId = result.insertId;

    // 4. Insert Seat Prices
    const { seat_prices, combo_items } = req.body;
    if (seat_prices) {
      const priceEntries = Object.entries(seat_prices); // { normal: 45000, vip: 60000, ... }
      if (priceEntries.length > 0) {
        const values = priceEntries.map(([type, price]) => [newShowtimeId, type, price]);
        await db.query(`
          INSERT INTO booking_db.seat_prices (showtime_id, seat_type, price)
          VALUES ?
        `, [values]);
      }
    }

    // 5. Insert Combo Prices
    if (combo_items && Array.isArray(combo_items) && combo_items.length > 0) {
      const values = combo_items.map(c => [newShowtimeId, c.combo_id, c.price]);
      await db.query(`
        INSERT INTO booking_db.combo_prices (showtime_id, combo_id, price)
        VALUES ?
      `, [values]);
    }

    res.status(201).json({ message: "Tạo suất chiếu thành công", id: newShowtimeId });
  } catch (err) {
    console.error("createShowtime error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE /api/showtimes/admin/:id
exports.deleteShowtime = async (req, res) => {
  try {
    const { id } = req.params;
    // Kiểm tra nếu đã có vé đặt thì không được xoá
    // FIX: Dùng booking_db.showtime_seats và lọc các status đã bán/giữ
    const [seats] = await db.query(
      "SELECT id FROM booking_db.showtime_seats WHERE showtime_id = ? AND status IN ('booked', 'held', 'sold') LIMIT 1",
      [id]
    );
    if (seats.length > 0) {
      return res.status(409).json({ message: "Không thể xoá: Suất chiếu này đã có khách đang đặt vé hoặc đã mua vé." });
    }

    // Xoá cả giá vé và combo liên quan để sạch DB
    await Promise.all([
      db.query("DELETE FROM booking_db.seat_prices WHERE showtime_id = ?", [id]),
      db.query("DELETE FROM booking_db.combo_prices WHERE showtime_id = ?", [id]),
      db.query("DELETE FROM showtimes WHERE id = ?", [id])
    ]);

    res.json({ message: "Xoá suất chiếu thành công" });
  } catch (err) {
    console.error("deleteShowtime error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/showtimes/admin/:id - Lấy chi tiết suất chiếu (để Edit)
exports.getShowtimeDetailAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 1. Info cơ bản
    const [stRows] = await db.query(`
      SELECT st.*, DATE_FORMAT(sd.show_date, '%Y-%m-%d') as show_date, r.room_name
      FROM movie_db.showtimes st
      JOIN movie_db.show_dates sd ON st.show_date_id = sd.id
      LEFT JOIN movie_db.rooms r ON st.room_id = r.id
      WHERE st.id = ?
    `, [id]);
    
    if (stRows.length === 0) return res.status(404).json({ message: "Không thấy suất chiếu" });
    const st = stRows[0];

    // 2. Lấy giá ghế
    const [prices] = await db.query("SELECT seat_type, price FROM booking_db.seat_prices WHERE showtime_id = ?", [id]);
    const seat_prices = {};
    prices.forEach(p => { seat_prices[p.seat_type] = p.price; });

    // 3. Lấy combos
    const [combos] = await db.query("SELECT combo_id, price FROM booking_db.combo_prices WHERE showtime_id = ?", [id]);

    res.json({ 
      ...st,
      show_time: (typeof st.show_time === 'string') ? st.show_time.slice(0, 5) : st.show_time, 
      seat_prices,
      combo_items: combos
    });
  } catch (err) {
    console.error("getShowtimeDetailAdmin error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// PUT /api/showtimes/admin/:id - Cập nhật suất chiếu
exports.updateShowtime = async (req, res) => {
  try {
    const { id } = req.params;
    const { movie_id, cinema_id, room_id, show_date, show_time, format_id, language_id, seat_prices, combo_items } = req.body;

    // 1. Cập nhật show_date_id
    let [dateRows] = await db.query("SELECT id FROM show_dates WHERE show_date = ? LIMIT 1", [show_date]);
    let show_date_id;
    if (dateRows.length === 0) {
      const [ins] = await db.query("INSERT INTO show_dates (show_date) VALUES (?)", [show_date]);
      show_date_id = ins.insertId;
    } else {
      show_date_id = dateRows[0].id;
    }

    // 2. Check overlap: cùng phòng, cùng ngày, khoảng cách ít nhất 3 tiếng (180 phút), trừ chính nó
    const [overlap] = await db.query(`
      SELECT st.id FROM showtimes st
      JOIN show_dates sd ON st.show_date_id = sd.id
      WHERE st.room_id = CAST(? AS UNSIGNED) AND sd.show_date = ? AND st.id != ?
        AND ABS(TIME_TO_SEC(st.show_time) - TIME_TO_SEC(?)) < 10800
    `, [room_id, show_date, id, show_time]);

    if (overlap.length > 0) {
      return res.status(409).json({
        message: "LỖI: Khoảng cách giữa các suất chiếu trong cùng 1 phòng phải từ 3 tiếng trở lên!"
      });
    }

    // 2. Chạy update showtime
    await db.query(`
      UPDATE showtimes 
      SET movie_id=?, cinema_id=?, room_id=?, show_date_id=?, show_time=?, format_id=?, language_id=?
      WHERE id=?
    `, [movie_id, cinema_id, room_id, show_date_id, show_time, format_id, language_id, id]);

    // 3. Xoá giá cũ & combo cũ
    await db.query("DELETE FROM booking_db.seat_prices WHERE showtime_id = ?", [id]);
    await db.query("DELETE FROM booking_db.combo_prices WHERE showtime_id = ?", [id]);

    // 4. Insert giá mới
    if (seat_prices) {
      const priceEntries = Object.entries(seat_prices);
      if (priceEntries.length > 0) {
        const values = priceEntries.map(([type, price]) => [id, type, price]);
        await db.query("INSERT INTO booking_db.seat_prices (showtime_id, seat_type, price) VALUES ?", [values]);
      }
    }

    // 5. Insert combo mới
    if (combo_items && Array.isArray(combo_items) && combo_items.length > 0) {
      const values = combo_items.map(c => [id, c.combo_id, c.price]);
      await db.query("INSERT INTO booking_db.combo_prices (showtime_id, combo_id, price) VALUES ?", [values]);
    }

    res.json({ message: "Cập nhật suất chiếu thành công" });
  } catch (err) {
    console.error("updateShowtime error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ─────────────────────────────────────────
//  ADMIN: QUẢN LÝ PHÒNG & GHẾ (ROOMS)
// ─────────────────────────────────────────

// GET /api/showtimes/admin/rooms
exports.getRooms = async (req, res) => {
  try {
    const { cinema_id } = req.query;
    console.log("🔍 FETCHING ROOMS FOR CINEMA:", cinema_id);

    // Truy vấn kết hợp lấy luôn số ghế bằng LEFT JOIN
    let sql = `
      SELECT r.id, r.room_name, r.room_number, r.cinema_id, r.central_metadata,
             c.name AS cinema_name,
             COUNT(sl.id) AS total_seats
      FROM rooms r
      JOIN cinemas c ON r.cinema_id = c.id
      LEFT JOIN booking_db.seat_layout sl ON sl.room_id = r.id
    `;
    
    const params = [];
    if (cinema_id) { 
      sql += " WHERE r.cinema_id = ?"; 
      params.push(cinema_id); 
    }
    
    sql += " GROUP BY r.id ORDER BY r.room_number ASC";
    
    console.log("SQL:", sql, "PARAMS:", params);
    
    const [rooms] = await db.query(sql, params);
    console.log("✅ FOUND ROOMS:", rooms.length);

    res.json(rooms);
  } catch (err) {
    console.error("❌ getRooms error:", err);
    res.status(500).json({ 
        message: "Lỗi Server khi tải danh sách phòng",
        error: err.message 
    });
  }
};

// GET /api/showtimes/admin/rooms/:id
exports.getRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query("SELECT * FROM rooms WHERE id = ?", [id]);
    if (!rows.length) return res.status(404).json({ message: "Không tìm thấy phòng" });
    res.json(rows[0]);
  } catch (err) {
    console.error("getRoom error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/showtimes/admin/rooms/:id/seats
exports.getRoomSeats = async (req, res) => {
  try {
    const { id } = req.params;
    const [seats] = await db.query(
      `SELECT id, seat_row, seat_number, seat_type FROM booking_db.seat_layout WHERE room_id = ? ORDER BY seat_row, seat_number`,
      [id]
    );
    res.json(seats);
  } catch (err) {
    console.error("getRoomSeats error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/showtimes/admin/rooms - Tạo phòng và tự động sinh ghế
exports.createRoom = async (req, res) => {
  try {
    const { room_name, cinema_id, rows, cols } = req.body;
    if (!room_name || !cinema_id || !rows || !cols) {
      return res.status(400).json({ message: "Thiếu thông tin phòng hoặc số lượng hàng/cột" });
    }

    // 1. Lấy room_number lớn nhất hiện tại của rạp đó để tự tăng
    const [maxRows] = await db.query("SELECT MAX(room_number) as maxNum FROM rooms WHERE cinema_id = ?", [cinema_id]);
    const nextNumber = (maxRows[0].maxNum || 0) + 1;

    // 2. Tạo phòng (Không có cột total_seats trong DB của bạn)
    const [result] = await db.query(
      "INSERT INTO rooms (room_name, cinema_id, room_number) VALUES (?, ?, ?)",
      [room_name, cinema_id, nextNumber]
    );
    const roomId = result.insertId;

    // 3. Tự động sinh sơ đồ ghế (Mặc định là 'normal')
    const seats = [];
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    for (let r = 0; r < rows; r++) {
      const rowChar = alphabet[r] || `R${r+1}`;
      for (let c = 1; c <= cols; c++) {
        const seatCode = `${rowChar}${c}`;
        seats.push([roomId, seatCode, rowChar, c, 'normal']);
      }
    }

    if (seats.length > 0) {
      await db.query(
        "INSERT INTO booking_db.seat_layout (room_id, seat_code, seat_row, seat_number, seat_type) VALUES ?",
        [seats]
      );
    }

    res.status(201).json({ message: "Tạo phòng và sơ đồ ghế thành công", id: roomId });
  } catch (err) {
    console.error("createRoom error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE /api/showtimes/admin/rooms/:id
exports.deleteRoom = async (req, res) => {
  try {
    const { id } = req.params;
    // Kiểm tra xem phòng có suất chiếu không?
    const [st] = await db.query("SELECT id FROM movie_db.showtimes WHERE room_id = ? LIMIT 1", [id]);
    if (st.length > 0) return res.status(400).json({ message: "Không thể xoá phòng đang có lịch chiếu" });

    await db.query("DELETE FROM booking_db.seat_layout WHERE room_id = ?", [id]);
    await db.query("DELETE FROM movie_db.rooms WHERE id = ?", [id]);
    res.json({ message: "Xoá phòng thành công" });
  } catch (err) {
    console.error("deleteRoom error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// PUT /api/showtimes/admin/rooms/:id - Đổi tên phòng
exports.updateRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const { room_name } = req.body;
    await db.query("UPDATE movie_db.rooms SET room_name = ? WHERE id = ?", [room_name, id]);
    res.json({ message: "Cập nhật phòng thành công" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// PUT /api/showtimes/admin/rooms/:id/central
exports.updateRoomCentral = async (req, res) => {
  try {
    const { id } = req.params;
    const { central_metadata } = req.body;
    await db.query("UPDATE movie_db.rooms SET central_metadata = ? WHERE id = ?", [
        JSON.stringify(central_metadata), 
        id
    ]);
    res.json({ message: "Cập nhật vùng trung tâm thành công" });
  } catch (err) {
    console.error("updateRoomCentral error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// PATCH /api/showtimes/admin/seats/batch - Cập nhật hàng loạt ghế
exports.updateSeatsBatch = async (req, res) => {
  try {
    const { seatIds, seatType, seat_ids, seat_type } = req.body;
    const finalIds = seatIds || seat_ids;
    const finalType = seatType || seat_type;

    console.log("📝 BATCH UPDATE SEATS:", { count: finalIds?.length, type: finalType });

    if (!finalIds || !Array.isArray(finalIds) || finalIds.length === 0) {
        return res.status(400).json({ message: "Danh sách ID ghế không hợp lệ" });
    }

    // Chỉ chấp nhận các loại ghế có trong Enum của DB
    const allowedTypes = ['normal', 'vip', 'sweetbox', 'broken'];
    if (!allowedTypes.includes(finalType)) {
        return res.status(400).json({ message: `Loại ghế không hợp lệ: ${finalType}` });
    }

    const [result] = await db.query(
        "UPDATE booking_db.seat_layout SET seat_type = ? WHERE id IN (?)",
        [finalType, finalIds]
    );
    console.log("✅ BATCH UPDATE SUCCESS. Affected:", result.affectedRows);
    res.json({ message: "Cập nhật danh sách ghế thành công", affected: result.affectedRows });
  } catch (err) {
    console.error("❌ updateSeatsBatch error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.initRoomLayout = async (req, res) => {
  try {
    const { id } = req.params;
    const { rows, cols } = req.body;

    // Validate: rows and cols must be positive integers
    if (!rows || !cols || rows < 1 || cols < 1 || !Number.isInteger(rows) || !Number.isInteger(cols)) {
      return res.status(400).json({ message: "Số hàng và số ghế mỗi hàng phải là số nguyên dương (≥ 1)" });
    }
    if (rows > 26) {
      return res.status(400).json({ message: "Số hàng tối đa là 26 (A-Z)" });
    }

    // Xoá sơ đồ cũ nếu có
    await db.query("DELETE FROM booking_db.seat_layout WHERE room_id = ?", [id]);

    const seats = [];
    const rowLabels = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    for (let r = 0; r < rows; r++) {
      for (let c = 1; c <= cols; c++) {
        seats.push([
          id,
          `${rowLabels[r]}${c}`,
          rowLabels[r], // seat_row
          c, // seat_number
          'normal'
        ]);
      }
    }

    if (seats.length > 0) {
      await db.query(
        "INSERT INTO booking_db.seat_layout (room_id, seat_code, seat_row, seat_number, seat_type) VALUES ?",
        [seats]
      );
    }

    res.json({ message: "Khởi tạo sơ đồ ghế thành công" });
  } catch (err) {
    console.error("initRoomLayout error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/showtimes/admin/cinemas/:id/movies
exports.getCinemaMovies = async (req, res) => {
  try {
    const { id } = req.params;
    const [movies] = await db.query(`
      SELECT DISTINCT m.id, m.title 
      FROM movie_db.movies m
      JOIN movie_db.showtimes st ON st.movie_id = m.id
      JOIN movie_db.rooms r ON st.room_id = r.id
      WHERE r.cinema_id = ?
    `, [id]);
    res.json(movies);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/showtimes/admin/cinemas/:id/movies/:movieId/dates
exports.getMovieDates = async (req, res) => {
  try {
    const dates = [];
    
    // Ép kiểu lấy ngày hiện tại theo múi giờ Việt Nam
    const now = new Date();
    const vnTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Ho_Chi_Minh"}));
    
    for (let i = 0; i < 7; i++) {
      const d = new Date(vnTime);
      d.setDate(vnTime.getDate() + i);
      
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      
      dates.push({ date: dateStr });
    }
    
    res.json(dates);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/showtimes/admin/cinemas/:id/movies/:movieId/dates/:date/times
exports.getMovieTimes = async (req, res) => {
  try {
    const { id, movieId, date } = req.params;
    const [times] = await db.query(`
      SELECT 
        st.id, 
        DATE_FORMAT(st.show_time, '%H:%i') as time, 
        st.room_id as room_id,
        st.room_id as roomId,
        (SELECT room_name FROM movie_db.rooms WHERE id = st.room_id) as room_name
      FROM movie_db.showtimes st
      JOIN movie_db.show_dates sd ON st.show_date_id = sd.id
      WHERE st.movie_id = ? 
        AND sd.show_date = ?
      ORDER BY time ASC
    `, [movieId, date]);
    res.json(times);
  } catch (err) {
    console.error("getMovieTimes error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// PATCH /api/showtimes/admin/showtimes/:id/styles
exports.updateShowtimeStyles = async (req, res) => {
  try {
    const { id } = req.params;
    const { colors, images } = req.body;
    const styles = JSON.stringify({ colors, images });
    await db.query("UPDATE movie_db.showtimes SET seat_styles = ? WHERE id = ?", [styles, id]);
    res.json({ message: "Cập nhật giao diện suất chiếu thành công" });
  } catch (err) {
    console.error("updateShowtimeStyles error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/showtimes/admin/showtimes/:id/config
exports.getShowtimeConfig = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query("SELECT seat_styles FROM movie_db.showtimes WHERE id = ?", [id]);
    if (!result.length) return res.status(404).json({ message: "Không tìm thấy suất chiếu" });
    
    let styles = null;
    if (result[0].seat_styles) {
        styles = typeof result[0].seat_styles === 'string' ? JSON.parse(result[0].seat_styles) : result[0].seat_styles;
    }
    res.json({ styles });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
// PATCH /api/showtimes/admin/rooms/:id/styles
exports.updateRoomStyles = async (req, res) => {
  try {
    const { id } = req.params;
    const { colors, images } = req.body;
    const styles = JSON.stringify({ colors, images });
    await db.query("UPDATE movie_db.rooms SET seat_styles = ? WHERE id = ?", [styles, id]);
    res.json({ message: "Cập nhật giao diện mặc định cho phòng thành công" });
  } catch (err) {
    console.error("updateRoomStyles error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// PATCH /api/showtimes/admin/movies/:id/styles
exports.updateMovieStyles = async (req, res) => {
  try {
    const { id } = req.params;
    const { colors, images } = req.body;
    const styles = JSON.stringify({ colors, images });
    
    // Attempt to update. If column missing, we might need to alert the user or auto-add it.
    await db.query("UPDATE movie_db.movies SET seat_styles = ? WHERE id = ?", [styles, id]);
    res.json({ message: "Cập nhật giao diện cho phim thành công" });
  } catch (err) {
    console.error("updateMovieStyles error:", err);
    if (err.code === 'ER_BAD_FIELD_ERROR') {
        return res.status(400).json({ message: "Database missing seat_styles column in movies table. Please add it." });
    }
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/showtimes/admin/movies/:id/config
exports.getMovieConfig = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query("SELECT seat_styles FROM movie_db.movies WHERE id = ?", [id]);
    if (!result.length) return res.status(404).json({ message: "Không tìm thấy phim" });
    
    let styles = null;
    if (result[0].seat_styles) {
        styles = typeof result[0].seat_styles === 'string' ? JSON.parse(result[0].seat_styles) : result[0].seat_styles;
    }
    res.json({ styles });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

