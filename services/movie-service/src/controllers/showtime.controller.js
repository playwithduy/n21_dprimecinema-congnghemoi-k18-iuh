const db = require("../config/db");

exports.getByMovie = async (req, res) => {
  const movieId = req.params.movieId;

  try {
    const [rows] = await db.query(
      `
      SELECT
        st.id AS showtime_id,
        DATE_FORMAT(sd.show_date, '%Y-%m-%d') AS show_date,
        ci.id AS city_id,
        ci.name AS city_name,
        c.id AS cinema_id,
        c.name AS cinema_name,
        f.id AS format_id,
        f.name AS format_name,
        l.name AS language,
        TIME_FORMAT(st.show_time, '%H:%i') AS show_time
      FROM showtimes st
      JOIN show_dates sd ON st.show_date_id = sd.id
      JOIN cinemas c ON st.cinema_id = c.id
      JOIN cities ci ON c.city_id = ci.id
      JOIN formats f ON st.format_id = f.id
      JOIN languages l ON st.language_id = l.id
      WHERE st.movie_id = ?
      ORDER BY sd.show_date, ci.id, c.id, st.show_time
      `,
      [movieId]
    );

    const dates = {};

    rows.forEach(r => {
      if (!dates[r.show_date]) {
        dates[r.show_date] = {
          date: r.show_date,
          cities: {}
        };
      }

      if (!dates[r.show_date].cities[r.city_id]) {
        dates[r.show_date].cities[r.city_id] = {
          id: r.city_id,
          name: r.city_name,
          cinemas: {}
        };
      }

      if (!dates[r.show_date].cities[r.city_id].cinemas[r.cinema_id]) {
        dates[r.show_date].cities[r.city_id].cinemas[r.cinema_id] = {
          id: r.cinema_id,
          name: r.cinema_name,
          formats: {}
        };
      }

      const key = `${r.format_id}_${r.language}`;

      if (
        !dates[r.show_date]
          .cities[r.city_id]
          .cinemas[r.cinema_id]
          .formats[key]
      ) {
        dates[r.show_date]
          .cities[r.city_id]
          .cinemas[r.cinema_id]
          .formats[key] = {
            id: r.format_id,
            name: r.format_name,
            language: r.language,
            times: []
          };
      }

      dates[r.show_date]
        .cities[r.city_id]
        .cinemas[r.cinema_id]
        .formats[key]
        .times.push({
          id: r.showtime_id,
          time: r.show_time
        });
    });

    res.json({
      movie_id: movieId,
      dates: Object.values(dates).map(d => ({
        date: d.date,
        cities: Object.values(d.cities).map(city => ({
          id: city.id,
          name: city.name,
          cinemas: Object.values(city.cinemas).map(cinema => ({
            id: cinema.id,
            name: cinema.name,
            formats: Object.values(cinema.formats)
          }))
        }))
      }))
    });

  } catch (err) {
    console.error("getByMovie error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getByDate = async (req, res) => {
  const date = req.query.date || new Date().toISOString().slice(0, 10);
  try {
    const [rows] = await db.query(
      `SELECT
        st.id AS showtime_id,
        DATE_FORMAT(sd.show_date, '%Y-%m-%d') AS show_date,
        TIME_FORMAT(st.show_time, '%H:%i') AS show_time,
        m.id AS movie_id, m.title AS movie_name,
        m.poster, m.duration, m.age_limit,
        f.name AS format_name, l.name AS language,
        c.id AS cinema_id, c.name AS cinema_name,
        r.id AS room_id, r.room_name
      FROM showtimes st
      JOIN show_dates sd ON st.show_date_id = sd.id
      JOIN movies m ON st.movie_id = m.id
      JOIN cinemas c ON st.cinema_id = c.id
      JOIN formats f ON st.format_id = f.id
      JOIN languages l ON st.language_id = l.id
      JOIN rooms r ON st.room_id = r.id
      WHERE sd.show_date = ?
      ORDER BY c.id, m.id, st.show_time`,
      [date]
    );
    res.json(rows);
  } catch (err) {
    console.error("getByDate error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getCinemas = async (req, res) => {
  try {
    const [rows] = await db.query(`SELECT id, name, address, city_id FROM cinemas ORDER BY name`);
    res.json(rows);
  } catch (err) {
    console.error("getCinemas error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getCities = async (req, res) => {
  try {
    const [rows] = await db.query(`SELECT id, name FROM cities ORDER BY name`);
    res.json(rows);
  } catch (err) {
    console.error("getCities error:", err);
    res.status(500).json({ message: "Server error" });
  }
};