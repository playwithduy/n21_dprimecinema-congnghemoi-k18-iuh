/* D'PRIME GEMINI AI ASSISTANT - ULTRA SMART VERSION */
document.addEventListener("DOMContentLoaded", () => {
    const widget = document.createElement('div');
    widget.className = 'ai-chat-widget';
    widget.innerHTML = `
        <div class="chat-window" id="chatWindow">
            <div class="chat-header">
                <img src="./assets/images/logo.png" alt="Bot">
                <div class="status"></div>
                <div>
                    <strong style="display:block;font-size:14px;">D'PRIME AI Assistant</strong>
                    <small style="font-size:10px;opacity:0.7;">Đang trực tuyến | Hỗ trợ 24/7</small>
                </div>
            </div>
            <div class="chat-body" id="chatBody">
                <div class="chat-msg bot">Chào bạn! Tôi là D'PRIME, trợ lý ảo thông minh. Tôi có thể giúp bạn đặt vé hoặc tìm phim hay. Bạn cần gì nào?</div>
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
        "gia ve": "Giá vé tại D'PRIME chỉ từ 80k. Đặc biệt có 'Thứ 2 siêu rẻ' chỉ 60k đó bạn ơi!",
        "khuyen mai": "Chúng tôi có ưu đãi 20% cho học sinh sinh viên và tặng bắp nước cho thành viên mới!",
        "dia chi": "D'PRIME hiện có mặt tại các cụm rạp trung tâm. Bạn muốn tìm rạp ở khu vực nào?",
        "phim hot": "Tuần này 'Nhà Trấn Quỷ' và 'Tiểu Yêu Quái' đang đứng đầu bảng xếp hạng đó!",
        "dat ve": "Bạn chỉ cần chọn phim, chọn ghế và thanh toán Online. Rất nhanh chóng và an toàn!"
    };

    form.onsubmit = (e) => {
        e.preventDefault();
        const msg = input.value.trim();
        if(!msg) return;

        addMessage(msg, 'user');
        input.value = '';

        setTimeout(() => {
            const reply = processSmartReply(msg);
            addMessage(reply, 'bot');
        }, 800);
    };

    function addMessage(text, side) {
        const div = document.createElement('div');
        div.className = `chat-msg ${side}`;
        div.innerText = text;
        body.appendChild(div);
        body.scrollTop = body.scrollHeight;
    }

    function processSmartReply(msg) {
        const input = msg.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // Remove accents
        
        // 1. Nhận diện danh tính (Cực nhạy)
        if (input.includes("tao la") || input.includes("tên toi la") || input.includes("tui la") || input.includes("minh la") || input.includes("iam")) {
            const parts = msg.split(/la|là/i);
            const name = parts.length > 1 ? parts[1].trim() : "bạn";
            return `Chào ${name}! Rất vui được gặp bạn. Tôi là trợ lý ảo D'PRIME. Bạn hôm nay muốn xem phim gì nào?`;
        }

        // 2. Chào hỏi
        if (input.includes("chao") || input.includes("hi") || input.includes("hello")) {
            return "Chào bạn! Chúc bạn một ngày xem phim thật vui vẻ tại D'PRIME. Tôi có thể giúp gì cho bạn?";
        }

        // 3. Từ khóa phim
        for(let key in responses) {
            const cleanKey = key.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            if(input.includes(cleanKey)) return responses[key];
        }

        return "D'PRIME đang suy nghĩ... Câu hỏi này thú vị đấy! Hiện tại tôi có thể hỗ trợ bạn về giá vé, khuyến mãi và phim đang hot. Bạn thử hỏi tôi xem nhé!";
    }
});
