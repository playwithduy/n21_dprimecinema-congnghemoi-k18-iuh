const pool = require("../config/db");

// ===================================================================
// Seat Recommender Service — Thuật toán chấm điểm và gợi ý ghế
// AI tự động phân tích sơ đồ rạp để chọn vị trí "vàng" cho người dùng
// ===================================================================

/**
 * Thuật toán Seat Scoring Algorithm
 * @param {number} showtimeId 
 * @param {Object} options { quantity, preference }
 */
async function recommendSeats(showtimeId, options = {}) {
    const { quantity = 1, preference = 'center' } = options;
    
    // 1. Lấy sơ đồ ghế và trạng thái hiện tại
    const [seats] = await pool.query(`
        SELECT 
            sl.id AS seat_id,
            sl.seat_code,
            sl.seat_row,
            sl.seat_number,
            sl.seat_type,
            ss.status,
            ss.held_by,
            sp.price
        FROM booking_db.showtime_seats ss
        JOIN booking_db.seat_layout sl ON ss.seat_id = sl.id
        LEFT JOIN booking_db.seat_prices sp ON ss.showtime_id = sp.showtime_id AND sl.seat_type = sp.seat_type
        WHERE ss.showtime_id = ?
        ORDER BY sl.seat_row, sl.seat_number
    `, [showtimeId]);
    
    if (seats.length === 0) return [];

    // Phân nhóm ghế theo hàng để tính toán ghế liên tiếp
    const rows = {};
    seats.forEach(s => {
        if (!rows[s.seat_row]) rows[s.seat_row] = [];
        rows[s.seat_row].push(s);
    });

    // 2. Chấm điểm từng ghế (Scoring)
    const scoredSeats = seats.map(seat => {
        // Nếu ghế không trống → điểm cực thấp (loại bỏ)
        if (seat.status !== 'available') return { ...seat, score: -1000 };

        let score = 0;

        // A. Điểm hàng (Row Score) - Khoảng cách tới màn hình
        // Giả sử rạp có hàng A-J. Hàng E, F, G (giữa rạp) là tốt nhất.
        const rowChar = seat.seat_row.toUpperCase();
        const rowScores = { 'E': 100, 'F': 100, 'G': 90, 'D': 80, 'H': 70, 'C': 60, 'I': 50, 'B': 40, 'A': 20, 'J': 30 };
        score += (rowScores[rowChar] || 0) * 0.4;

        // B. Điểm vị trí ngang (Center Score)
        // Ghế số 5-8 thường là trung tâm.
        const num = seat.seat_number;
        const centerDist = Math.abs(num - 7); // Giả sử trung tâm là số 7
        const centerScore = Math.max(0, 100 - centerDist * 15);
        score += centerScore * 0.4;

        // C. Điểm loại ghế
        if (seat.seat_type === 'vip') score += 20;
        if (preference === 'couple' && seat.seat_type === 'sweetbox') score += 500; // Ưu tiên cực cao nếu yêu cầu ghế đôi

        // D. Điểm mật độ (Density Score) - Ưu tiên chỗ vắng nếu là 'quiet'
        if (preference === 'quiet') {
            const surrounding = seats.filter(s => 
                s.seat_row === seat.seat_row && Math.abs(s.seat_number - seat.seat_number) === 1
            );
            const occupiedCount = surrounding.filter(s => s.status !== 'available').length;
            score += (2 - occupiedCount) * 30;
        }

        return { ...seat, score };
    });

    // 3. Tìm nhóm ghế liên tiếp tốt nhất (nếu quantity > 1)
    let bestGroup = [];
    let maxGroupScore = -Infinity;

    for (const rowName in rows) {
        const rowSeats = scoredSeats.filter(s => s.seat_row === rowName);
        
        for (let i = 0; i <= rowSeats.length - quantity; i++) {
            const group = rowSeats.slice(i, i + quantity);
            
            // Kiểm tra xem cả nhóm có trống không
            if (group.every(s => s.status === 'available')) {
                // Tính điểm trung bình của nhóm + điểm thưởng liên tiếp
                const groupScore = group.reduce((sum, s) => sum + s.score, 0) / quantity;
                
                if (groupScore > maxGroupScore) {
                    maxGroupScore = groupScore;
                    bestGroup = group;
                }
            }
        }
    }

    return bestGroup.map(s => ({
        seat_id: s.seat_id,
        seat_code: s.seat_code,
        seat_type: s.seat_type,
        price: Number(s.price) || 0,
        score: s.score
    }));
}

/**
 * Lấy sơ đồ ghế đầy đủ để hiển thị trực quan
 */
async function getSeatMap(showtimeId) {
    const [seats] = await pool.query(`
        SELECT 
            sl.id AS seat_id,
            sl.seat_code,
            sl.seat_row,
            sl.seat_number,
            sl.seat_type,
            ss.status,
            sp.price
        FROM booking_db.showtime_seats ss
        JOIN booking_db.seat_layout sl ON ss.seat_id = sl.id
        LEFT JOIN booking_db.seat_prices sp ON ss.showtime_id = sp.showtime_id AND sl.seat_type = sp.seat_type
        WHERE ss.showtime_id = ?
        ORDER BY sl.seat_row ASC, sl.seat_number ASC
    `, [showtimeId]);

    // Phân nhóm theo hàng để Frontend dễ vẽ
    const layout = {};
    seats.forEach(s => {
        if (!layout[s.seat_row]) layout[s.seat_row] = [];
        layout[s.seat_row].push({
            ...s,
            price: Number(s.price) || 0
        });
    });

    return layout;
}

/**
 * Giữ chỗ ghế (Hold) để đồng bộ Real-time
 */
async function holdSeats(showtimeId, seatIds, userId = 'voice-assistant') {
    if (!seatIds || seatIds.length === 0) return;
    
    await pool.query(`
        UPDATE booking_db.showtime_seats 
        SET status = 'holding', held_by = ?, hold_until = DATE_ADD(NOW(), INTERVAL 15 MINUTE)
        WHERE showtime_id = ? AND seat_id IN (?) AND status = 'available'
    `, [userId, showtimeId, seatIds]);
}

/**
 * Giải phóng ghế
 */
async function releaseSeats(showtimeId, userId = 'voice-assistant') {
    await pool.query(`
        UPDATE booking_db.showtime_seats 
        SET status = 'available', held_by = NULL, hold_until = NULL
        WHERE showtime_id = ? AND held_by = ? AND status = 'holding'
    `, [showtimeId, userId]);
}

module.exports = {
    recommendSeats,
    getSeatMap,
    holdSeats,
    releaseSeats
};
