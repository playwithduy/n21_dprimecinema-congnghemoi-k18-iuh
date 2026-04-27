module.exports = (app, db) => {

  app.get('/seats/:showtime', async (req, res) => {
    try {
      const showtime_id = req.params.showtime;

      const [[showtimeInfo]] = await db.query(
        `SELECT room_id FROM movie_db.showtimes WHERE id = ?`,
        [showtime_id]
      );

      if (!showtimeInfo) {
        return res.status(404).json({ message: 'Showtime not found' });
      }

      const room_id = showtimeInfo.room_id;

      const [[countRow]] = await db.query(
        `SELECT COUNT(*) AS cnt FROM booking_db.showtime_seats WHERE showtime_id = ?`,
        [showtime_id]
      );

      if (countRow.cnt === 0) {
        await db.query(`
          INSERT INTO booking_db.showtime_seats (showtime_id, seat_id, status)
          SELECT ?, sl.id, 'available'
          FROM booking_db.seat_layout sl
          WHERE sl.room_id = ?
        `, [showtime_id, room_id]);
      } else {
        await db.query(`
          INSERT INTO booking_db.showtime_seats (showtime_id, seat_id, status)
          SELECT ?, sl.id, 'available'
          FROM booking_db.seat_layout sl
          LEFT JOIN booking_db.showtime_seats ss
            ON ss.showtime_id = ?
           AND ss.seat_id = sl.id
          WHERE sl.room_id = ?
            AND ss.id IS NULL
        `, [showtime_id, showtime_id, room_id]);
      }

      const [rows] = await db.query(
        `SELECT sl.seat_code,
                sl.seat_type,
                ss.status,
                ss.held_by,
                ss.hold_until
         FROM booking_db.showtime_seats ss
         JOIN booking_db.seat_layout sl ON ss.seat_id = sl.id
         WHERE ss.showtime_id = ?
         ORDER BY sl.seat_row, sl.seat_number`,
        [showtime_id]
      );

      res.json(rows);

    } catch (err) {
      console.error('SEAT API ERROR:', err);
      res.status(500).json({ message: err.message });
    }
  });

};
