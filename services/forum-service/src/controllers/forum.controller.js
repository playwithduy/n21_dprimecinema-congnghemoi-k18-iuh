const db = require("../config/db");

/* ═══════════════════════════════════════════════
   GET /api/forum/posts
   Query: ?movie_id=&type=&page=&limit=&search=
═══════════════════════════════════════════════ */
async function getPosts(req, res) {
  try {
    const { movie_id, type, page = 1, limit = 10, search } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let where = ["1=1"];
    const params = [];

    if (movie_id) { where.push("p.movie_id = ?"); params.push(movie_id); }
    if (type)     { where.push("p.type = ?");     params.push(type); }
    if (search)   { where.push("(p.title LIKE ? OR p.movie_title LIKE ?)"); params.push(`%${search}%`, `%${search}%`); }

    const [rows] = await db.query(
      `SELECT p.*,
        (SELECT COUNT(*) FROM forum_comments c WHERE c.post_id = p.id) AS comment_count
       FROM forum_posts p
       WHERE ${where.join(" AND ")}
       ORDER BY p.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) AS total FROM forum_posts p WHERE ${where.join(" AND ")}`,
      params
    );

    res.json({ posts: rows, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
}

/* ═══════════════════════════════════════════════
   GET /api/forum/posts/:id
═══════════════════════════════════════════════ */
async function getPostById(req, res) {
  try {
    const { id } = req.params;

    const [[post]] = await db.query(
      `SELECT p.*,
        (SELECT COUNT(*) FROM forum_comments c WHERE c.post_id = p.id) AS comment_count
       FROM forum_posts p WHERE p.id = ?`,
      [id]
    );
    if (!post) return res.status(404).json({ message: "Không tìm thấy bài viết" });

    const [comments] = await db.query(
      `SELECT * FROM forum_comments WHERE post_id = ? ORDER BY created_at ASC`,
      [id]
    );

    res.json({ ...post, comments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
}

/* ═══════════════════════════════════════════════
   POST /api/forum/posts  (cần đăng nhập)
═══════════════════════════════════════════════ */
async function createPost(req, res) {
  try {
    const { title, content, movie_id, movie_title, type, rating, 
            username: bodyUsername, avatar: bodyAvatar } = req.body;
    const { id: user_id, fullname, username: tokenUsername, avatar: tokenAvatar } = req.user;

    const finalUsername = fullname || tokenUsername || bodyUsername || "Anonymous";
    const finalAvatar = tokenAvatar || bodyAvatar || null;

    if (!title || !content) {
      return res.status(400).json({ message: "Tiêu đề và nội dung không được để trống" });
    }

    const [result] = await db.query(
      `INSERT INTO forum_posts (user_id, username, avatar, title, content, movie_id, movie_title, type, rating)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [user_id, finalUsername, finalAvatar, title, content,
       movie_id || null, movie_title || null,
       type || "discussion",
       rating || null]
    );

    res.status(201).json({ id: result.insertId, message: "Đăng bài thành công" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
}

/* ═══════════════════════════════════════════════
   DELETE /api/forum/posts/:id  (chủ bài)
═══════════════════════════════════════════════ */
async function deletePost(req, res) {
  try {
    const { id } = req.params;
    const { id: user_id } = req.user;

    const [[post]] = await db.query("SELECT user_id FROM forum_posts WHERE id = ?", [id]);
    if (!post) return res.status(404).json({ message: "Không tìm thấy bài" });
    if (post.user_id !== user_id) return res.status(403).json({ message: "Không có quyền xóa" });

    await db.query("DELETE FROM forum_comments WHERE post_id = ?", [id]);
    await db.query("DELETE FROM forum_likes WHERE post_id = ?", [id]);
    await db.query("DELETE FROM forum_posts WHERE id = ?", [id]);

    res.json({ message: "Xóa bài thành công" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
}

/* ═══════════════════════════════════════════════
   PUT /api/forum/posts/:id  (chủ bài)
═══════════════════════════════════════════════ */
async function updatePost(req, res) {
  try {
    const { id } = req.params;
    const { id: user_id } = req.user;
    const { title, content, movie_id, movie_title, rating, type } = req.body;

    const [[post]] = await db.query("SELECT user_id FROM forum_posts WHERE id = ?", [id]);
    if (!post) return res.status(404).json({ message: "Không tìm thấy bài" });
    if (post.user_id !== user_id) return res.status(403).json({ message: "Không có quyền sửa" });

    await db.query(
      `UPDATE forum_posts 
       SET title = ?, content = ?, movie_id = ?, movie_title = ?, rating = ?, type = ?
       WHERE id = ?`,
      [title, content, movie_id || null, movie_title || null, rating || null, type || "review", id]
    );

    res.json({ message: "Cập nhật bài viết thành công" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
}

/* ═══════════════════════════════════════════════
   POST /api/forum/posts/:id/like  (toggle)
═══════════════════════════════════════════════ */
async function toggleLike(req, res) {
  try {
    const { id: post_id } = req.params;
    const { id: user_id } = req.user;

    const [[existing]] = await db.query(
      "SELECT * FROM forum_likes WHERE user_id = ? AND post_id = ?",
      [user_id, post_id]
    );

    if (existing) {
      await db.query("DELETE FROM forum_likes WHERE user_id = ? AND post_id = ?", [user_id, post_id]);
      await db.query("UPDATE forum_posts SET likes = likes - 1 WHERE id = ?", [post_id]);
      return res.json({ liked: false });
    } else {
      await db.query("INSERT INTO forum_likes (user_id, post_id) VALUES (?, ?)", [user_id, post_id]);
      await db.query("UPDATE forum_posts SET likes = likes + 1 WHERE id = ?", [post_id]);
      return res.json({ liked: true });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
}

/* ═══════════════════════════════════════════════
   POST /api/forum/posts/:id/comments
═══════════════════════════════════════════════ */
async function addComment(req, res) {
  try {
    const { id: post_id } = req.params;
    const { content, username: bodyUsername, avatar: bodyAvatar } = req.body;
    const { id: user_id, fullname, username: tokenUsername, avatar: tokenAvatar } = req.user;

    const finalUsername = fullname || tokenUsername || bodyUsername || "Anonymous";
    const finalAvatar = tokenAvatar || bodyAvatar || null;

    if (!content) return res.status(400).json({ message: "Nội dung không được để trống" });

    const [result] = await db.query(
      `INSERT INTO forum_comments (post_id, user_id, username, avatar, content) VALUES (?, ?, ?, ?, ?)`,
      [post_id, user_id, finalUsername, finalAvatar, content]
    );

    const [[comment]] = await db.query("SELECT * FROM forum_comments WHERE id = ?", [result.insertId]);
    res.status(201).json(comment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
}

/* ═══════════════════════════════════════════════
   GET /api/forum/movies  — danh sách phim để chọn tag
═══════════════════════════════════════════════ */
async function getMoviesForTag(req, res) {
  try {
    const [rows] = await db.query(
      "SELECT id, title, slug, poster FROM movies WHERE status IN ('now_showing','coming_soon') ORDER BY title ASC"
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
}

module.exports = { getPosts, getPostById, createPost, deletePost, updatePost, toggleLike, addComment, getMoviesForTag };
