// ============================================================
// payment.controller.js
// Đặt tại: services/booking-service/src/controllers/payment.controller.js
// ============================================================

const db                              = require("../config/db");
const crypto                          = require("crypto");
const { sendTicketEmail,
        sendCancelEmail }             = require("../services/email.service");  // ✅ 1 dòng duy nhất
const axios                           = require("axios");

const BANK_CONFIG = {
    bank_name:    "MB Bank",
    account_no:   "131020047979",
    account_name: "Nguyen Van Duy",
    bank_bin:     "970422",
};

function genBookingCode() {
    return "DP" + Date.now().toString(36).toUpperCase() + crypto.randomBytes(2).toString("hex").toUpperCase();
}

/* ─── Ticket Generation ────────────── */
async function generateTickets(booking_id, conn) {
    try {
        const [bookingSeats] = await conn.query(
            "SELECT booking_id, seat_id FROM booking_seats WHERE booking_id = ?",
            [booking_id]
        );
        
        const [[booking]] = await conn.query(
            "SELECT user_id, showtime_id FROM bookings WHERE id = ?",
            [booking_id]
        );

        for (const seat of bookingSeats) {
            const qr_hash = crypto.randomBytes(32).toString('hex');
            await conn.query(
                "INSERT INTO tickets (booking_id, user_id, showtime_id, seat_id, qr_hash, status) VALUES (?, ?, ?, ?, ?, 'unused')",
                [booking_id, booking.user_id, booking.showtime_id, seat.seat_id, qr_hash]
            );
        }
        console.log(`🎟️ Tickets generated for booking ${booking_id}`);
    } catch (err) {
        console.error("❌ generateTickets ERROR:", err.message);
    }
}

/* ─── Lấy thông tin showtime (gọi movie-service) ────────────── */
async function getShowtimeInfo(showtime_id) {
    try {
        const url = `http://movie-service:3002/showtimes/${showtime_id}`;
        console.log("🔗 CALLING MOVIE-SERVICE:", url);
        const response = await axios.get(url, { timeout: 3000 });
        const data = response.data;
        console.log("🎬 SHOWTIME DATA RECEIVED:", !!data);
        return data || {};
    } catch(err) {
        console.error(`❌ getShowtimeInfo ERROR [ID=${showtime_id}]:`, err.message);
        if (err.response) {
            console.error("   Response Status:", err.response.status);
            console.error("   Response Data:", err.response.data);
        }
        return {};
    }
}

/* ─── Gửi email vé (chạy nền) ───────────────────────────────── */
async function sendTicketAfterPayment({ booking_code, booking_id, user_email, showtime_id, seats, seat_total, combo_total, final_total, payment_method }) {
    try {
        if (!user_email) {
            console.warn("⚠️ Không có user_email, bỏ qua gửi email.");
            return;
        }

        const showtime = await getShowtimeInfo(showtime_id);

        const [combos] = await db.query(
            `SELECT combo_name, qty, unit_price, total_price FROM booking_combos WHERE booking_id = ?`,
            [booking_id]
        );

        console.log(`📧 Gửi email → ${user_email} (${booking_code})`);

        await sendTicketEmail({
            to:          user_email,
            booking_code,
            movie_name:  showtime.movie_name  || "",
            cinema_info: `${showtime.cinema_name || ""} • ${showtime.room_name || ""}`,
            show_time:   showtime.show_time    || "",
            seats,
            combos:      combos || [],
            seat_total,
            combo_total: combo_total || 0,
            final_total,
            payment_method,
        });
    } catch(err) {
        console.error("❌ sendTicketAfterPayment:", err.message);
    }
}

