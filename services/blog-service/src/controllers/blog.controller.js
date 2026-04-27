const db = require("../config/db");
const slugify = require("slugify");

async function getPosts(req, res) {
  try {
    const { category, search, page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let where = ["status = 'published'"];
    const params = [];

    if (category) { where.push("category = ?"); params.push(category); }
    if (search)   { where.push("title LIKE ?"); params.push(`%${search}%`); }

    const [rows] = await db.query(
      `SELECT * FROM blog_posts WHERE ${where.join(" AND ")} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) as total FROM blog_posts WHERE ${where.join(" AND ")}`,
      params
    );

    res.json({ posts: rows, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
}

async function getPostBySlug(req, res) {
  try {
    const { slug } = req.params;
    const [[post]] = await db.query("SELECT * FROM blog_posts WHERE slug = ?", [slug]);
    
    if (!post) return res.status(404).json({ message: "Không tìm thấy bài viết" });

    // Tăng lượt xem
    await db.query("UPDATE blog_posts SET views = views + 1 WHERE id = ?", [post.id]);

    res.json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
}

async function getTrending(req, res) {
  try {
    const [rows] = await db.query("SELECT * FROM blog_posts WHERE status = 'published' ORDER BY views DESC LIMIT 5");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
}

async function createPost(req, res) {
  try {
    const { title, summary, content, category } = req.body;
    const { id: author_id, fullname: author_name } = req.user;

    if (!title || !content) return res.status(400).json({ message: "Tiêu đề và nội dung là bắt buộc" });

    let image_url = null;
    if (req.file) {
      // Vì ảnh được rạp phim frontend load từ assets/images/blog
      image_url = `./assets/images/blog/${req.file.filename}`;
    }

    const slug = slugify(title, { lower: true, strict: true }) + "-" + Date.now();

    const [result] = await db.query(
      `INSERT INTO blog_posts (title, slug, summary, content, image_url, author_id, author_name, category) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, slug, summary, content, image_url, author_id, author_name, category || "Tin tức"]
    );

    res.status(201).json({ id: result.insertId, slug, message: "Đăng bài thành công!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
}

async function updatePost(req, res) {
  try {
    const { id } = req.params;
    const { title, summary, content, category, status } = req.body;

    let updateQuery = "UPDATE blog_posts SET title=?, summary=?, content=?, category=?, status=? ";
    let params = [title, summary, content, category, status];

    if (req.file) {
      updateQuery += ", image_url=? ";
      params.push(`./assets/images/blog/${req.file.filename}`);
    }

    updateQuery += " WHERE id=?";
    params.push(id);

    const [result] = await db.query(updateQuery, params);

    if (result.affectedRows === 0) return res.status(404).json({ message: "Không tìm thấy bài viết" });
    res.json({ message: "Cập nhật thành công!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
}

async function deletePost(req, res) {
  try {
    const { id } = req.params;
    await db.query("DELETE FROM blog_posts WHERE id = ?", [id]);
    res.json({ message: "Xóa bài thành công!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
}

module.exports = { getPosts, getPostBySlug, getTrending, createPost, updatePost, deletePost };
