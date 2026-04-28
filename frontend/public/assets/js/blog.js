(() => {
/**
 * BLOG JS - D PRIME CINEMA
 */

const API_BASE = window.location.origin + "/api";
const BLOG_API = `${API_BASE}/blog`;

document.addEventListener("DOMContentLoaded", function() {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "null");
    const adminArea = document.getElementById("admin-action-area");
    const postModal = document.getElementById("createPostModal");

    // QUYẾT ĐỊNH HIỂN THỊ ADMIN AREA & MODAL (Cực kỳ nghiêm ngặt nhưng linh hoạt)
    const role = (user && user.role) ? String(user.role).toLowerCase().trim() : "";
    const name = (user && user.fullname) ? String(user.fullname).toLowerCase() : "";
    const isAdmin = token && (role === "admin" || name.includes("admin"));

    if (isAdmin) {
        if (adminArea) {
            adminArea.style.setProperty("display", "block", "important");
            adminArea.style.opacity = "1";
            adminArea.style.visibility = "visible";
        }
        
        const adminAvatar = document.getElementById("admin-display-avatar");
        if (adminAvatar && user.avatar) {
            adminAvatar.src = `${API_BASE}/auth${user.avatar}`;
        }
    } else {
        // LUÔN ẨN NẾU KHÔNG PHẢI ADMIN HOẶC CHƯA ĐĂNG NHẬP
        if (adminArea) {
            adminArea.style.display = "none";
        }
        if (postModal) {
            postModal.style.display = "none";
        }
    }

    // Modal logic
    const btnOpen = document.getElementById("btnOpenCreateModal");
    const spanClose = document.querySelector(".close-modal");

    if (btnOpen) {
        btnOpen.onclick = () => {
            if (postModal) {
                postModal.style.display = "block";
                document.body.style.overflow = "hidden"; // KHÓA CUỘN NỀN
            }
        };
    }
    if (spanClose) {
        spanClose.onclick = () => {
            if (postModal) {
                postModal.style.display = "none";
                document.body.style.overflow = "auto"; // MỞ LẠI CUỘN NỀN
            }
        };
    }
    window.onclick = (event) => {
        if (event.target == postModal) {
            postModal.style.display = "none";
            document.body.style.overflow = "auto";
        }
    }

    // Hiển thị tên file đã chọn
    const fileInput = document.getElementById("postImage");
    const fileChosen = document.getElementById("file-chosen");
    if (fileInput && fileChosen) {
        fileInput.addEventListener("change", function() {
            fileChosen.textContent = this.files.length > 0 ? this.files[0].name : "Chưa chọn ảnh nào";
        });
    }

    // Load dữ liệu ban đầu
    loadFeaturedPosts();
    loadBlogList();
    loadTrending();

    // Fill categories logic
    document.querySelectorAll(".cat-item").forEach(item => {
        item.onclick = function(e) {
            e.preventDefault();
            document.querySelectorAll(".cat-item").forEach(el => el.classList.remove("active"));
            this.classList.add("active");
            const cat = this.getAttribute("data-cat");
            loadBlogList(1, cat);
        }
    });

    // Form submit logic (FormData for File Upload)
    const createForm = document.getElementById("createPostForm");
    if (createForm) {
        createForm.onsubmit = async function(e) {
            e.preventDefault();
            
            const formData = new FormData();
            formData.append("title", document.getElementById("postTitle").value);
            formData.append("summary", document.getElementById("postSummary").value);
            formData.append("content", document.getElementById("postContent").value);
            formData.append("category", document.getElementById("postCategory").value);
            
            const fileField = document.getElementById("postImage");
            if (fileField.files.length > 0) {
                formData.append("image", fileField.files[0]);
            }

            try {
                const res = await fetch(`${BLOG_API}/posts`, {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${token}`
                    },
                    body: formData // Fetch handles Content-Type automatically for FormData
                });

                const result = await res.json();
                if (res.ok) {
                    alert("Đăng bài thành công!");
                    if (postModal) postModal.style.display = "none";
                    createForm.reset();
                    if (fileChosen) fileChosen.textContent = "Chưa chọn ảnh nào";
                    location.reload();
                } else {
                    alert("Lỗi: " + result.message);
                }
            } catch (err) {
                console.error(err);
                alert("Không thể kết nối đến máy chủ");
            }
        };
    }
});

// Helper to get correct Image URL
function getPostImageUrl(path) {
    if (!path) return 'https://placehold.co/600x400/1a1d29/white?text=D-Prime+Cinema';
    
    // Nếu là URL tuyệt đối (http...), giữ nguyên hoặc sửa localhost nếu cần
    if (path.startsWith('http')) {
        return path.replace('localhost/N25_CNM_DPRIME/frontend/public', window.location.host);
    }
    
    // Nếu đường dẫn bắt đầu bằng ./assets hoặc assets (ảnh nằm ở frontend)
    if (path.includes('assets/images/blog')) {
        const cleanPath = path.replace('./', '');
        return window.location.origin + "/" + cleanPath;
    }

    // Mặc định thử lấy qua Gateway nếu là đường dẫn khác
    const gateway = window.location.origin;
    return gateway + (path.startsWith('/') ? path : '/' + path);
}

async function loadFeaturedPosts() {
    try {
        const res = await fetch(`${BLOG_API}/posts?limit=3`);
        const data = await res.json();
        const container = document.getElementById("featured-posts");
        if (!container) return;

        container.innerHTML = data.posts.map(post => {
            const link = window.encodeLink("blog-detail", post.slug);
            const img = getPostImageUrl(post.image_url);
            return `
                <div class="featured-card" onclick="window.location.href='${link}'">
                    <img src="${img}" class="featured-img" alt="${post.title}">
                    <div class="featured-info">
                        <div class="featured-meta">${post.category}</div>
                        <h4>${post.title}</h4>
                        <div class="featured-meta" style="color:rgba(255,255,255,0.6);">
                            <i class="fa-solid fa-user"></i> ${post.author_name} • 
                            <i class="fa-solid fa-eye"></i> ${formatViews(post.views)}
                        </div>
                    </div>
                </div>
            `;
        }).join("");
    } catch (err) {
        console.error("Load featured error:", err);
    }
}

async function loadBlogList(page = 1, category = "") {
    try {
        const container = document.getElementById("blog-list");
        if (!container) return;
        container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 50px;"><i class="fa-solid fa-circle-notch fa-spin fa-2x"></i></div>`;

        let url = `${BLOG_API}/posts?page=${page}&limit=6`;
        if (category) url += `&category=${encodeURIComponent(category)}`;

        const res = await fetch(url);
        const data = await res.json();

        if (data.posts.length === 0) {
            container.innerHTML = "<p class='text-center' style='grid-column:1/-1; padding:50px;'>Không có bài viết nào trong danh mục này.</p>";
            return;
        }

        container.innerHTML = data.posts.map(post => {
            const link = window.encodeLink("blog-detail", post.slug);
            const img = getPostImageUrl(post.image_url);
            return `
                <div class="blog-item" onclick="window.location.href='${link}'">
                    <img src="${img}" alt="${post.title}">
                    <div class="blog-item-content">
                        <h4>${post.title}</h4>
                        <p>${post.summary || "Bấm vào để xem chi tiết bài viết này..."}</p>
                        <div class="blog-item-meta">
                            <span><i class="fa-solid fa-user"></i> ${post.author_name}</span>
                            <span><i class="fa-solid fa-calendar"></i> ${new Date(post.created_at).toLocaleDateString("vi-VN")}</span>
                            <span><i class="fa-solid fa-eye"></i> ${formatViews(post.views)}</span>
                        </div>
                    </div>
                </div>
            `;
        }).join("");

        renderPagination(data.total, data.page, data.limit, category);
    } catch (err) {
        console.error("Load blog list error:", err);
    }
}

async function loadTrending() {
    // Optional trending logic can go here if needed
}

function renderPagination(total, page, limit, category) {
    const totalPages = Math.ceil(total / limit);
    const container = document.getElementById("blog-pagination");
    if (!container) return;

    let html = "";
    if (totalPages <= 1) {
        container.innerHTML = "";
        return;
    }
    
    for (let i = 1; i <= totalPages; i++) {
        html += `<button class="page-btn ${i === page ? 'active' : ''}" onclick="loadBlogList(${i}, '${category}')">${i}</button>`;
    }
    container.innerHTML = html;
}

function formatViews(n) {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
    if (n >= 1000) return (n / 1000).toFixed(1) + "k";
    return n;
}

window.loadBlogList = loadBlogList;
})();