/* ─── POST /api/payment/create ──────────────────────────────── */
async function createPayment(req, res) {
    const { user_id, user_email, showtime_id, seats, seat_total, combos, combo_total, final_total, payment_method, coupon_code, discount_amount } = req.body;

    console.log("📥 createPayment:", { user_id, user_email, showtime_id, seats, payment_method, coupon_code });

    if (!seats || seats.length === 0)
        return res.status(400).json({ success: false, error: "Không có ghế được chọn" });

    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();

        // 1. Check membership discount if no coupon
        let membership_discount = 0;
        const [[user]] = await conn.query("SELECT membership_rank FROM auth_db.users WHERE id = ?", [user_id]);
        if (!coupon_code && user) {
            const rank = user.membership_rank;
            let discountPercent = 0;
            if (rank === 'Bạc') discountPercent = 0.1;
            else if (rank === 'Vàng') discountPercent = 0.2;
            else if (rank === 'Kim cương') discountPercent = 0.3;
            else if (rank === 'Ruby') discountPercent = 0.5;
            // Rank 'Đồng' is 0% discount by default (discountPercent = 0)

            if (discountPercent > 0) {
                membership_discount = Math.floor((seat_total + (combo_total || 0)) * discountPercent);
            }
        }

        const actual_discount = coupon_code ? (discount_amount || 0) : membership_discount;
        const final_amount = (seat_total + (combo_total || 0)) - actual_discount;

        // 1. Check coupon if provided
        if (coupon_code) {
            const [ucRows] = await conn.query(
                "SELECT id FROM user_coupons WHERE user_id = ? AND code = ? AND status = 'active' AND expiry_date > NOW() FOR UPDATE",
                [user_id, coupon_code]
            );
            if (ucRows.length === 0) {
                throw new Error("Mã Coupon không hợp lệ hoặc đã hết hạn");
            }
            // Mark as used
            await conn.query(
                "UPDATE user_coupons SET status = 'used' WHERE id = ?",
                [ucRows[0].id]
            );
        }

        // 2. Fetch Showtime and Seat Prices for server-side validation/calculation
        const showtime = await getShowtimeInfo(showtime_id);
        const [priceRows] = await conn.query(
            "SELECT seat_type, price FROM seat_prices WHERE showtime_id = ?",
            [showtime_id]
        );
        const prices = {};
        priceRows.forEach(p => prices[p.seat_type] = p.price);

        const centralMeta = showtime.central_metadata;
        const isCentral = (code) => {
            if (!centralMeta) return false;
            const r = code[0], n = parseInt(code.slice(1));
            return r >= centralMeta.row_start && r <= centralMeta.row_end && n >= centralMeta.num_start && n <= centralMeta.num_end;
        };

        // 3. Check seats and calculate individual prices
        const calculatedSeats = [];
        for (const seat of seats) {
            const [[row]] = await conn.query(`
                SELECT ss.status, ss.hold_until, sl.id as seat_id, sl.seat_type
                FROM showtime_seats ss
                JOIN seat_layout sl ON ss.seat_id = sl.id
                WHERE ss.showtime_id = ? AND sl.seat_code = ?
            `, [showtime_id, seat]);

            console.log(`🪑 ${seat}:`, row);
            if (!row)                     throw new Error(`Ghế ${seat} không tồn tại`);
            if (row.status === "booked")  throw new Error(`Ghế ${seat} đã được đặt`);
            if (row.status !== "holding") throw new Error(`Ghế ${seat} chưa được giữ`);
            if (new Date(row.hold_until).getTime() < Date.now()) throw new Error(`Ghế ${seat} đã hết hạn`);

            let seatPrice = prices[row.seat_type] || 0;
            if (isCentral(seat)) {
                seatPrice = Math.round(seatPrice * 1.2 / 1000) * 1000;
            }
            calculatedSeats.push({ seat_id: row.seat_id, seat_code: seat, price: seatPrice });
        }

        const booking_code   = genBookingCode();
        const payment_status = payment_method === "cash" ? "pending_cash" : "pending";

        const [bookingResult] = await conn.query(`
            INSERT INTO bookings (booking_code, user_id, user_email, showtime_id, seat_total, combo_total, final_total, payment_method, payment_status, coupon_code, discount_amount, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `, [booking_code, user_id, user_email || null, showtime_id, seat_total, combo_total || 0, final_amount, payment_method, payment_status, coupon_code || null, actual_discount]);

        const booking_id = bookingResult.insertId;

        for (const s of calculatedSeats) {
            await conn.query(
                `INSERT INTO booking_seats (booking_id, seat_id, seat_code, price) VALUES (?, ?, ?, ?)`,
                [booking_id, s.seat_id, s.seat_code, s.price]
            );
        }

        if (combos && combos.length > 0) {
            for (const c of combos) {
                await conn.query(
                    `INSERT INTO booking_combos (booking_id, combo_name, qty, unit_price, total_price) VALUES (?, ?, ?, ?, ?)`,
                    [booking_id, c.name, c.qty, c.price, c.price * c.qty]
                );
            }
        }

        // ✅ FIX: cash và vnpay đều lock ghế ngay lập tức
        // - vnpay: đã thanh toán xong mới vào đây → lock bình thường
        // - cash:  khách đặt trước, ra quầy trả sau → vẫn phải lock để
        //          không ai book trùng; thu ngân confirm hoặc admin hủy thủ công
        if (payment_method === "vnpay" || payment_method === "cash") {
            for (const seat of seats) {
                await conn.query(`
                    UPDATE showtime_seats ss JOIN seat_layout sl ON ss.seat_id = sl.id
                    SET ss.status='booked', ss.held_by=NULL, ss.hold_until=NULL
                    WHERE ss.showtime_id=? AND sl.seat_code=?
                `, [showtime_id, seat]);
            }
        }

        await conn.commit();
        console.log("✅ Booking:", booking_code, "| method:", payment_method, "| status:", payment_status);

        const response = { success: true, booking_code, booking_id };

        if (payment_method === "bank_transfer") {
            const qr_url = `https://img.vietqr.io/image/${BANK_CONFIG.bank_bin}-${BANK_CONFIG.account_no}-compact2.jpg?amount=${final_total}&addInfo=${encodeURIComponent(booking_code)}&accountName=${encodeURIComponent(BANK_CONFIG.account_name)}`;
            response.bank_info = {
                bank_name:    BANK_CONFIG.bank_name,
                account_no:   BANK_CONFIG.account_no,
                account_name: BANK_CONFIG.account_name,
                amount:       final_total,
                content:      booking_code,
                qr_url,
            };
        }

        return res.json(response);

    } catch(err) {
        await conn.rollback();
        console.error("❌ createPayment:", err.message);
        return res.status(400).json({ success: false, error: err.message });
    } finally {
        conn.release();
    }
}

