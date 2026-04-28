// ===================================================================
// Time Parser — Phân tích thời gian tự nhiên tiếng Việt
// Chuyển các cụm từ như "tối nay", "ngày mai", "cuối tuần", 
// "sau 7 giờ tối" thành giá trị date/time cụ thể
// ===================================================================

/**
 * Parse thời gian từ ngôn ngữ tự nhiên tiếng Việt
 * @param {string} text - Chuỗi chứa thông tin thời gian
 * @returns {{ date: string|null, time_range: {from: string, to: string}|null, specific_time: string|null }}
 */
function parseVietnameseTime(text) {
    // Ép múi giờ về Việt Nam (GMT+7) để tránh lệch ngày khi chạy trên server UTC
    const now = new Date(new Date().toLocaleString("en-US", {timeZone: "Asia/Ho_Chi_Minh"}));
    const result = {
        date: null,           // YYYY-MM-DD
        time_range: null,     // { from: "HH:mm", to: "HH:mm" }
        specific_time: null,  // "HH:mm"
        day_of_week: null     // 0-6 (CN-T7)
    };

    const lower = text.toLowerCase().trim();

    // ==================== PARSE NGÀY ====================

    // "hôm nay" / "today"
    if (/hôm nay|hôm\s*nay|today|bữa nay/.test(lower)) {
        result.date = formatDate(now);
    }

    // "ngày mai" / "mai" / "tomorrow"
    if (/ngày mai|ngày\s*mai|mai|tomorrow/.test(lower)) {
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        result.date = formatDate(tomorrow);
    }

    // "ngày mốt" / "ngày kia"
    if (/ngày mốt|mốt|ngày kia/.test(lower)) {
        const dayAfter = new Date(now);
        dayAfter.setDate(dayAfter.getDate() + 2);
        result.date = formatDate(dayAfter);
    }

    // "cuối tuần" / "weekend"
    if (/cuối tuần|cuối\s*tuần|weekend/.test(lower)) {
        const dayOfWeek = now.getDay(); // 0=CN, 6=T7
        let daysToSat = (6 - dayOfWeek + 7) % 7;
        if (daysToSat === 0 && now.getHours() > 22) daysToSat = 7;
        const saturday = new Date(now);
        saturday.setDate(saturday.getDate() + (daysToSat || 7));
        result.date = formatDate(saturday);
    }

    // "thứ hai/ba/tư/năm/sáu/bảy", "chủ nhật"
    const dayMap = {
        "chủ nhật": 0, "cn": 0,
        "thứ hai": 1, "thứ 2": 1,
        "thứ ba": 2, "thứ 3": 2,
        "thứ tư": 3, "thứ 4": 3,
        "thứ năm": 4, "thứ 5": 4,
        "thứ sáu": 5, "thứ 6": 5,
        "thứ bảy": 6, "thứ 7": 6, "thứ bẩy": 6
    };

    for (const [key, dayIdx] of Object.entries(dayMap)) {
        if (lower.includes(key)) {
            const currentDay = now.getDay();
            let diff = (dayIdx - currentDay + 7) % 7;
            if (diff === 0) diff = 7; // Nếu trùng ngày → tuần sau
            const target = new Date(now);
            target.setDate(target.getDate() + diff);
            result.date = formatDate(target);
            result.day_of_week = dayIdx;
            break;
        }
    }

    // Ngày cụ thể: "ngày 9 tháng 5 năm 2026", "ngày 15/5", "15-05"
    const fullDateMatch = lower.match(/ngày\s*(\d{1,2})(?:\s*tháng\s*(\d{1,2}))?(?:\s*năm\s*(\d{4}))?/);
    const slashDateMatch = lower.match(/(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{4}))?/);
    
    const dateMatch = fullDateMatch || slashDateMatch;
    if (dateMatch) {
        const day = parseInt(dateMatch[1]);
        const month = dateMatch[2] ? parseInt(dateMatch[2]) - 1 : now.getMonth();
        const year = dateMatch[3] ? parseInt(dateMatch[3]) : now.getFullYear();
        
        const target = new Date(year, month, day);
        result.date = formatDate(target);
    }

    // ==================== PARSE GIỜ ====================

    // "tối" / "tối nay" → 18:00-23:00
    if (/\btối\b/.test(lower)) {
        result.time_range = { from: "18:00", to: "23:00" };
    }

    // "sáng" → 08:00-12:00  
    if (/\bsáng\b/.test(lower)) {
        result.time_range = { from: "08:00", to: "12:00" };
    }

    // "trưa" → 11:00-14:00
    if (/\btrưa\b/.test(lower)) {
        result.time_range = { from: "11:00", to: "14:00" };
    }

    // "chiều" → 14:00-18:00
    if (/\bchiều\b/.test(lower)) {
        result.time_range = { from: "14:00", to: "18:00" };
    }

    // Giờ cụ thể: "19h", "19 giờ", "7 giờ tối", "19h30", "18:30", "lúc 20h"
    const timeMatch = lower.match(/(?:lúc\s*)?(\d{1,2})\s*(?:h|giờ|:)\s*(\d{0,2})?\s*(sáng|chiều|tối)?/);
    if (timeMatch) {
        let hour = parseInt(timeMatch[1]);
        const minute = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
        const period = timeMatch[3];

        if (period === "chiều" || period === "tối") {
            if (hour < 12) hour += 12;
        } else if (period === "sáng") {
            if (hour === 12) hour = 0;
        } else {
            // Nếu không có AM/PM, giờ < 8 → cộng 12 (giả sử PM)
            if (hour > 0 && hour < 8) hour += 12;
        }

        result.specific_time = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
    }

    // "sau X giờ" / "sau Xh"
    const afterMatch = lower.match(/sau\s*(\d{1,2})\s*(?:h|giờ)\s*(\d{0,2})?\s*(sáng|chiều|tối)?/);
    if (afterMatch) {
        let hour = parseInt(afterMatch[1]);
        const minute = afterMatch[2] ? parseInt(afterMatch[2]) : 0;
        const period = afterMatch[3];

        if (period === "chiều" || period === "tối") {
            if (hour < 12) hour += 12;
        } else if (!period && hour < 8) {
            hour += 12;
        }

        result.time_range = {
            from: `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`,
            to: "23:59"
        };
    }

    // "suất chiếu sớm" / "suất sớm" / "suất đầu"
    if (/suất\s*(chiếu\s*)?(sớm|đầu|đầu tiên)|sớm nhất/.test(lower)) {
        result.time_range = { from: "00:00", to: "23:59" };
        result._prefer = "earliest";
    }

    // "suất cuối" / "suất chiếu cuối"
    if (/suất\s*(chiếu\s*)?(cuối|cuối cùng|muộn)|muộn nhất/.test(lower)) {
        result.time_range = { from: "00:00", to: "23:59" };
        result._prefer = "latest";
    }

    // Default: nếu chưa có date → hôm nay
    if (!result.date) {
        result.date = formatDate(now);
        result.is_default_date = true;
    } else {
        result.is_default_date = false;
    }

    return result;
}

/**
 * Format Date → YYYY-MM-DD
 */
function formatDate(d) {
    return d.getFullYear() + "-" +
        String(d.getMonth() + 1).padStart(2, "0") + "-" +
        String(d.getDate()).padStart(2, "0");
}

/**
 * Lấy tên ngày tiếng Việt
 */
function getDayNameVi(dateStr) {
    const d = new Date(dateStr);
    const days = ["Chủ nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
    return days[d.getDay()];
}

/**
 * Format ngày cho hiển thị
 */
function formatDateDisplay(dateStr) {
    const d = new Date(dateStr);
    return `${getDayNameVi(dateStr)}, ${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
}

module.exports = {
    parseVietnameseTime,
    formatDate,
    getDayNameVi,
    formatDateDisplay
};
