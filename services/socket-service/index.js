const WebSocket = require("ws");
const mysql = require("mysql2/promise");
const http = require("http");

const pool = mysql.createPool({
    host: process.env.DB_HOST || "db-main",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "root_password",
    database: process.env.DB_NAME || "booking_db",
    waitForConnections: true,
    connectionLimit: 20
});

const WS_PORT = process.env.WS_PORT || 3005;
const wss = new WebSocket.Server({ port: WS_PORT, host: "0.0.0.0" });
const rooms = new Map();

const paymentWaiters = new Map();

console.log(`🚀 WebSocket running at ws://0.0.0.0:${WS_PORT}`);

function joinRoom(showtime_id, ws) {
    showtime_id = String(showtime_id);
    if (!rooms.has(showtime_id)) rooms.set(showtime_id, new Set());
    rooms.get(showtime_id).add(ws);
    ws.showtime_id = showtime_id;
}

function leaveRoom(ws) {
    if (!ws.showtime_id) return;
    const room = rooms.get(String(ws.showtime_id));
    if (!room) return;
    room.delete(ws);
    if (room.size === 0) rooms.delete(String(ws.showtime_id));
}

function broadcast(showtime_id, payload) {
    const room = rooms.get(String(showtime_id));
    if (!room) return;
    room.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(payload));
        }
    });
}

function broadcastPaymentSuccess(booking_code, showtime_id) {
    const waiters = paymentWaiters.get(String(booking_code));
    if (waiters) {
        waiters.forEach(ws => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({
                    type: "PAYMENT_SUCCESS",
                    booking_code
                }));
            }
        });
        paymentWaiters.delete(String(booking_code));
    }

    if (showtime_id) {
        broadcast(showtime_id, {
            type: "PAYMENT_CONFIRMED",
            booking_code
        });
    }
}

global.broadcastPaymentSuccess = broadcastPaymentSuccess;

function safeJSON(msg) {
    try { return JSON.parse(msg); }
    catch { return null; }
}


async function ensureShowtimeSeats(showtime_id) {
    const [[countRow]] = await pool.query(`
        SELECT COUNT(*) AS cnt FROM booking_db.showtime_seats WHERE showtime_id = ?
    `, [showtime_id]);

    if (countRow.cnt === 0) {
        await pool.query(`
            INSERT INTO booking_db.showtime_seats (showtime_id, seat_id, status, held_by, hold_until)
            SELECT ?, sl.id, 'available', NULL, NULL
            FROM booking_db.seat_layout sl
            JOIN movie_db.showtimes st ON st.room_id = sl.room_id
            WHERE st.id = ?
        `, [showtime_id, showtime_id]);
    }
}

async function cleanupExpiredSeats(showtime_id = null) {
    if (showtime_id) {
        await pool.query(`
            UPDATE booking_db.showtime_seats
            SET status = 'available', held_by = NULL, hold_until = NULL
            WHERE showtime_id = ? AND status = 'holding'
              AND hold_until IS NOT NULL AND hold_until < NOW()
        `, [showtime_id]);
        return;
    }
    await pool.query(`
        UPDATE booking_db.showtime_seats
        SET status = 'available', held_by = NULL, hold_until = NULL
        WHERE status = 'holding' AND hold_until IS NOT NULL AND hold_until < NOW()
    `);
}

async function getSeatsOfShowtime(showtime_id) {
    console.log(`🔍 Fetching seats for showtime ${showtime_id}...`);
    const [seats] = await pool.query(`
        SELECT sl.seat_code, sl.seat_type, ss.status, ss.held_by, ss.hold_until
        FROM booking_db.showtime_seats ss
        JOIN booking_db.seat_layout sl ON ss.seat_id = sl.id
        WHERE ss.showtime_id = ?
        ORDER BY sl.seat_row, sl.seat_number
    `, [showtime_id]);

    console.log(`✅ Found ${seats.length} seats for showtime ${showtime_id}`);

    return seats.map(s => ({
        ...s,
        held_by: s.held_by ? String(s.held_by) : null
    }));
}

