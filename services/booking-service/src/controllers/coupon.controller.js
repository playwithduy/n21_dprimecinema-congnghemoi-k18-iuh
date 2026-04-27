const CouponModel = require("../models/coupon.model");

// ================= REGISTER A NEW COUPON FROM MASTER POOL =================
exports.registerCoupon = async (req, res) => {
    try {
        const { code } = req.body;
        const userId = req.user.id; // From authMiddleware

        if (!code) {
            return res.status(400).json({ message: "Vui lòng nhập mã Coupon" });
        }

        // 1. Check if the code is valid in master pool
        const master = await CouponModel.findMasterByCode(code.trim().toUpperCase());
        if (!master) {
            return res.status(404).json({ message: "Mã Coupon không tồn tại hoặc đã hết hiệu lực" });
        }

        // 2. Check if the user has already claimed this specific master code
        const alreadyClaimed = await CouponModel.checkUserClaimed(userId, master.code);
        if (alreadyClaimed) {
            return res.status(400).json({ message: "Bạn đã đăng ký mã Coupon này trước đó rồi" });
        }

        // 3. Register for user with 7-day expiry
        const now = new Date();
        const expiry = new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000)); // +7 days

        await CouponModel.claimCoupon({
            user_id: userId,
            code: master.code,
            name: master.name,
            expiry_date: expiry
        });

        res.json({ 
            message: "🎉 Đăng ký mã Coupon thành công!",
            coupon: {
                name: master.name,
                expiry_date: expiry.toISOString()
            }
        });

    } catch (err) {
        console.error("REGISTER COUPON ERROR:", err);
        res.status(500).json({ message: "Lỗi server khi đăng ký Coupon" });
    }
};

// ================= GET USER'S CLAIMED COUPONS =================
exports.getMyCoupons = async (req, res) => {
    try {
        const userId = req.user.id;
        const myCoupons = await CouponModel.getByUserId(userId);

        // Map status manually if needed (check expiry)
        const now = new Date();
        const results = myCoupons.map(c => {
            let status = c.status;
            if (status === 'active' && new Date(c.expiry_date) < now) {
                status = 'expired';
            }
            return { ...c, status };
        });

        res.json(results);
    } catch (err) {
        console.error("GET MY COUPONS ERROR:", err);
        res.status(500).json({ message: "Lỗi server" });
    }
};

// ================= VALIDATE & APPLY COUPON IN CHECKOUT =================
exports.applyCoupon = async (req, res) => {
    try {
        const { code } = req.body;
        const userId = req.user.id;

        if (!code) {
            return res.status(400).json({ message: "Vui lòng nhập mã Coupon" });
        }

        const coupon = await CouponModel.findUserCouponWithDiscount(userId, code.trim().toUpperCase());
        if (!coupon) {
            return res.status(404).json({ message: "Mã Coupon không hợp lệ, đã hết hạn hoặc bạn chưa sở hữu" });
        }

        res.json({
            success: true,
            message: `Áp dụng Coupon "${coupon.name}" thành công!`,
            discount_value: coupon.discount_value,
            code: coupon.code
        });

    } catch (err) {
        console.error("APPLY COUPON ERROR:", err);
        res.status(500).json({ message: "Lỗi server khi áp dụng Coupon" });
    }
};
