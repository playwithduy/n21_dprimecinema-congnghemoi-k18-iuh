document.addEventListener("DOMContentLoaded", () => {
    // Inject HTML dynamically
    const html = `
    <!-- CHATBOT TRIGGER -->
    <div class="chat-trigger-btn" id="chatTrigger" title="${window.t('chat_trigger_title')}" data-i18n="chat_trigger_title">
      <img src="https://cdn-icons-png.flaticon.com/512/4712/4712035.png" alt="AI Chatbot" class="chat-trigger-icon">
    </div>

    <!-- CHAT UI -->
    <div id="dprime-chatbot">
      <div class="chat-header">
        <span data-i18n="chat_header">${window.t('chat_header')}</span>
        <button class="chat-close-btn" id="chatClose">&times;</button>
      </div>
      <div class="chat-body" id="chatBody">
        <div class="chat-row bot">
          <img src="https://cdn-icons-png.flaticon.com/512/4712/4712035.png" class="chat-avatar" alt="bot">
          <div class="chat-msg bot" data-i18n="chat_welcome">
            ${window.t('chat_welcome')}
          </div>
        </div>
      </div>
      <div class="chat-footer">
        <div class="chat-input-wrapper">
          <input type="text" id="chatInput" class="chat-input" placeholder="${window.t('chat_placeholder')}" data-i18n="chat_placeholder" autocomplete="off">
          <button id="chatSubmit" class="chat-submit">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
    `;

    document.body.insertAdjacentHTML('beforeend', html);

    const trigger = document.getElementById("chatTrigger");
    const closeBtn = document.getElementById("chatClose");
    const chatbot = document.getElementById("dprime-chatbot");
    const chatInput = document.getElementById("chatInput");
    const chatSubmit = document.getElementById("chatSubmit");
    const chatBody = document.getElementById("chatBody");

    trigger.addEventListener("click", () => {
        chatbot.classList.add("open");
        setTimeout(() => chatInput.focus(), 300);
    });

    closeBtn.addEventListener("click", () => {
        chatbot.classList.remove("open");
    });

    function saveToLocalStorage(type, content) {
        let history = JSON.parse(localStorage.getItem("chat_history") || "[]");
        history.push({ type, ...content });
        localStorage.setItem("chat_history", JSON.stringify(history));
    }

    function loadLocalStorageHistory() {
        const history = JSON.parse(localStorage.getItem("chat_history") || "[]");
        history.forEach(item => {
            if (item.type === "text") {
                appendMessage(item.sender, item.text, true);
            } else if (item.type === "movies") {
                appendMovies(item.movies, true);
            }
        });
    }

    function appendMessage(sender, text, isHistory = false) {
        const row = document.createElement("div");
        row.className = `chat-row ${sender}`;

        let avatarUrl = "https://cdn-icons-png.flaticon.com/512/4712/4712035.png"; // Default bot
        if (sender === "user") {
            const userStr = localStorage.getItem("user");
            if (userStr) {
                try {
                    const user = JSON.parse(userStr);
                    // Dùng avatar từ auth-service nếu có
                    if (user.avatar) {
                        avatarUrl = getAssetUrl(user.avatar);
                    } else {
                        avatarUrl = getAssetUrl("https://cdn-icons-png.flaticon.com/512/149/149071.png"); // Default user
                    }
                } catch (e) {
                    avatarUrl = getAssetUrl("https://cdn-icons-png.flaticon.com/512/149/149071.png");
                }
            } else {
                avatarUrl = "https://cdn-icons-png.flaticon.com/512/149/149071.png";
            }
        }

        const avatarImg = `<img src="${avatarUrl}" class="chat-avatar" alt="${sender}">`;

        // Tự động nhận diện link và chuyển thành thẻ <a> cho người dùng click
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const formattedText = text.replace(urlRegex, (url) => {
            return `<a href="${url}" target="_blank" style="color: #64b5f6; text-decoration: underline; word-break: break-all;">${url}</a>`;
        });

        row.innerHTML = `
            ${avatarImg}
            <div class="chat-msg ${sender}">${formattedText}</div>
        `;

        chatBody.appendChild(row);
        chatBody.scrollTop = chatBody.scrollHeight;

        if (!isHistory) {
            saveToLocalStorage("text", { sender, text });
        }
    }

    function encodeBase64(str) {
        return btoa(unescape(encodeURIComponent(str)));
    }

    function appendMovies(movies, isHistory = false) {
        if (!movies || movies.length === 0) return;

        const row = document.createElement("div");
        row.className = "chat-row bot";

        const avatarUrl = "https://cdn-icons-png.flaticon.com/512/4712/4712035.png";
        const avatarImg = `<img src="${avatarUrl}" class="chat-avatar" alt="bot">`;

        const listDiv = document.createElement("div");
        listDiv.className = "chat-movie-list";

        movies.forEach(m => {
            const pageParam = encodeBase64("movie");
            const card = document.createElement("a");
            card.href = `index.php?p=${pageParam}&slug=${m.slug}`;
            card.className = "chat-movie-card";
            const posterUrl = m.poster ? window.getAssetUrl(m.poster) : './assets/images/default.jpg';
            card.innerHTML = `
                <img src="${posterUrl}" class="chat-movie-poster" alt="poster">
                <div class="chat-movie-info">
                    <div class="chat-movie-title">${m.title}</div>
                    <div class="chat-movie-meta">${m.duration || '?'} phút • ${m.age_limit || 0}+</div>
                </div>
            `;
            listDiv.appendChild(card);
        });

        row.innerHTML = `
            ${avatarImg}
            <div style="flex: 1;">${listDiv.outerHTML}</div>
        `;

        chatBody.appendChild(row);
        chatBody.scrollTop = chatBody.scrollHeight;

        if (!isHistory) {
            saveToLocalStorage("movies", { movies });
        }
    }

    // Load lịch sử cũ nếu có
    loadLocalStorageHistory();

    async function sendMessage() {
        const text = chatInput.value.trim();
        if (!text) return;

        appendMessage("user", text);
        chatInput.value = "";

        const rowLoad = document.createElement("div");
        rowLoad.className = `chat-row bot loading-row`;
        rowLoad.innerHTML = `
            <img src="https://cdn-icons-png.flaticon.com/512/4712/4712035.png" class="chat-avatar" alt="bot">
            <div class="chat-msg bot loading">Đang tra cứu...</div>
        `;
        chatBody.appendChild(rowLoad);
        chatBody.scrollTop = chatBody.scrollHeight;

        try {
            const API_BASE = window.location.origin + "/api";
            const res = await fetch(`${API_BASE}/movies/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: text })
            });
            const data = await res.json();

            chatBody.removeChild(rowLoad);

            if (data.reply) {
                appendMessage("bot", data.reply);
            }
            if (data.movies && data.movies.length > 0) {
                appendMovies(data.movies);
            }

        } catch (err) {
            if (chatBody.contains(rowLoad)) chatBody.removeChild(rowLoad);
            appendMessage("bot", "Oops, mình đang bị mất kết nối tới kho phim. Bạn thử lại sau nhé!");
        }
    }

    chatSubmit.addEventListener("click", sendMessage);
    chatInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            sendMessage();
        }
    });
});
