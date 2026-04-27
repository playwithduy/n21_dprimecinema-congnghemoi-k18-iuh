/* AI CHATBOT & REAL-TIME PULSE LOGIC */
document.addEventListener("DOMContentLoaded", () => {
    // 1. CHATBOT LOGIC
    const widget = document.createElement('div');
    widget.className = 'ai-chat-widget';
    widget.innerHTML = `
        <div class="chat-window" id="chatWindow">
            <div class="chat-header">
                <img src="./assets/images/logo.png" alt="Bot">
                <div class="status"></div>
                <div>
                    <strong style="display:block;font-size:14px;">D'PRIME AI Assistant</strong>
                    <small style="font-size:10px;opacity:0.7;">Online | Sẵn sàng hỗ trợ</small>
                </div>
            </div>
            <div class="chat-body" id="chatBody">
                <div class="chat-msg bot">Xin chào! Tôi là trợ lý ảo của D'PRIME. Tôi có thể giúp gì cho bạn hôm nay?</div>
            </div>
            <form class="chat-input-area" id="chatForm">
                <input type="text" id="chatInput" placeholder="Nhập câu hỏi của bạn..." autocomplete="off">
                <button type="submit" class="chat-send"><i class="fa-solid fa-paper-plane"></i></button>
            </form>
        </div>
        <div class="chat-bubble" id="chatBubble">
            <i class="fa-solid fa-robot"></i>
        </div>
    `;
    document.body.appendChild(widget);

    const bubble = document.getElementById('chatBubble');
    const chatBox = document.getElementById('chatWindow');
    const form = document.getElementById('chatForm');
    const input = document.getElementById('chatInput');
    const body = document.getElementById('chatBody');

    bubble.onclick = () => chatBox.classList.toggle('active');

    const responses = {
        "gia ve": "Chào bạn, giá vé tại D'PRIME dao động từ 80.000đ đến 150.000đ tùy vào loại ghế và định dạng phim (2D/3D). Bạn có muốn tôi hướng dẫn cách đặt vé không?",
        "khuyen mai": "D'PRIME đang có chương trình 'Thứ 2 siêu rẻ' chỉ 60k/vé và combo bắp nước ưu đãi cho thành viên mới đó!",
        "dia chi": "D'PRIME Cinema hiện có các chi nhánh tại các quận trung tâm. Bạn có thể xem danh sách rạp ở phần 'Hệ Thống Rạp' nhé.",
        "dat ve": "Để đặt vé, bạn chỉ cần chọn phim yêu thích, chọn suất chiếu và chỗ ngồi. Sau đó thanh toán qua ví điện tử hoặc thẻ ngân hàng là xong!",
        "phim hot": "Hiện tại 'Nhà Trấn Quỷ' và 'Tiểu Yêu Quái' đang rất hot và cháy vé liên tục đó bạn ơi!",
        "hello": "Hi there! How can I help you today?",
        "hi": "Chào bạn! Chúc bạn một ngày tốt lành. Bạn cần hỗ trợ gì về lịch chiếu phim không?"
    };

    form.onsubmit = (e) => {
        e.preventDefault();
        const msg = input.value.trim();
        if(!msg) return;

        // User message
        addMessage(msg, 'user');
        input.value = '';

        // Bot thinking...
        setTimeout(() => {
            const botReply = getReply(msg);
            addMessage(botReply, 'bot');
        }, 1000);
    };

    function addMessage(text, side) {
        const div = document.createElement('div');
        div.className = `chat-msg ${side}`;
        div.innerText = text;
        body.appendChild(div);
        body.scrollTop = body.scrollHeight;
    }

    function getReply(msg) {
        msg = msg.toLowerCase();
        
        // 1. CHÀO HỎI & CÁ NHÂN HÓA
        if (msg.includes("tao là") || msg.includes("tên tôi là") || msg.includes("tôi là")) {
            const name = msg.split("là")[1].trim();
            return `Chào ${name}! Rất vui được gặp bạn. Tôi là trợ lý Gemini của D'PRIME. Bạn cần tôi tư vấn phim gì cho hôm nay không?`;
        }
        if (msg.includes("hello") || msg.includes("hi") || msg.includes("chào")) {
            return "Chào bạn! Tôi là Gemini Assistant của D'PRIME. Tôi có thể giúp bạn tìm phim hay, kiểm tra giá vé hoặc tư vấn rạp gần nhất. Bạn muốn hỏi gì nào?";
        }

        // 2. TƯ VẤN PHIM & GIÁ VÉ
        for(let key in responses) {
            if(msg.includes(key)) return responses[key];
        }

        // 3. XỬ LÝ THÔNG MINH (FALLBACK)
        const fallbacks = [
            "Câu hỏi của bạn rất hay! Về vấn đề này, D'PRIME luôn ưu tiên trải nghiệm tốt nhất cho bạn. Bạn có muốn biết thêm về lịch chiếu phim hot tuần này không?",
            "Tôi đang học thêm để hiểu ý bạn hơn. Hiện tại tôi có thể giúp bạn về giá vé, phim hot và ưu đãi. Bạn thử hỏi tôi về 'khuyến mãi' xem sao?",
            "Rất tiếc tôi chưa hiểu rõ ý bạn, nhưng tôi chắc chắn rằng xem phim tại D'PRIME sẽ không làm bạn thất vọng! Thử hỏi tôi về 'phim hot' nhé!"
        ];
        return fallbacks[Math.floor(Math.random() * fallbacks.length)];
    }

    // 2. REAL-TIME BOOKING PULSE (SOCIAL PROOF)
    const bookingMsgs = [
        "Anh Nguyễn vừa đặt 2 vé xem 'Nhà Trấn Quỷ'",
        "Chị Lan vừa đặt Combo Bắp Nước ưu đãi",
        "Có 5 người đang xem phim 'Tiểu Yêu Quái' tại rạp Quận 1",
        "Một khách hàng vừa đăng ký thành viên VIP",
        "Vé phim 'Cứu' đang được đặt rất nhanh!"
    ];

    function showPulse() {
        const msg = bookingMsgs[Math.floor(Math.random() * bookingMsgs.length)];
        Toast.info(msg, "Real-time Activity");
        
        // Random next pulse
        setTimeout(showPulse, Math.random() * 20000 + 15000); // 15-35 seconds
    }

    // Start pulse after 5 seconds
    setTimeout(showPulse, 5000);
});
