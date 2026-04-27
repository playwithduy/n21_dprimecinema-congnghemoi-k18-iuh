const db = require("../config/db");

// ==========================
// ADMIN CRUD OPERATIONS
// ==========================
exports.getAllAdmin = async () => {
  const [rows] = await db.query(`
    SELECT * FROM movies ORDER BY id DESC
  `);
  return rows;
};

exports.create = async (movie) => {
  const { title, slug, poster, trailer_url, duration, release_date, end_date, age_limit, description, genres } = movie;
  const status = new Date(release_date) > new Date() ? 'COMING_SOON' : 'NOW_SHOWING';
  
  const [result] = await db.query(
    `INSERT INTO movies (title, slug, poster, trailer_url, duration, release_date, end_date, age_limit, description, genres, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [title, slug, poster, trailer_url, duration, release_date, end_date, age_limit, description, genres, status]
  );
  return result.insertId;
};

exports.update = async (id, movie) => {
  const { title, slug, poster, trailer_url, duration, release_date, end_date, age_limit, description, genres, status } = movie;
  
  const [result] = await db.query(
    `UPDATE movies 
     SET title=?, slug=?, poster=?, trailer_url=?, duration=?, release_date=?, end_date=?, age_limit=?, description=?, genres=?, status=?
     WHERE id=?`,
    [title, slug, poster, trailer_url, duration, release_date, end_date, age_limit, description, genres, status, id]
  );
  return result.affectedRows;
};

exports.delete = async (id) => {
  const [result] = await db.query("DELETE FROM movies WHERE id = ?", [id]);
  return result.affectedRows;
};

exports.getNowShowing = async () => {
  const [rows] = await db.query(`
    SELECT id, title, slug, poster, duration, age_limit, rating, trailer_url
    FROM movies
    WHERE status = 'NOW_SHOWING'
  `);
  return rows;
};

exports.getComingSoon = async () => {
  const [rows] = await db.query(`
    SELECT id, title, slug, poster, duration, age_limit, rating
    FROM movies
    WHERE status = 'COMING_SOON'
  `);
  return rows;
};

exports.getRanking = async () => {
  const [rows] = await db.query(`
    SELECT id, title, slug, poster, duration, age_limit, rating, rating_count
    FROM movies
    ORDER BY rating DESC
    LIMIT 10
  `);
  return rows;
};

exports.getBySlug = async (slug) => {
  const [rows] = await db.query(
    "SELECT * FROM movies WHERE slug = ? LIMIT 1",
    [slug]
  );
  return rows[0];
};

exports.search = async (keyword) => {
  const [rows] = await db.query(
    `SELECT id, title, slug, poster, trailer_url, description
     FROM movies
     WHERE title LIKE ?
     LIMIT 6`,
    [`%${keyword}%`]
  );
  return rows;
};

exports.searchFlexible = async (keyword) => {
  // Loại bỏ các từ vô nghĩa common trong câu hỏi
  const stopWords = ["có", "suất", "chiếu", "không", "mấy", "giờ", "cho", "xin", "lịch", "phim"];
  let cleanKeyword = keyword.toLowerCase();
  stopWords.forEach(sw => {
      const regex = new RegExp(`(^|[\\s!,.?])(${sw})($|[\\s!,.?])`, 'g');
      cleanKeyword = cleanKeyword.replace(regex, " ");
  });

  const words = cleanKeyword.split(/\s+/).filter(w => w.length > 1);
  if (words.length === 0) return [];

  // Tạo câu query tìm kiếm theo từng từ
  const conditions = words.map(() => `title LIKE ?`).join(" OR ");
  const params = words.map(w => `%${w}%`);

  const [rows] = await db.query(
    `SELECT id, title, slug, poster, trailer_url, description
     FROM movies
     WHERE ${conditions}
     ORDER BY (
         CASE 
            WHEN title LIKE ? THEN 1 
            WHEN title LIKE ? THEN 2
            ELSE 3 
         END
     )
     LIMIT 6`,
    [...params, `%${keyword}%`, `%${words[0]}%`]
  );
  return rows;
};

exports.getByAgeLimit = async (ageLimit, comparison = '<=') => {
  let operator = comparison === '>=' ? '>=' : '<=';
  const [rows] = await db.query(
    `SELECT id, title, slug, poster, duration, age_limit, rating 
     FROM movies 
     WHERE CAST(NULLIF(age_limit, '') AS UNSIGNED) ${operator} ? 
     ORDER BY rating DESC
     LIMIT 5`,
    [ageLimit]
  );
  return rows;
};

exports.getByGenre = async (genre) => {
  const [rows] = await db.query(
    `SELECT id, title, slug, poster, duration, age_limit, rating 
     FROM movies 
     WHERE genres LIKE ? 
     ORDER BY rating DESC
     LIMIT 5`,
    [`%${genre}%`]
  );
  return rows;
};

// ==========================
// MOVIE REVIEWS (BÌNH LUẬN)
// ==========================

exports.getReviewsBySlug = async (slug) => {
  const [rows] = await db.query(
    "SELECT * FROM movie_reviews WHERE movie_slug = ? ORDER BY created_at DESC",
    [slug]
  );
  return rows;
};

exports.createReview = async (data) => {
  const { movie_slug, user_name, user_avatar, rating, content, tags } = data;
  const [result] = await db.query(
    `INSERT INTO movie_reviews (movie_slug, user_name, user_avatar, rating, content, tags) 
     VALUES (?, ?, ?, ?, ?, ?)`,
    [movie_slug, user_name, user_avatar, rating, content, JSON.stringify(tags || [])]
  );
  return result;
};