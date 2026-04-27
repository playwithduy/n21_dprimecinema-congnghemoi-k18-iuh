const User = require("../models/user.model");

// GET /api/auth/admin/users?page=1&limit=20&search=xxx
exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = "" } = req.query;
    const result = await User.getAllUsers({
      page: parseInt(page),
      limit: parseInt(limit),
      search,
    });
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// PUT /api/auth/admin/users/:id/role
exports.updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    if (!["admin", "user"].includes(role)) {
      return res.status(400).json({ message: "Role không hợp lệ. Chỉ chấp nhận: admin, user" });
    }
    const affected = await User.updateRole(id, role);
    if (!affected) return res.status(404).json({ message: "Không tìm thấy user" });
    res.json({ message: `Đã cập nhật role thành '${role}'` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// PATCH /api/auth/admin/users/:id/ban
exports.toggleBan = async (req, res) => {
  try {
    const { id } = req.params;
    const { ban } = req.body; // true = cấm, false = mở
    const affected = await User.toggleBan(id, ban);
    if (!affected) return res.status(404).json({ message: "Không tìm thấy user" });
    res.json({ message: ban ? "Đã khoá tài khoản" : "Đã mở khoá tài khoản" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
};
