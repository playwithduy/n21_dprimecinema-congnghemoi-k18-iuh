const jwt = require("jsonwebtoken");

exports.isAdmin = (req, res, next) => {
    const authHeader = req.headers.authorization;
    console.log("🛡️ AUTH CHECK - Header:", authHeader ? "Present" : "Missing");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        console.warn("❌ AUTH FAILED: No Bearer token");
        return res.status(401).json({ message: "Không có Token xác thực. Vui lòng đăng nhập!" });
    }

    const token = authHeader.split(" ")[1];
    const secret = process.env.JWT_SECRET || "dpprime_secret_2026";

    try {
        const decoded = jwt.verify(token, secret);
        console.log("✅ AUTH SUCCESS - User Role:", decoded.role);

        if (decoded.role !== "admin") {
            console.warn("❌ AUTH FAILED: Not an admin");
            return res.status(403).json({ message: "Access Denied: Bạn không phải Quản Trị Viên." });
        }
        
        req.user = decoded;
        next();
    } catch (err) {
        console.error("❌ AUTH ERROR:", err.message);
        return res.status(401).json({ message: "Token không hợp lệ hoặc đã hết hạn." });
    }
};
