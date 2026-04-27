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

    if (!process.env.JWT_SECRET) {
      console.error("❌ JWT_SECRET undefined");
      return res.status(500).json({ message: "Server config error" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded; // {id, email, role}
    next();

  } catch (err) {
    console.error("❌ JWT VERIFY ERROR:", err.message);
    return res.status(401).json({ message: "Token không hợp lệ" });
  }
};