/* ─── GET /api/payment/status/:booking_code ─────────────────── */
async function getPaymentStatus(req, res) {
    const { booking_code } = req.params;
    try {
        const [[booking]] = await db.query(
            `SELECT booking_code, payment_status, payment_method, final_total FROM bookings WHERE booking_code=?`,
            [booking_code]
        );
        if (!booking) return res.status(404).json({ success: false, error: "Không tìm thấy" });
        return res.json({ success: true, ...booking });
    } catch(err) {
        return res.status(500).json({ success: false, error: err.message });
    }
}

/* ─── Inventory Deduction Logic ─────────────────────────────── */
async function deductInventory(booking_id, conn) {
    try {
        console.log(`📦 Attempting to deduct inventory for booking ${booking_id}`);
        
        // 1. Lấy cinema_id từ booking (thông qua showtimes -> rooms)
        const [[bookingInfo]] = await conn.query(`
            SELECT b.id, r.cinema_id
            FROM bookings b
            JOIN movie_db.showtimes st ON b.showtime_id = st.id
            JOIN movie_db.rooms r ON st.room_id = r.id
            WHERE b.id = ?
        `, [booking_id]);

        if (!bookingInfo) return;
        const cinema_id = bookingInfo.cinema_id;

        // 2. Lấy danh sách combo trong đơn hàng
        const [bookingCombos] = await conn.query(
            "SELECT combo_name, qty FROM booking_combos WHERE booking_id = ?",
            [booking_id]
        );

        if (!bookingCombos.length) return;

        for (const bc of bookingCombos) {
            const [[combo]] = await conn.query("SELECT id FROM combos WHERE name = ?", [bc.combo_name]);
            if (!combo) continue;

            // 3. Lấy công thức (ingredients) cho combo này
            // Lấy item_name để map sang inventory_items của rạp cụ thể
            const [ingredients] = await conn.query(`
                SELECT ci.required_qty, ii_template.item_name
                FROM combo_ingredients ci
                JOIN inventory_items ii_template ON ci.item_id = ii_template.id
                WHERE ci.combo_id = ?
            `, [combo.id]);

            for (const ing of ingredients) {
                const totalDeduct = bc.qty * ing.required_qty;

                // 4. Tìm item tương ứng tại rạp này
                const [[targetItem]] = await conn.query(
                    "SELECT id FROM inventory_items WHERE cinema_id = ? AND item_name = ?",
                    [cinema_id, ing.item_name]
                );

                if (targetItem) {
                    // 5. Trừ kho rạp cụ thể
                    await conn.query(
                        "UPDATE inventory_items SET current_stock = current_stock - ? WHERE id = ?",
                        [totalDeduct, targetItem.id]
                    );

                    // 6. Ghi log xuất kho
                    await conn.query(
                        "INSERT INTO inventory_logs (item_id, cinema_id, created_by, change_qty, type, note) VALUES (?, ?, 'Hệ thống (Bán hàng)', ?, 'export', ?)",
                        [targetItem.id, cinema_id, -totalDeduct, `Xuất kho rạp #${cinema_id} cho đơn ${booking_id} (Combo: ${bc.combo_name})`]
                    );
                }
            }
        }
        console.log(`✅ Inventory deducted for booking ${booking_id} at cinema ${cinema_id}`);
    } catch (err) {
        console.error("❌ deductInventory ERROR:", err.message);
    }
}

