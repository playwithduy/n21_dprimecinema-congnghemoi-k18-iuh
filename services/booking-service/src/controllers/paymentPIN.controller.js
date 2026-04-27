const bcrypt = require("bcrypt");
const PaymentPIN = require("../models/paymentPIN.model");

// ================= SET/UPDATE PIN =================
exports.updatePIN = async (req, res) => {
    try {
        const { old_pin, pin, confirm_pin } = req.body;
        const userId = req.user.id;

        if (!pin || !confirm_pin) {
            return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin" });
        }

        // Kiểm tra xem đã có PIN chưa
        const existingPin = await PaymentPIN.getByUserId(userId);
        if (existingPin) {
            if (!old_pin) {
                return res.status(400).json({ message: "Vui lòng nhập mật mã hiện tại để xác nhận" });
            }
            const isMatch = await bcrypt.compare(old_pin, existingPin.pin_hash);
            if (!isMatch) {
                return res.status(401).json({ message: "Mật mã hiện tại không chính xác" });
            }
        }

        if (pin !== confirm_pin) {
            return res.status(400).json({ message: "Mật mã xác nhận không khớp" });
        }

        // Validate 6 digits
        if (!/^\d{6}$/.test(pin)) {
            return res.status(400).json({ message: "Mật mã phải có đúng 6 chữ số" });
        }

        // Validate no repeated digits (e.g. 111111)
        const allSame = pin.split("").every(c => c === pin[0]);
        if (allSame) {
            return res.status(400).json({ message: "Mật mã không được là 6 chữ số giống nhau (Ví dụ: 111111)" });
        }

        const pinHash = await bcrypt.hash(pin, 10);
        await PaymentPIN.setPIN(userId, pinHash);

        res.json({ message: "Cập nhật mật mã thanh toán thành công" });

    } catch (err) {
        console.error("UPDATE PIN ERROR:", err);
        res.status(500).json({ message: "Lỗi server khi cập nhật mật mã" });
    }
};

// ================= CHECK PIN EXISTS =================
exports.checkPIN = async (req, res) => {
    try {
        const userId = req.user.id;
        const pinData = await PaymentPIN.getByUserId(userId);
        
        res.json({ exists: !!pinData });
    } catch (err) {
        console.error("CHECK PIN ERROR:", err);
        res.status(500).json({ message: "Lỗi server" });
    }
};

// ================= VERIFY PIN FOR PAYMENT =================
exports.verifyPIN = async (req, res) => {
    try {
        const { pin } = req.body;
        const userId = req.user.id;

        if (!pin) {
            return res.status(400).json({ message: "Vui lòng nhập mật mã thanh toán" });
        }

        const pinData = await PaymentPIN.getByUserId(userId);
        if (!pinData) {
            return res.status(404).json({ message: "Bạn chưa cài đặt mật mã thanh toán" });
        }

        const isMatch = await bcrypt.compare(pin, pinData.pin_hash);
        if (!isMatch) {
            return res.status(401).json({ message: "Mật mã thanh toán không chính xác" });
        }

        res.json({ success: true, message: "Xác thực mật mã thành công" });

    } catch (err) {
        console.error("VERIFY PIN ERROR:", err);
        res.status(500).json({ message: "Lỗi server khi xác thực mật mã" });
    }
};
