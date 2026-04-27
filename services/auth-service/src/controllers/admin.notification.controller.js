const db = require("../config/db");

// GET /admin/notifications - Lấy tất cả thông báo đã gửi
exports.getAll = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM notifications ORDER BY created_at DESC LIMIT 100"
    );
    res.json(rows);
  } catch (err) {
    console.error("getNotifications error:", err);
    res.status(500).json({ message: "Server error: " + err.message });
  }
};

// POST /admin/notifications - Gửi thông báo mới
exports.send = async (req, res) => {
  try {
    const { title, body, target_type } = req.body;
    if (!title || !body) {
      return res.status(400).json({ message: "Thiếu tiêu đề hoặc nội dung!" });
    }

    const validTargets = ["all", "admin", "user"];
    const target = validTargets.includes(target_type) ? target_type : "all";

    // Đếm số users sẽ nhận (theo target)
    let reachCount = 0;
    if (target === "all") {
      const [[row]] = await db.query("SELECT COUNT(*) as cnt FROM users");
      reachCount = row.cnt;
    } else if (target === "user") {
      const [[row]] = await db.query("SELECT COUNT(*) as cnt FROM users WHERE role = 'user'");
      reachCount = row.cnt;
    } else if (target === "admin") {
      const [[row]] = await db.query("SELECT COUNT(*) as cnt FROM users WHERE role = 'admin'");
      reachCount = row.cnt;
    }

    const sent_by = req.user?.id || null;

    await db.query(
      "INSERT INTO notifications (title, body, target_type, sent_by, reach_count) VALUES (?, ?, ?, ?, ?)",
      [title, body, target, sent_by, reachCount]
    );

    res.status(201).json({
      message: "Đã gửi thông báo thành công!",
      reach_count: reachCount
    });
  } catch (err) {
    console.error("sendNotification error:", err);
    res.status(500).json({ message: "Server error: " + err.message });
  }
};

// DELETE /admin/notifications/:id - Xoá thông báo
exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query("DELETE FROM notifications WHERE id = ?", [id]);
    res.json({ message: "Đã xoá thông báo" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