/* ─── Membership Logic ───────────────────────────────────────── */
async function updateMembership(user_id, amount, conn) {
    try {
        console.log(`💎 Updating membership for user ${user_id} | amount: ${amount}`);
        
        // 1. Lấy thông tin hiện tại
        const [[user]] = await conn.query(
            "SELECT total_spending, membership_rank, first_transaction_date, last_transaction_date FROM auth_db.users WHERE id = ?",
            [user_id]
        );
        if (!user) return;

        let newSpending = parseFloat(user.total_spending || 0) + parseFloat(amount);
        let now = new Date();
        let firstDate = user.first_transaction_date || now;
        
        // 2. Kiểm tra reset (nếu 6 tháng không giao dịch)
        let isReset = false;
        if (user.last_transaction_date) {
            let lastDate = new Date(user.last_transaction_date);
            let diffMonths = (now.getFullYear() - lastDate.getFullYear()) * 12 + (now.getMonth() - lastDate.getMonth());
            if (diffMonths >= 6) {
                isReset = true;
                newSpending = parseFloat(amount); // Reset chi tiêu từ đầu (đơn mới)
                firstDate = now;
            }
        }

        // 3. Tính hạng mới & Điểm thưởng mới
        let newRank = 'Đồng';
        if (newSpending >= 20000000) newRank = 'Ruby';
        else if (newSpending >= 10000000) newRank = 'Kim cương';
        else if (newSpending >= 2000000) newRank = 'Vàng';
        else if (newSpending >= 500000) newRank = 'Bạc';
        else newRank = 'Đồng';

        const earnedPoints = Math.floor(amount / 100000);

        // 4. Cập nhật DB
        await conn.query(`
            UPDATE auth_db.users 
            SET total_spending = ?, 
                membership_rank = ?, 
                reward_points = reward_points + ?,
                first_transaction_date = ?, 
                last_transaction_date = NOW() 
            WHERE id = ?
        `, [newSpending, newRank, earnedPoints, firstDate, user_id]);

        console.log(`✅ Membership updated: ${user.membership_rank} -> ${newRank} | Total: ${newSpending}`);
    } catch (err) {
        console.error("❌ updateMembership ERROR:", err.message);
    }
}

