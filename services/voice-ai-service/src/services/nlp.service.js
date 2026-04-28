const { GoogleGenerativeAI } = require("@google/generative-ai");
const timeParser = require("../utils/time-parser");

// Helper to remove Vietnamese diacritics
function removeVietnameseDiacritics(str) {
    if (!str) return "";
    return str
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/Đ/g, "D");
}

// ===================================================================
// NLP Service — Xử lý ngôn ngữ tự nhiên bằng Google Gemini
// Chuyển đổi văn bản thô từ Speech-to-Text thành cấu trúc Intent/Entities
// ===================================================================

async function parseIntent(text, history = []) {
    const lowerText = text.toLowerCase();
    const cleanText = removeVietnameseDiacritics(lowerText);
    const hasKey = !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "YOUR_GEMINI_API_KEY_HERE";

    // 1. Kiểm tra Fallback nhanh bằng Regex (Tránh gọi AI nếu là các câu lệnh cơ bản, số thứ tự, giờ giấc, hoặc chọn ghế)
    const isSeatQuery = /\b(ghế|chỗ|ngồi|hàng|màn hình)\b/i.test(lowerText) || /\b(ghe|cho|ngoi|hang|man hinh)\b/i.test(cleanText) || /\b[a-z]\d{1,2}\b/i.test(lowerText);
    const isComboQuery = /\b(bắp|nước|combo|ngô|nước ngọt|thêm|đồ ăn)\b/i.test(lowerText) || /\b(bap|nuoc|combo|ngo|nuoc ngot|them|do an)\b/i.test(cleanText);
    const isTimeQuery = /\d{1,2}(?::|h| giờ)/i.test(lowerText) || /\d{1,2}(?::|h| gio)/i.test(cleanText);
    const isBasicQuery = /\b(lịch chiếu|phim đang chiếu|có phim gì|danh sách phim|đặt vé|mua vé|hủy|thôi)\b/i.test(lowerText) || 
                         /\b(lich chieu|phim dang chieu|co phim gi|danh sach phim|dat ve|mua ve|huy|thoi)\b/i.test(cleanText) || 
                         ((/\b(ok|đồng ý|xác nhận|đúng rồi|đặt luôn)\b/i.test(lowerText) || /\b(ok|dong y|xac nhan|dung roi|dat luon)\b/i.test(cleanText)) && !isComboQuery);

    if (!hasKey || isBasicQuery || isTimeQuery || isSeatQuery || isComboQuery || /\b(chọn|chon|số|so|thứ|thu)\b/i.test(cleanText)) {
        console.log("ℹ️ Using Regex NLP for basic/fallback query");
        let intent = "OTHER";
        let confidence = 0.9;
        let index = null;
        let specific_time = null;
        let seat_preference = "center";
        let combos_extracted = [];

        // Trích xuất sở thích ghế
        if (/\b(gần màn hình|hàng đầu|phía trước)\b/i.test(lowerText) || /\b(gan man hinh|hang dau|phia truoc)\b/i.test(cleanText)) seat_preference = "front";
        else if (/\b(hàng cuối|phía sau|xa màn hình)\b/i.test(lowerText) || /\b(hang cuoi|phia sau|xa man hinh)\b/i.test(cleanText)) seat_preference = "back";
        else if (/\b(vip)\b/i.test(lowerText)) seat_preference = "vip";
        else if (/\b(đôi|couple)\b/i.test(lowerText) || /\b(doi|couple)\b/i.test(cleanText)) seat_preference = "couple";

        // Trích xuất số thứ tự
        const matchIndex = lowerText.match(/(?:số|thứ)\s*(\d+)/i) || cleanText.match(/(?:so|thu)\s*(\d+)/i);
        if (matchIndex) index = parseInt(matchIndex[1]);

        // Trích xuất giờ
        const matchTime = lowerText.match(/(\d{1,2}(?::\d{2})?\s*(?:h|giờ|:))/i) || 
                          cleanText.match(/(\d{1,2}(?::\d{2})?\s*(?:h|gio|:))/i) || 
                          lowerText.match(/(\d{1,2}:\d{2})/);
        if (matchTime) specific_time = matchTime[0];

        // Trích xuất combos bằng regex
        const comboPatterns = [
            { name: "solo", regex: /(?:(\d+)\s*(?:combo\s*)?solo|solo\s*(?:x|số lượng|so luong)?\s*(\d+))/gi },
            { name: "couple", regex: /(?:(\d+)\s*(?:combo\s*)?couple|couple\s*(?:x|số lượng|so luong)?\s*(\d+))/gi },
            { name: "bắp nước", regex: /(?:(\d+)\s*(?:bắp|bap)\s*(?:nước|nuoc)|(?:bắp|bap)\s*(?:nước|nuoc)\s*(\d+))/gi },
            { name: "bắp", regex: /(?:(\d+)\s*(?:bắp|bap)|(?:bắp|bap)\s*(\d+))/gi },
            { name: "nước", regex: /(?:(\d+)\s*(?:nước|nuoc)|(?:nước|nuoc)\s*(\d+))/gi }
        ];

        for (const item of comboPatterns) {
            let match;
            while ((match = item.regex.exec(cleanText)) !== null) {
                const qty = parseInt(match[1] || match[2] || "1");
                combos_extracted.push({
                    name: item.name,
                    quantity: qty
                });
            }
        }

        if (combos_extracted.length === 0 && isComboQuery) {
            const generalQtyMatch = cleanText.match(/(\d+)\s*(?:cái|cai|phần|phan|combo|hộp|hop|ly)/i) || cleanText.match(/(?:thêm|them|lấy|lay)\s*(\d+)/i);
            const quantity = generalQtyMatch ? parseInt(generalQtyMatch[1]) : 1;
            if (/solo/i.test(cleanText)) {
                combos_extracted.push({ name: "solo", quantity });
            } else if (/couple/i.test(cleanText)) {
                combos_extracted.push({ name: "couple", quantity });
            } else {
                combos_extracted.push({ name: "combo", quantity });
            }
        }

        // Định nghĩa đối tượng entities tránh ReferenceError
        const entities = {
            movie_name: "", 
            index: index,
            specific_time: specific_time,
            seat_preference: seat_preference,
            seat_codes: [],
            combos_extracted: combos_extracted,
            time_extracted: timeParser.parseVietnameseTime(text)
        };

        if (/\b(lịch chiếu|lich chieu|phim đang chiếu|phim dang chieu|có phim gì|co phim gi|danh sách phim|danh sach phim)\b/i.test(cleanText)) {
            intent = "CHECK_SCHEDULE";
        } else if (isTimeQuery) {
            intent = "SELECT_SHOWTIME";
        } else if (isSeatQuery) {
            intent = "SELECT_SEAT";
            // Trích xuất toàn bộ mã ghế dạng [A-Z][0-9]{1,2}
            const codes = cleanText.match(/[a-z]\d{1,2}/gi);
            if (codes) entities.seat_codes = codes.map(c => c.toUpperCase());
        } else if (isComboQuery) {
            intent = "SELECT_COMBO";
        } else if (/\b(chọn|chon|số|so|thứ|thu)\b/i.test(cleanText)) {
            intent = "SELECT_MOVIE";
        } else if (/\b(đặt vé|dat ve|mua vé|mua ve|lấy vé|lay ve)\b/i.test(cleanText)) {
            intent = "BOOK_TICKET";
        } else if (/\b(hủy|huy|thôi|thoi|không đặt nữa|khong dat nua)\b/i.test(cleanText)) {
            intent = "CANCEL";
        } else if (/\b(xác nhận|xac nhan|đồng ý|dong y|đúng rồi|dung roi|ok|đặt luôn|dat luon)\b/i.test(cleanText)) {
            intent = "CONFIRM";
        }

        if (intent !== "OTHER") {
            return {
                intent,
                entities: entities,
                confidence: 0.9
            };
        }
        
        // Nếu không có key và cũng không match regex -> đành chịu
        if (!hasKey) {
            return { intent: "OTHER", entities: {}, confidence: 0 };
        }
    }

    // 2. Sử dụng Gemini AI cho các câu phức tạp
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ 
        model: "gemini-2.0-flash",
        generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `
    Bạn là trợ lý ảo chuyên nghiệp của rạp phim D-PRIME CINEMA.
    Nhiệm vụ: Phân tích câu nói của người dùng và trả về JSON chính xác.

    QUY TẮC PHÂN TÍCH:
    - SEARCH_MOVIE: Khi người dùng hỏi "Phim gì đang chiếu", "Hôm nay có phim gì", "Tìm phim hành động", "Cho tôi danh sách phim".
    - CHECK_SCHEDULE: Khi người dùng hỏi "Xem lịch chiếu", "Lịch chiếu hôm nay thế nào", "Mấy giờ có phim", "Xem lịch phim hiện có".
    - BOOK_TICKET: Khi người dùng nói "Đặt vé", "Mua vé", "Lấy vé" kèm tên phim hoặc thời gian.
    - SELECT_MOVIE: Khi người dùng chọn phim từ danh sách (VD: "chọn phim thứ nhất", "lấy phim số 1", "xem phim đầu"). Trích xuất số thứ tự vào entities.index (nếu có).
    - SELECT_SHOWTIME: Khi người dùng nói giờ (ví dụ: "suất 8 giờ", "lúc 20h", "chọn suất chiều").
    - SELECT_SEAT: Khi người dùng nói về vị trí ghế ("ghế giữa", "hàng E", "2 ghế", "chỗ ngồi") hoặc mã ghế cụ thể ("ghế A1", "lấy A1, A2"). Trích xuất toàn bộ mã ghế vào entities.seat_codes.
    - SELECT_COMBO: Khi người dùng nói về bắp nước ("mua thêm bắp", "lấy 2 nước ngọt", "chọn combo 1", "lấy 2 combo solo và 1 combo couple"). Trích xuất số thứ tự combo vào entities.index và danh sách các combo có số lượng cụ thể vào entities.combos_extracted.
    - entities.movie_name: Tên phim cụ thể (VD: "Avengers", "Thỏ ơi"). Nếu người dùng chỉ nói chung chung ("xem phim", "lịch chiếu", "đặt vé") mà không có tên phim, hãy để giá trị là null hoặc chuỗi rỗng.
    - entities.raw_time_info: Lấy các từ chỉ thời gian (tối nay, mai, 9/5...).
    - entities.combos_extracted: Mảng chứa các combo và số lượng tương ứng người dùng muốn đặt (ví dụ: "2 combo solo và 1 combo couple" -> [{"name": "solo", "quantity": 2}, {"name": "couple", "quantity": 1}]). Nếu không có tên cụ thể, sử dụng "combo" làm mặc định.

    VĂN BẢN NGƯỜI DÙNG: "${text}"
    LỊCH SỬ GẦN ĐÂY: ${JSON.stringify(history.slice(-3))}

    TRẢ VỀ JSON:
    {
        "intent": "SEARCH_MOVIE | BOOK_TICKET | CHECK_SCHEDULE | SELECT_MOVIE | SELECT_SHOWTIME | SELECT_SEAT | SELECT_COMBO | CONFIRM | CANCEL | OTHER",
        "entities": {
            "movie_name": "string",
            "index": number,
            "seat_codes": ["string"],
            "quantity": number,
            "seat_preference": "center | vip | couple | quiet | aisle",
            "raw_time_info": "string",
            "combos_extracted": [
                {
                    "name": "string",
                    "quantity": number
                }
            ]
        },
        "confidence": 0.0-1.0
    }
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const parsed = JSON.parse(response.text());

        // Đảm bảo combos_extracted luôn là mảng nếu được trả về từ AI
        if (parsed.entities && !parsed.entities.combos_extracted) {
            parsed.entities.combos_extracted = [];
        }

        if (parsed.entities.raw_time_info) {
            parsed.entities.time_extracted = timeParser.parseVietnameseTime(parsed.entities.raw_time_info);
        } else {
            parsed.entities.time_extracted = timeParser.parseVietnameseTime(text);
        }

        return parsed;
    } catch (error) {
        console.error("Gemini AI Error:", error.message);
        return { intent: "OTHER", entities: { seat_codes: [], combos_extracted: [] }, confidence: 0 };
    }
}

module.exports = {
    parseIntent
};