async function releaseSeat(showtime_id, seat_code, user_id) {
    const [r] = await pool.query(`
        UPDATE booking_db.showtime_seats ss
        JOIN booking_db.seat_layout sl ON ss.seat_id = sl.id
        SET ss.status = 'available', ss.held_by = NULL, ss.hold_until = NULL
        WHERE ss.showtime_id = ? AND sl.seat_code = ?
          AND ss.status = 'holding' AND ss.held_by = ?
    `, [String(showtime_id), String(seat_code), String(user_id)]);

    return r.affectedRows > 0;
}


wss.on("connection", (ws) => {
    ws.id = Math.random().toString(36).substring(2, 10);
    ws.isAlive = true;

    ws.on("pong", () => { ws.isAlive = true; });

    console.log("🟢 Connected:", ws.id);

    ws.on("message", async (msg) => {
        const data = safeJSON(msg);
        if (!data || !data.type) return;

        try {

            if (data.type === "JOIN_SHOWTIME") {
                console.log(`👤 JOIN_SHOWTIME: user=${data.user_id} showtime=${data.showtime_id}`);
                ws.user_id = String(data.user_id);
                ws.tab_id = String(data.tab_id);

                joinRoom(data.showtime_id, ws);

                await ensureShowtimeSeats(data.showtime_id);
                await cleanupExpiredSeats(data.showtime_id);

                const seats = await getSeatsOfShowtime(data.showtime_id);
                console.log(`📩 Sending INIT with ${seats.length} seats to user ${data.user_id}`);
                ws.send(JSON.stringify({ type: "INIT", seats }));
                return;
            }

            if (data.type === "LEAVE_SHOWTIME") {
                console.log(`👋 LEAVE_SHOWTIME user=${data.user_id} tab=${data.tab_id} (ghế GIỮ NGUYÊN)`);
                leaveRoom(ws);
                return;
            }

            if (data.type === "HOLD_SEAT") {
                const holdUntil = new Date(Date.now() + 15 * 60 * 1000);

                const [r] = await pool.query(`
                    UPDATE booking_db.showtime_seats ss
                    JOIN booking_db.seat_layout sl ON ss.seat_id = sl.id
                    SET ss.status = 'holding', ss.held_by = ?, ss.hold_until = ?
                    WHERE ss.showtime_id = ? AND sl.seat_code = ?
                      AND (
                            ss.status = 'available'
                            OR (ss.status = 'holding' AND ss.hold_until < NOW())
                            OR (ss.status = 'holding' AND ss.held_by = ?)
                          )
                `, [
                    String(data.user_id),
                    holdUntil,
                    String(data.showtime_id),
                    String(data.seat),
                    String(data.user_id)
                ]);

                if (r.affectedRows > 0) {
                    broadcast(data.showtime_id, {
                        type: "SEAT_HELD",
                        seat: data.seat,
                        holder: String(data.user_id),
                        hold_until: holdUntil
                    });
                } else {
                    ws.send(JSON.stringify({
                        type: "HOLD_FAILED",
                        seat: data.seat,
                        message: "Ghế đang được người khác giữ"
                    }));
                }
                return;
            }

            if (data.type === "RELEASE_SEAT") {
                const ok = await releaseSeat(data.showtime_id, data.seat, data.user_id);
                if (ok) {
                    broadcast(data.showtime_id, {
                        type: "SEAT_RELEASED",
                        seat: data.seat
                    });
                }
                return;
            }

            if (data.type === "BOOK_SEATS") {
                const conn = await pool.getConnection();
                try {
                    await conn.beginTransaction();

                    for (const seat of data.seats) {
                        const [r] = await conn.query(`
                            UPDATE booking_db.showtime_seats ss
                            JOIN booking_db.seat_layout sl ON ss.seat_id = sl.id
                            SET ss.status = 'booked', ss.held_by = NULL, ss.hold_until = NULL
                            WHERE ss.showtime_id = ? AND sl.seat_code = ?
                              AND ss.status = 'holding' AND ss.held_by = ?
                        `, [String(data.showtime_id), String(seat), String(data.user_id)]);

                        if (!r.affectedRows) throw new Error(`Ghế ${seat} không hợp lệ`);
                    }

                    await conn.commit();

                    ws.send(JSON.stringify({ type: "BOOKING_SUCCESS", seats: data.seats }));

                    data.seats.forEach(seat => {
                        broadcast(data.showtime_id, { type: "SEAT_BOOKED", seat });
                    });

                } catch (err) {
                    await conn.rollback();
                    ws.send(JSON.stringify({ type: "BOOKING_FAILED", message: err.message }));
                } finally {
                    conn.release();
                }
                return;
            }

            if (data.type === "WATCH_PAYMENT") {
                const code = String(data.booking_code);
                ws.watching_payment = code;
                if (!paymentWaiters.has(code)) paymentWaiters.set(code, new Set());
                paymentWaiters.get(code).add(ws);
                console.log(`👁️  WATCH_PAYMENT: ${code}`);
                return;
            }

            if (data.type === "UNWATCH_PAYMENT") {
                const code = String(data.booking_code);
                const waiters = paymentWaiters.get(code);
                if (waiters) waiters.delete(ws);
                ws.watching_payment = null;
                return;
            }

        } catch (err) {
            console.error("Server error:", err.message);
            ws.send(JSON.stringify({ type: "SERVER_ERROR", message: err.message }));
        }
    });

    ws.on("close", () => {
        console.log("🔴 Disconnected:", ws.id);
        leaveRoom(ws);

        if (ws.watching_payment) {
            const waiters = paymentWaiters.get(ws.watching_payment);
            if (waiters) waiters.delete(ws);
        }
    });
});