/* ─── POST /api/payment/confirm-cash ────────────────────────── */
async function confirmCashPayment(req, res) {
    const { booking_code, secret } = req.body;

    if (secret !== process.env.WEBHOOK_SECRET && secret !== "dprime_webhook_2024")
        return res.status(403).json({ success: false, error: "Unauthorized" });

    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();

        const [[booking]] = await conn.query(`
            SELECT id, user_id, showtime_id, user_email, seat_total, combo_total, final_total, payment_method, payment_status
            FROM bookings WHERE booking_code=? AND payment_method='cash'
        `, [booking_code]);

        if (!booking)
            return res.status(404).json({ success: false, error: "Không tìm thấy đơn cash" });

        if (booking.payment_status === "paid") {
            await conn.rollback();
            return res.json({ success: true, message: "Đã thanh toán rồi" });
        }

        await conn.query(
            `UPDATE bookings SET payment_status='paid', paid_at=NOW() WHERE booking_code=?`,
            [booking_code]
        );

        // Deduct Inventory
        await deductInventory(booking.id, conn);

        // Generate tickets
        await generateTickets(booking.id, conn);

        // 💎 Update Membership
        await updateMembership(booking.user_id, booking.final_total, conn);

        const [seatRows] = await conn.query(
            `SELECT seat_code FROM booking_seats WHERE booking_id=?`,
            [booking.id]
        );
        const seats = seatRows.map(r => r.seat_code);

        // Ghế đã là 'booked' từ lúc tạo booking, chỉ cần xoá held_by/hold_until cho sạch
        await conn.query(`
            UPDATE showtime_seats ss JOIN booking_seats bs ON ss.seat_id = bs.seat_id
            SET ss.status='booked', ss.held_by=NULL, ss.hold_until=NULL
            WHERE bs.booking_id=? AND ss.showtime_id=?
        `, [booking.id, booking.showtime_id]);

        await conn.commit();
        console.log("✅ Cash confirmed:", booking_code);

        notifySocketService(booking_code, booking.showtime_id);

        sendTicketAfterPayment({
            booking_code,
            booking_id:     booking.id,
            user_email:     booking.user_email,
            showtime_id:    booking.showtime_id,
            seats,
            seat_total:     booking.seat_total,
            combo_total:    booking.combo_total,
            final_total:    booking.final_total,
            payment_method: booking.payment_method,
        });

        return res.json({ success: true });

    } catch(err) {
        await conn.rollback();
        console.error("❌ confirmCashPayment:", err.message);
        return res.status(500).json({ success: false, error: err.message });
    } finally {
        conn.release();
    }
}

/* ─── POST /api/payment/simulate-bank ───────────────────────── */
async function simulateBankReceived(req, res) {
    const { booking_code } = req.body;
    console.log("🧪 simulate-bank:", booking_code);

    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();

        const [[booking]] = await conn.query(`
            SELECT id, user_id, showtime_id, user_email, seat_total, combo_total, final_total, payment_method
            FROM bookings WHERE booking_code=? AND payment_status IN ('pending','pending_cash')
        `, [booking_code]);

        if (!booking) {
            await conn.rollback();
            return res.status(404).json({ success: false, error: "Không tìm thấy hoặc đã thanh toán" });
        }

        await conn.query(
            `UPDATE bookings SET payment_status='paid', paid_at=NOW() WHERE booking_code=?`,
            [booking_code]
        );

        // Deduct Inventory
        await deductInventory(booking.id, conn);

        // Generate tickets
        await generateTickets(booking.id, conn);

        // 💎 Update Membership
        await updateMembership(booking.user_id, booking.final_total, conn);

        const [seatRows] = await conn.query(
            `SELECT seat_code FROM booking_seats WHERE booking_id=?`,
            [booking.id]
        );
        const seats = seatRows.map(r => r.seat_code);

        await conn.query(`
            UPDATE showtime_seats ss JOIN booking_seats bs ON ss.seat_id=bs.seat_id
            SET ss.status='booked', ss.held_by=NULL, ss.hold_until=NULL
            WHERE bs.booking_id=? AND ss.showtime_id=?
        `, [booking.id, booking.showtime_id]);

        await conn.commit();
        notifySocketService(booking_code, booking.showtime_id);

        sendTicketAfterPayment({
            booking_code,
            booking_id:     booking.id,
            user_email:     booking.user_email,
            showtime_id:    booking.showtime_id,
            seats,
            seat_total:     booking.seat_total,
            combo_total:    booking.combo_total,
            final_total:    booking.final_total,
            payment_method: booking.payment_method,
        });

        return res.json({ success: true });

    } catch(err) {
        await conn.rollback();
        return res.status(500).json({ success: false, error: err.message });
    } finally {
        conn.release();
    }
}

