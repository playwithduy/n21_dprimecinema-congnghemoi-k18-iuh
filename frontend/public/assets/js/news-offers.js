document.addEventListener("DOMContentLoaded", () => {
    const newsGrid = document.getElementById("news-grid");
    const tabs = document.querySelectorAll(".tab-btn");
    const NEWS_API = window.location.protocol + "//" + window.location.hostname + ":3000/api/blog"; // Routes through API Gateway

    let currentCategory = "Tin tức";

    // --- FETCH DATA ---
    async function loadNews() {
        newsGrid.classList.add("loading");
        newsGrid.innerHTML = `
            <div class="loader-container">
                <div class="spinner"></div>
                <p style="margin-top:15px; color:#888;">Đang tải ${currentCategory}...</p>
            </div>`;

        try {
            const res = await fetch(`${NEWS_API}/posts?category=${encodeURIComponent(currentCategory)}&limit=12`);
            const data = await res.json();
            
            if (data.posts && data.posts.length > 0) {
                renderNews(data.posts);
            } else {
                renderEmpty();
            }
        } catch (err) {
            console.error("❌ loadNews Error:", err);
            renderError();
        } finally {
            newsGrid.classList.remove("loading");
        }
    }

    // --- RENDER FUNCTIONS ---
    function renderNews(posts) {
        newsGrid.innerHTML = posts.map(post => {
            const isOffer = post.category === "Khuyến mãi" || post.content.includes("MÃ:");
            const date = new Date(post.created_at).toLocaleDateString("vi-VN");
            
            // Try to extract coupon code if it exists in content (format: MÃ: [CODE])
            const couponMatch = post.content.match(/MÃ:\s*([A-Z0-9]+)/i);
            const couponCode = couponMatch ? couponMatch[1].toUpperCase() : null;

            return `
                <div class="news-card ${isOffer ? 'offer-card' : ''}" onclick="window.location.href='index.php?p=YmxvZy1kZXRhaWw=&slug=${post.slug}'">
                    ${post.image_url ? 
                        `<img src="${post.image_url}" class="news-card-img" alt="${post.title}" 
                         onerror="this.src='https://placehold.co/600x400/0b0f19/e71a0f?text=PROMOTION'">` : 
                        `<div class="news-card-img" style="background:#1a1f2e; display:flex; align-items:center; justify-content:center;">
                            <i class="fa-solid fa-bullhorn" style="font-size:3rem; color:#333;"></i>
                        </div>`
                    }
                    <div class="news-card-content">
                        <span class="news-card-tag">${post.category}</span>
                        <h3 class="news-card-title">${post.title}</h3>
                        <p class="news-card-desc">${post.summary || 'Nhấn để xem chi tiết chương trình mới nhất từ rạp phim D Prime Cinema.'}</p>
                        
                        ${couponCode ? `
                            <div class="coupon-box" onclick="event.stopPropagation()">
                                <div class="coupon-code">${couponCode}</div>
                                <button class="btn-copy" onclick="copyToClipboard('${couponCode}', this)">SAO CHÉP</button>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        }).join("");
    }

    function renderEmpty() {
        newsGrid.innerHTML = `
            <div class="loader-container" style="grid-column: 1/-1;">
                <i class="fa-solid fa-magnifying-glass" style="font-size:3rem; color:#333; margin-bottom:20px;"></i>
                <p style="color:#888;">Hiện chưa có ${currentCategory} mới nào.</p>
            </div>`;
    }

    function renderError() {
        newsGrid.innerHTML = `
             <div class="loader-container" style="grid-column: 1/-1;">
                <i class="fa-solid fa-triangle-exclamation" style="font-size:3rem; color:#e50914; margin-bottom:20px;"></i>
                <p style="color:#888;">Lỗi kết nối máy chủ tin tức. Vui lòng thử lại sau.</p>
            </div>`;
    }

    // --- UTILS ---
    window.copyToClipboard = (text, btn) => {
        navigator.clipboard.writeText(text).then(() => {
            const originalText = btn.innerText;
            btn.innerText = "ĐÃ CHÉP!";
            btn.style.background = "#22c55e"; 
            setTimeout(() => {
                btn.innerText = originalText;
                btn.style.background = "";
            }, 2000);
        });
    };

    // --- EVENT LISTENERS ---
    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            if (tab.classList.contains("active")) return;
            
            tabs.forEach(t => t.classList.remove("active"));
            tab.classList.add("active");
            
            currentCategory = tab.getAttribute("data-category");
            loadNews();
        });
    });

    // Start loading
    loadNews();
});