setInterval(async () => {
    try {
        const [expired] = await pool.query(`
            SELECT ss.showtime_id, sl.seat_code
            FROM booking_db.showtime_seats ss
            JOIN booking_db.seat_layout sl ON ss.seat_id = sl.id
            WHERE ss.status = 'holding' AND ss.hold_until < NOW()
        `);

        if (!expired.length) return;

        await pool.query(`
            UPDATE booking_db.showtime_seats
            SET status = 'available', held_by = NULL, hold_until = NULL
            WHERE status = 'holding' AND hold_until < NOW()
        `);

        expired.forEach(item => {
            broadcast(item.showtime_id, { type: "SEAT_RELEASED", seat: item.seat_code });
        });

        console.log(`⏰ Expired ${expired.length} ghế`);
    } catch (err) {
        console.error("Expire error:", err.message);
    }
}, 5000);

setInterval(() => {
    wss.clients.forEach(ws => {
        if (!ws.isAlive) return ws.terminate();
        ws.isAlive = false;
        ws.ping();
    });
}, 30000);

const internalServer = http.createServer((req, res) => {
    if (req.method === "POST" && req.url === "/internal/payment-success") {
        let body = "";
        req.on("data", chunk => { body += chunk; });
        req.on("end", () => {
            try {
                const { booking_code, showtime_id } = JSON.parse(body);
                broadcastPaymentSuccess(booking_code, showtime_id);
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ ok: true }));
            } catch (e) {
                res.writeHead(400);
                res.end(JSON.stringify({ ok: false, error: e.message }));
            }
        });
    } else {
        res.writeHead(404);
        res.end("Not found");
    }
});

const INTERNAL_PORT = process.env.INTERNAL_PORT || 3006;
internalServer.listen(INTERNAL_PORT, "0.0.0.0", () => {
    console.log(`🔗 Internal HTTP for payment notifications: port ${INTERNAL_PORT}`);
});