/* ─── POST /api/payment/confirm-bank ────────────────────────── */
async function confirmBankPayment(req, res) {
    const { booking_code, secret } = req.body;
    if (secret !== process.env.WEBHOOK_SECRET && secret !== "dprime_webhook_2024")
        return res.status(403).json({ success: false, error: "Unauthorized" });

    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();

        const [[booking]] = await conn.query(
            `SELECT id, user_id, showtime_id, user_email, seat_total, combo_total, final_total, payment_method, payment_status FROM bookings WHERE booking_code=?`,
            [booking_code]
        );
        if (!booking) throw new Error("Không tìm thấy");
        if (booking.payment_status === "paid") {
            await conn.rollback();
            return res.json({ success: true });
        }

        await conn.query(
            `UPDATE bookings SET payment_status='paid', paid_at=NOW() WHERE booking_code=?`,
            [booking_code]
        );

        // Deduct Inventory
        await deductInventory(booking.id, conn);

        // Generate tickets
        await generateTickets(booking.id, conn);

        // 💎 Update Membership
        await updateMembership(booking.user_id, booking.final_total, conn);

        const [seatRows] = await conn.query(
            `SELECT seat_code FROM booking_seats WHERE booking_id=?`,
            [booking.id]
        );
        const seats = seatRows.map(r => r.seat_code);

        await conn.query(`
            UPDATE showtime_seats ss JOIN booking_seats bs ON ss.seat_id=bs.seat_id
            SET ss.status='booked', ss.held_by=NULL, ss.hold_until=NULL
            WHERE bs.booking_id=? AND ss.showtime_id=?
        `, [booking.id, booking.showtime_id]);

        await conn.commit();
        notifySocketService(booking_code, booking.showtime_id);

        sendTicketAfterPayment({
            booking_code,
            booking_id:     booking.id,
            user_email:     booking.user_email,
            showtime_id:    booking.showtime_id,
            seats,
            seat_total:     booking.seat_total,
            combo_total:    booking.combo_total,
            final_total:    booking.final_total,
            payment_method: booking.payment_method,
        });

        return res.json({ success: true });

    } catch(err) {
        await conn.rollback();
        return res.status(500).json({ success: false, error: err.message });
    } finally {
        conn.release();
    }
}

