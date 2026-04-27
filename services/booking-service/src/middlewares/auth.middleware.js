const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: "Thiếu token" });
    }

    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Token sai định dạng" });
    }

    const token = authHeader.split(" ")[1];

    // Lấy secret từ env của service (trong trường hợp này là booking-service)
    // Phải khớp với JWT_SECRET trong auth-service (dpprime_secret_2026)
    const secret = process.env.JWT_SECRET || "dpprime_secret_2026";

    const decoded = jwt.verify(token, secret);

    req.user = decoded; // {id, email, role}
    next();

  } catch (err) {
    console.error("❌ JWT VERIFY ERROR:", err.message);
    return res.status(401).json({ message: "Token không hợp lệ" });
  }
};
