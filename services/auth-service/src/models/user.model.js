const db = require("../config/db");

// ================= FIND BY EMAIL =================
exports.findByEmail = async (email) => {
  const [rows] = await db.execute(
    "SELECT * FROM users WHERE email = ? LIMIT 1",
    [email]
  );
  return rows[0];
};

// ================= FIND BY PHONE =================
exports.findByPhone = async (phone) => {
  const [rows] = await db.execute(
    "SELECT * FROM users WHERE phone = ? LIMIT 1",
    [phone]
  );
  return rows[0];
};

// ================= CREATE USER (CHỈ USER) =================
exports.create = async (user) => {
  const {
    fullname,
    phone,
    email,
    password,
    birthday,
    gender,
    region,
    favorite_cinema
  } = user;

  const [result] = await db.execute(
    `INSERT INTO users 
     (fullname, phone, email, password, birthday, gender, region, favorite_cinema, role)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'user')`,   // 👈 hardcode role
    [
      fullname,
      phone,
      email,
      password,
      birthday,
      gender,
      region,
      favorite_cinema
    ]
  );

  return result.insertId;
};

// ================= FIND BY ID =================
exports.findById = async (id) => {
  const [rows] = await db.execute(
    "SELECT * FROM users WHERE id = ? LIMIT 1",
    [id]
  );
  return rows[0];
};

// ================= UPDATE AVATAR =================
exports.updateAvatar = async (userId, avatarPath) => {
  const [result] = await db.execute(
    "UPDATE users SET avatar = ? WHERE id = ?",
    [avatarPath, userId]
  );
  return result;
};
// ================= FORGOT PASSWORD =================
exports.setResetToken = async (email, token, expiry) => {
  const [result] = await db.execute(
    "UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE email = ?",
    [token, expiry, email]
  );
  return result;
};

exports.findByResetToken = async (token) => {
  const [rows] = await db.execute(
    "SELECT * FROM users WHERE reset_token = ? LIMIT 1",
    [token]
  );
  return rows[0];
};

exports.resetPassword = async (userId, newHash) => {
  const [result] = await db.execute(
    "UPDATE users SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?",
    [newHash, userId]
  );
  return result;
};

// ================= ADMIN: QUẢN LÝ NGƯỜI DÙNG =================
exports.getAllUsers = async ({ page = 1, limit = 20, search = "" }) => {
  const offset = (page - 1) * limit;
  const searchParam = `%${search}%`;
  const [rows] = await db.query(
    `SELECT id, fullname, email, phone, role, avatar, is_active, created_at
     FROM users
     WHERE (fullname LIKE ? OR email LIKE ? OR phone LIKE ?)
     ORDER BY created_at DESC
     LIMIT ? OFFSET ?`,
    [searchParam, searchParam, searchParam, limit, offset]
  );
  const [[{ total }]] = await db.query(
    `SELECT COUNT(*) AS total FROM users
     WHERE (fullname LIKE ? OR email LIKE ? OR phone LIKE ?)`,
    [searchParam, searchParam, searchParam]
  );
  return { users: rows, total };
};

exports.updateRole = async (userId, role) => {
  const [result] = await db.execute(
    "UPDATE users SET role = ? WHERE id = ?",
    [role, userId]
  );
  return result.affectedRows;
};

exports.toggleBan = async (userId, ban) => {
  const isActive = ban ? 0 : 1; // ban=true → is_active=0
  const [result] = await db.execute(
    "UPDATE users SET is_active = ? WHERE id = ?",
    [isActive, userId]
  );
  return result.affectedRows;
};

// ================= UPDATE PROFILE =================
exports.updateProfile = async (userId, data) => {
  const {
    fullname,
    phone,
    birthday,
    gender,
    region,
    favorite_cinema,
    password // This should be already hashed if present
  } = data;

  let sql = `UPDATE users SET 
             fullname = ?, 
             phone = ?, 
             birthday = ?, 
             gender = ?, 
             region = ?, 
             favorite_cinema = ?`;
  let params = [fullname, phone, birthday, gender, region, favorite_cinema];

  if (password) {
    sql += ", password = ?";
    params.push(password);
  }

  sql += " WHERE id = ?";
  params.push(userId);

  const [result] = await db.execute(sql, params);
  return result;
};