/* ─── POST /api/payment/sepay-webhook ───────────────────────── */
async function sepayWebhook(req, res) {
    const data = req.body;
    console.log("🔔 SEPAY WEBHOOK RECEIVED:", data);

    const content = data.content || "";
    const amount = parseFloat(data.transferAmount || data.transfer_amount || 0);

    // Trích xuất mã vé: Tìm chuỗi bắt đầu bằng DP và theo sau là các chữ cái/số (dừng lại khi gặp dấu - hoặc khoảng trắng)
    const match = content.match(/DP[A-Z0-9]+/i);
    if (!match) {
        console.warn("⚠️ Webhook SePay không tìm thấy mã vé hợp lệ trong nội dung:", content);
        return res.json({ success: false, message: "Mã vé không hợp lệ" });
    }

    let booking_code = match[0].toUpperCase();
    
    // Đảm bảo không dính ký tự lạ ở cuối
    booking_code = booking_code.trim();
    const conn = await db.getConnection();
    
    try {
        await conn.beginTransaction();

        // LOGGING TO FILE FOR DEBUGGING
        const fs = require('fs');
        const path = require('path');
        const logFile = path.join(process.cwd(), 'sepay_logs.txt');
        const logMsg = `\n[${new Date().toISOString()}] REC: ${booking_code} | AMT: ${amount}\nDATA: ${JSON.stringify(data)}\n`;
        fs.appendFileSync(logFile, logMsg);

        const [[booking]] = await conn.query(
            `SELECT id, user_id, showtime_id, user_email, seat_total, combo_total, final_total, payment_method, payment_status FROM bookings WHERE booking_code=?`,
            [booking_code]
        );

        if (!booking) {
            fs.appendFileSync(logFile, `❌ ERROR: Không tìm thấy mã vé ${booking_code}\n`);
            throw new Error("Không tìm thấy mã vé: " + booking_code);
        }

        if (booking.payment_status === "paid") {
            fs.appendFileSync(logFile, `ℹ️ INFO: Vé ${booking_code} đã thanh toán trước đó.\n`);
            await conn.rollback();
            return res.json({ success: true, message: "Vé đã được thanh toán trước đó" });
        }

        // So sánh số tiền (cho phép sai số 1000đ để tránh các vấn đề về làm tròn)
        const diff = Math.abs(parseFloat(booking.final_total) - amount);
        if (diff > 1000) {
            fs.appendFileSync(logFile, `❌ ERROR: Sai số tiền. Vé: ${booking.final_total} | Nhận: ${amount} | Lệch: ${diff}\n`);
            console.error(`❌ Sai số tiền: Vé ${booking.final_total}đ | Chuyển ${amount}đ`);
            await conn.rollback();
            return res.status(400).json({ success: false, message: "Sai số tiền thanh toán" });
        }

        await conn.query(
            `UPDATE bookings SET payment_status='paid', paid_at=NOW(), payment_note='SePay Auto Confirmed' WHERE booking_code=?`,
            [booking_code]
        );

        await deductInventory(booking.id, conn);
        await generateTickets(booking.id, conn);
        await updateMembership(booking.user_id, booking.final_total, conn);

        const [seatRows] = await conn.query(
            `SELECT seat_code FROM booking_seats WHERE booking_id=?`,
            [booking.id]
        );
        const seats = seatRows.map(r => r.seat_code);

        await conn.query(`
            UPDATE showtime_seats ss JOIN booking_seats bs ON ss.seat_id=bs.seat_id
            SET ss.status='booked', ss.held_by=NULL, ss.hold_until=NULL
            WHERE bs.booking_id=? AND ss.showtime_id=?
        `, [booking.id, booking.showtime_id]);

        await conn.commit();
        
        notifySocketService(booking_code, booking.showtime_id);

        sendTicketAfterPayment({
            booking_code,
            booking_id:     booking.id,
            user_email:     booking.user_email,
            showtime_id:    booking.showtime_id,
            seats,
            seat_total:     booking.seat_total,
            combo_total:    booking.combo_total,
            final_total:    booking.final_total,
            payment_method: booking.payment_method,
        });

        console.log(`✅ SEPAY CONFIRMED SUCCESS: ${booking_code}`);
        return res.json({ success: true });

    } catch (err) {
        if (conn) await conn.rollback();
        console.error("❌ sepayWebhook ERROR:", err.message);
        return res.status(500).json({ success: false, error: err.message });
    } finally {
        if (conn) conn.release();
    }
}

/* ─── Notify socket service ─────────────────────────────────── */
function notifySocketService(booking_code, showtime_id) {
    try {
        const http = require("http");
        const body = JSON.stringify({ booking_code, showtime_id });
        const r = http.request({
            hostname: "socket-service", port: 3006,
            path: "/internal/payment-success", method: "POST",
            headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(body) }
        }, () => {});
        r.on("error", () => {});
        r.write(body);
        r.end();
        console.log("📡 Notified socket:", booking_code);
    } catch(e) {}
}

