(() => {
/**
 * BLOG DETAIL JS - D PRIME CINEMA
 */

const API_BASE = window.location.origin + "/api";
const BLOG_API = `${API_BASE}/blog`;

document.addEventListener("DOMContentLoaded", function() {
    const urlParams = new URLSearchParams(window.location.search);
    const slug = window.BLOG_SLUG || urlParams.get("slug");

    if (!slug) {
        window.location.href = "index.php?p=YmxvZw==";
        return;
    }

    loadPostDetail(slug);
    loadTrending();
});

async function loadPostDetail(slug) {
    try {
        const res = await fetch(`${BLOG_API}/posts/${slug}`);
        if (!res.ok) {
            document.getElementById("post-title").textContent = "Không tìm thấy bài viết";
            return;
        }

        const post = await res.json();

        // Cập nhật Breadcrumb
        document.getElementById("breadcrumb-category").textContent = post.category;
        document.getElementById("breadcrumb-title").textContent = post.title;

        // Cập nhật Header
        document.getElementById("post-meta-top").innerHTML = `
            <span class="badge-cat">${post.category}</span>
            <span class="post-views"><i class="fa-solid fa-eye"></i> ${formatViews(post.views)} lượt xem</span>
        `;
        document.getElementById("post-title").textContent = post.title;
        document.getElementById("author-name").textContent = post.author_name;
        document.getElementById("post-date").textContent = new Date(post.created_at).toLocaleDateString("vi-VN", {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });

        // Cập nhật Ảnh đại diện (nếu API có trả về avatar tác giả, ở đây dùng tạm logo rạp)
        // document.getElementById("author-avatar").src = post.author_avatar || "./assets/images/logo.png";

        // Cập nhật Hình ảnh của bài viết (Hero)
        const heroContainer = document.getElementById("post-hero");
        heroContainer.innerHTML = `
            <img src="${post.image_url || 'https://placehold.co/1200x600'}" class="hero-img" alt="${post.title}">
        `;

        // Cập nhật Nội dung (Content)
        const contentBody = document.getElementById("post-content");
        // Chia nhỏ nội dung thành các thẻ <p> để đẹp hơn
        const paragraphs = post.content.split("\n\n");
        contentBody.innerHTML = paragraphs.map(p => `<p>${p.replace(/\n/g, "<br>")}</p>`).join("");

        // Cập nhật Tags/Category footer
        document.getElementById("post-tags").innerHTML = `<span class="tag-item"># ${post.category}</span>`;

    } catch (err) {
        console.error("Load post detail error:", err);
    }
}

async function loadTrending() {
    try {
        const res = await fetch(`${BLOG_API}/trending`);
        const data = await res.json();
        const container = document.getElementById("trending-list");
        if (!container) return;

        container.innerHTML = data.map((post, index) => `
            <div class="trending-item" onclick="window.location.href='index.php?p=YmxvZy1kZXRhaWw=&slug=${post.slug}'">
                <img src="${post.image_url || 'https://placehold.co/100x80'}" class="trending-item-img">
                <div class="trending-item-info">
                    <h5>${post.title}</h5>
                    <span>${formatViews(post.views)} lượt xem</span>
                </div>
            </div>
        `).join("");
    } catch (err) {
        console.error("Load trending error:", err);
    }
}

function formatViews(n) {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
    if (n >= 1000) return (n / 1000).toFixed(1) + "k";
    return n;
}
})();
