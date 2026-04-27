const db = require("../config/db");

// ─────────────────────────────────────────
//  ADMIN: QUẢN LÝ ĐẶT VÉ (BOOKINGS)
// ─────────────────────────────────────────

// GET /api/booking/admin/bookings?page=1&status=&search=
exports.getAllBookings = async (req, res) => {
  try {
    const { page = 1, limit = 20, status = "", search = "" } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let conditions = [];
    const params = [];

    if (status) {
      conditions.push("b.payment_status = ?");
      params.push(status);
    }
    if (search) {
      conditions.push("(b.booking_code LIKE ? OR b.user_email LIKE ?)");
      params.push(`%${search}%`, `%${search}%`);
    }

    const where = conditions.length ? "WHERE " + conditions.join(" AND ") : "";

    const [rows] = await db.query(`
      SELECT
        b.id, b.booking_code, b.user_id, b.user_email,
        b.final_total AS total_amount,
        b.payment_status AS status,
        b.payment_method, b.created_at,
        b.coupon_code, b.discount_amount,
        GROUP_CONCAT(bs.seat_code ORDER BY bs.seat_code SEPARATOR ', ') AS seats
      FROM bookings b
      LEFT JOIN booking_seats bs ON bs.booking_id = b.id
      ${where}
      GROUP BY b.id
      ORDER BY b.created_at DESC
      LIMIT ? OFFSET ?
    `, [...params, parseInt(limit), offset]);

    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) AS total FROM bookings b ${where}`,
      params
    );

    res.json({ bookings: rows, total, page: parseInt(page) });
  } catch (err) {
    console.error("getAllBookings error:", err);
    res.status(500).json({ message: "Server error: " + err.message });
  }
};

// GET /api/booking/admin/bookings/:booking_code - Chi tiết 1 đơn
exports.getBookingDetail = async (req, res) => {
  try {
    const { booking_code } = req.params;
    const [[booking]] = await db.query(
      "SELECT * FROM bookings WHERE booking_code = ? LIMIT 1",
      [booking_code]
    );
    if (!booking) return res.status(404).json({ message: "Không tìm thấy đơn" });

    const [seats] = await db.query(
      "SELECT * FROM booking_seats WHERE booking_id = ?",
      [booking.id]
    );
    res.json({ ...booking, seats });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// PATCH /api/booking/admin/bookings/:booking_code/cancel
exports.cancelBooking = async (req, res) => {
  try {
    const { booking_code } = req.params;
    const [result] = await db.query(
      "UPDATE bookings SET payment_status = 'cancelled' WHERE booking_code = ? AND payment_status != 'cancelled'",
      [booking_code]
    );
    if (!result.affectedRows) {
      return res.status(400).json({ message: "Đơn đã huỷ hoặc không tìm thấy" });
    }
    res.json({ message: "Huỷ đơn thành công" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/booking/admin/revenue?from=YYYY-MM-DD&to=YYYY-MM-DD
exports.getRevenue = async (req, res) => {
  try {
    const fromDate = req.query.from || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const toDate   = req.query.to   || new Date().toISOString().slice(0, 10);

    const [daily] = await db.query(`
      SELECT
        DATE(created_at) AS date,
        COUNT(*) AS total_orders,
        SUM(final_total) AS revenue
      FROM bookings
      WHERE payment_status = 'paid'
        AND DATE(created_at) BETWEEN ? AND ?
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `, [fromDate, toDate]);

    const [[summary]] = await db.query(`
      SELECT
        COUNT(*) AS total_orders,
        COALESCE(SUM(final_total), 0) AS total_revenue,
        COALESCE(AVG(final_total), 0) AS avg_order_value
      FROM bookings
      WHERE payment_status = 'paid'
        AND DATE(created_at) BETWEEN ? AND ?
    `, [fromDate, toDate]);

    res.json({ daily, summary });
  } catch (err) {
    console.error("getRevenue error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ─────────────────────────────────────────
//  ADMIN: QUẢN LÝ MÃ GIẢM GIÁ (COUPONS)
// ─────────────────────────────────────────

// GET /api/booking/admin/coupons
exports.getAllCoupons = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        cm.*,
        COUNT(uc.id) AS total_used
      FROM coupons_master cm
      LEFT JOIN user_coupons uc ON uc.code = cm.code
      GROUP BY cm.id
      ORDER BY cm.id DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error("getAllCoupons error:", err);
    res.status(500).json({ message: "Server error: " + err.message });
  }
};

// POST /api/booking/admin/coupons
exports.createCoupon = async (req, res) => {
  try {
    const { code, discount_value, description, name } = req.body;
    if (!code || discount_value === undefined) {
      return res.status(400).json({ message: "Thiếu code hoặc discount_value" });
    }

    const [existing] = await db.query("SELECT id FROM coupons_master WHERE code = ?", [code]);
    if (existing.length > 0) {
      return res.status(409).json({ message: "Mã này đã tồn tại" });
    }

    await db.query(
      "INSERT INTO coupons_master (code, name, discount_value, is_active) VALUES (?, ?, ?, 1)",
      [code.toUpperCase(), name || description || code, parseFloat(discount_value)]
    );

    res.status(201).json({ message: "Tạo mã giảm giá thành công" });
  } catch (err) {
    console.error("createCoupon error:", err);
    res.status(500).json({ message: "Server error: " + err.message });
  }
};

// DELETE /api/booking/admin/coupons/:code
exports.deleteCoupon = async (req, res) => {
  try {
    const { code } = req.params;
    const [result] = await db.query("DELETE FROM coupons_master WHERE code = ?", [code]);
    if (!result.affectedRows) return res.status(404).json({ message: "Không tìm thấy mã" });
    res.json({ message: "Xoá mã giảm giá thành công" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// ─────────────────────────────────────────
//  ADMIN: QUẢN LÝ COMBOS
// ─────────────────────────────────────────

// GET /api/booking/admin/combos
exports.getAllCombos = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM combos ORDER BY id DESC");
    res.json(rows);
  } catch (err) {
    console.error("getAllCombos error:", err);
    res.status(500).json({ message: "Server error: " + err.message });
  }
};

// POST /api/booking/admin/combos
exports.createCombo = async (req, res) => {
  try {
    const { name, description, price, image } = req.body;
    if (!name || price === undefined) {
      return res.status(400).json({ message: "Thiếu name hoặc price" });
    }

    await db.query(
      "INSERT INTO combos (name, description, price, image) VALUES (?, ?, ?, ?)",
      [name, description || '', parseFloat(price), image || 'combo.png']
    );

    res.status(201).json({ message: "Tạo combo thành công" });
  } catch (err) {
    console.error("createCombo error:", err);
    res.status(500).json({ message: "Server error: " + err.message });
  }
};

// PUT /api/booking/admin/combos/:id  (set giá combo & update)
exports.updateCombo = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, image } = req.body;
    
    await db.query(
      "UPDATE combos SET name=?, description=?, price=?, image=? WHERE id=?",
      [name, description, parseFloat(price), image, id]
    );

    // Xóa/Cập nhật giá combo ở showtime luôn nếu muốn đồng bộ?
    // Thường base price đổi thì giá củ có đổi ko tùy business, tạm thời chỉ update bảng combos.

    res.json({ message: "Cập nhật combo thành công" });
  } catch (err) {
    console.error("updateCombo error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE /api/booking/admin/combos/:id
exports.deleteCombo = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query("DELETE FROM combos WHERE id = ?", [id]);
    res.json({ message: "Xoá combo thành công" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/booking/admin/reports/stats?from=YYYY-MM-DD&to=YYYY-MM-DD
exports.getDetailedStats = async (req, res) => {
  try {
    const { from, to } = req.query;
    // Default to last 30 days if not provided
    const fromDate = from || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const toDate   = to   || new Date().toISOString().slice(0, 10);

    // 1. Daily Revenue
    const [dailyRevenue] = await db.query(`
      SELECT DATE(created_at) as date, SUM(final_total) as revenue, COUNT(*) as orders
      FROM bookings
      WHERE payment_status = 'paid' AND DATE(created_at) BETWEEN ? AND ?
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `, [fromDate, toDate]);

    // 2. Monthly Revenue (Last 6 months)
    const [monthlyRevenue] = await db.query(`
      SELECT DATE_FORMAT(created_at, '%Y-%m') as month, SUM(final_total) as revenue, COUNT(*) as orders
      FROM bookings
      WHERE payment_status = 'paid'
      GROUP BY month
      ORDER BY month DESC
      LIMIT 6
    `);

    // 3. Top Movies (Revenue based)
    const [topMovies] = await db.query(`
      SELECT 
        m.id, m.title, m.poster,
        SUM(b.final_total) as revenue,
        COUNT(b.id) as tickets_sold
      FROM bookings b
      JOIN movie_db.showtimes st ON b.showtime_id = st.id
      JOIN movie_db.movies m ON st.movie_id = m.id
      WHERE b.payment_status = 'paid'
      GROUP BY m.id
      ORDER BY revenue DESC
      LIMIT 10
    `);

    // 4. Occupancy Rate (Recent Showtimes)
    const [occupancy] = await db.query(`
      SELECT 
        st.id as showtime_id,
        m.title as movie_title,
        DATE_FORMAT(sd.show_date, '%Y-%m-%d') as show_date,
        st.show_time,
        (SELECT COUNT(*) FROM seat_layout WHERE room_id = st.room_id) as total_seats,
        (SELECT COUNT(*) FROM showtime_seats WHERE showtime_id = st.id AND status = 'booked') as booked_seats
      FROM movie_db.showtimes st
      JOIN movie_db.movies m ON st.movie_id = m.id
      JOIN movie_db.show_dates sd ON st.show_date_id = sd.id
      ORDER BY sd.show_date DESC, st.show_time DESC
      LIMIT 20
    `);

    res.json({
      dailyRevenue,
      monthlyRevenue: monthlyRevenue.reverse(),
      topMovies,
      occupancy: occupancy.map(o => ({
        ...o,
        fill_rate: o.total_seats > 0 ? Math.round((o.booked_seats / o.total_seats) * 100) : 0
      }))
    });
  } catch (err) {
    console.error("getDetailedStats error:", err);
    res.status(500).json({ message: "Server error: " + err.message });
  }
};

// POST /api/booking/admin/checkin
exports.checkinTicket = async (req, res) => {
  try {
    const { ticket_id, hash } = req.body;
    if (!ticket_id || !hash) {
      return res.status(400).json({ success: false, message: "Thiếu ticket_id hoặc hash" });
    }

    // 1. Kiểm tra vé tồn tại và hash hợp lệ
    const [[ticket]] = await db.query(`
      SELECT t.*, b.booking_code, b.user_email, st.show_time, sd.show_date,
             m.title AS movie_title, r.room_name, sl.seat_code
      FROM tickets t
      JOIN bookings b ON t.booking_id = b.id
      JOIN movie_db.showtimes st ON t.showtime_id = st.id
      JOIN movie_db.show_dates sd ON st.show_date_id = sd.id
      JOIN movie_db.movies m ON st.movie_id = m.id
      JOIN movie_db.rooms r ON st.room_id = r.id
      JOIN seat_layout sl ON t.seat_id = sl.id
      WHERE t.id = ? AND t.qr_hash = ?
      LIMIT 1
    `, [ticket_id, hash]);

    if (!ticket) {
      return res.status(404).json({ success: false, message: "Vé không tồn tại hoặc mã hash không hợp lệ" });
    }

    // 2. Kiểm tra trạng thái vé
    if (ticket.status === 'used') {
      return res.status(400).json({ 
        success: false, 
        message: "Vé này đã được sử dụng vào lúc " + new Date(ticket.checkin_time).toLocaleString('vi-VN') 
      });
    }

    // 3. Kiểm tra thời gian suất chiếu (Check cùng ngày)
    const today = new Date().toISOString().slice(0, 10);
    const showDate = new Date(ticket.show_date).toISOString().slice(0, 10);

    // 4. Cập nhật trạng thái
    await db.query(
      "UPDATE tickets SET status = 'used', checkin_time = NOW() WHERE id = ?",
      [ticket_id]
    );

    res.json({
      success: true,
      message: "Check-in thành công! Mời vào rạp.",
      ticket: {
        id: ticket.id,
        booking_code: ticket.booking_code,
        movie_title: ticket.movie_title,
        room_name: ticket.room_name,
        seat_code: ticket.seat_code,
        show_time: ticket.show_time,
        show_date: showDate,
        fullname: ticket.user_email || 'Khách hàng'
      }
    });

  } catch (err) {
    console.error("checkinTicket error:", err);
    res.status(500).json({ success: false, message: "Server error: " + err.message });
  }
};