/* ─── GET /api/payment/my-tickets/:user_id ──────────────────── */
async function getMyTickets(req, res) {
    const { user_id } = req.params;

    if (!user_id)
        return res.status(400).json({ success: false, error: "Thiếu user_id" });

    try {
        console.log(`🔍 Fetching tickets for user_id: ${user_id}`);
        const [bookings] = await db.query(`
            SELECT 
                id, booking_code, showtime_id,
                seat_total, combo_total, final_total,
                payment_method, payment_status,
                created_at, paid_at
            FROM bookings
            WHERE user_id = ?
            ORDER BY created_at DESC
        `, [user_id]);

        console.log(`📊 Found ${bookings.length} bookings for user ${user_id}`);

        if (!bookings.length)
            return res.json({ success: true, tickets: [] });

        const tickets = await Promise.all(bookings.map(async (b) => {
            const showtimeInfo = await getShowtimeInfo(b.showtime_id);

            const [seatRows] = await db.query(
                "SELECT seat_code FROM booking_seats WHERE booking_id = ?",
                [b.id]
            );

            const [comboRows] = await db.query(
                "SELECT combo_name, qty, unit_price, total_price FROM booking_combos WHERE booking_id = ?",
                [b.id]
            );

            const [ticketRows] = await db.query(
                "SELECT id, qr_hash FROM tickets WHERE booking_id = ?",
                [b.id]
            );

            return {
                ...b,
                movie_name:  showtimeInfo.movie_name  || "---",
                cinema_name: showtimeInfo.cinema_name || "---",
                room_name:   showtimeInfo.room_name   || "",
                show_time:   showtimeInfo.show_time   || "---",
                seats:  seatRows.map(r => r.seat_code),
                combos: comboRows || [],
                ticket_details: ticketRows // Thêm danh sách ticket_id và qr_hash
            };
        }));

        return res.json({ success: true, tickets });

    } catch(err) {
        console.error("❌ getMyTickets:", err);
        return res.status(500).json({ success: false, error: err.message });
    }
}

/* ─── POST /api/payment/cancel/:booking_code ────────────────── */
async function cancelPayment(req, res) {
    const { booking_code } = req.params;

    if (!booking_code)
        return res.status(400).json({ success: false, error: "Thiếu mã đặt vé." });

    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();

        const [[booking]] = await conn.query(`
            SELECT id, showtime_id, user_email, seat_total, combo_total,
                   final_total, payment_method, payment_status
            FROM bookings
            WHERE booking_code = ?
            LIMIT 1
        `, [booking_code]);

        if (!booking) {
            await conn.rollback();
            return res.status(404).json({ success: false, error: "Không tìm thấy vé." });
        }

        if (!["pending", "pending_cash"].includes(booking.payment_status)) {
            await conn.rollback();
            return res.status(400).json({
                success: false,
                error: `Vé đang ở trạng thái "${booking.payment_status}", không thể hủy.`,
            });
        }

        const [seatRows] = await conn.query(
            `SELECT seat_code FROM booking_seats WHERE booking_id = ?`,
            [booking.id]
        );
        const seats = seatRows.map(r => r.seat_code);

        await conn.query(`
            UPDATE showtime_seats ss
            JOIN booking_seats bs ON ss.seat_id = bs.seat_id
            SET ss.status = 'available', ss.held_by = NULL, ss.hold_until = NULL
            WHERE bs.booking_id = ? AND ss.showtime_id = ?
        `, [booking.id, booking.showtime_id]);

        await conn.query(`
            UPDATE bookings
            SET payment_status = 'cancelled', updated_at = NOW()
            WHERE booking_code = ?
        `, [booking_code]);

        await conn.commit();
        console.log("✅ Cancelled:", booking_code);

        notifySocketService(booking_code, booking.showtime_id);

        if (booking.user_email) {
            sendCancelEmail({
                to:          booking.user_email,
                booking_code,
                seats,
                final_total: booking.final_total,
            }).catch(err => console.error("❌ sendCancelEmail:", err.message));
        }

        return res.json({ success: true, message: "Hủy vé thành công." });

    } catch (err) {
        await conn.rollback();
        console.error("❌ cancelPayment:", err.message);
        return res.status(500).json({ success: false, error: err.message });
    } finally {
        conn.release();
    }
}

/* ─── Exports ────────────────────────────────────────────────── */
module.exports = {
    createPayment,
    getPaymentStatus,
    confirmBankPayment,
    confirmCashPayment,
    simulateBankReceived,
    getMyTickets,
    cancelPayment,
    sepayWebhook,
};