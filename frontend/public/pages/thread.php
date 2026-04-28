<link rel="stylesheet" href="./assets/css/forum.css?v=<?php echo time(); ?>">

<?php
$postId = $_GET['id'] ?? null;
if (!$postId) {
    echo "<script>window.location.href='index.php?p=Zm9ydW0=';</script>";
    exit;
}
?>

<div class="forum-page-bg">
    <div class="forum-grid" style="grid-template-columns: 1fr; max-width: 800px;">
    
        <div id="thread-content">
            <div class="loading-spinner">Đang tải nội dung bài viết...</div>
        </div>

        <!-- PHẦN CÔNG CỤ COMMENT -->
        <div id="comment-form-container" style="display:none;">
            <div class="comment-write">
                <img src="https://ui-avatars.com/api/?name=User" id="comment-user-avatar" class="user-avatar" alt="User">
                <div class="comment-input-wrap">
                    <form id="comment-form">
                        <input type="text" id="comment-text" class="comment-input" placeholder="Viết phản hồi...">
                        <div style="display:flex; justify-content:flex-end; margin-top:10px;">
                            <button type="submit" class="btn-post-inline">Đăng</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>

        <!-- DANH SÁCH COMMENT -->
        <div id="comment-list">
            <!-- JS renders comments here -->
        </div>

    </div>
</div>

<script src="./assets/js/forum.js?v=<?php echo time(); ?>"></script>
<script>
document.addEventListener("DOMContentLoaded", () => {
    const API_BASE = window.location.origin + "/api";
    const postId = "<?php echo $postId; ?>";
    const threadContent = document.getElementById("thread-content");
    const commentList = document.getElementById("comment-list");
    const commentForm = document.getElementById("comment-form");
    const commentFormContainer = document.getElementById("comment-form-container");
    
    const user = JSON.parse(localStorage.getItem("user") || "null");
    const token = localStorage.getItem("token");

    if (user) {
        commentFormContainer.style.display = "block";
        const avatarPath = user.avatar ? (user.avatar.startsWith('/') ? user.avatar : '/' + user.avatar) : null;
        document.getElementById("comment-user-avatar").src = avatarPath 
            ? `${API_BASE}/auth${avatarPath}` 
            : `https://ui-avatars.com/api/?name=${user.username}&background=e71a0f&color=fff`;
    }

    loadThread();

    async function loadThread() {
        try {
            const res = await fetch(`${API_BASE}/forum/posts/${postId}`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const post = await res.json();
            
            renderThread(post);
            renderComments(post.comments);
        } catch (err) {
            threadContent.innerHTML = '<div class="loading-spinner">Lỗi tải dữ liệu.</div>';
        }
    }

    function renderThread(post) {
        const timeStr = formatTime(post.created_at);
        const avatarPath = post.avatar ? (post.avatar.startsWith('/') ? post.avatar : '/' + post.avatar) : null;
        const avatar = avatarPath 
            ? `${API_BASE}/auth${avatarPath}` 
            : "https://ui-avatars.com/api/?name=" + encodeURIComponent(post.username || "U") + "&background=e71a0f&color=fff";

        threadContent.innerHTML = `
            <div class="forum-post">
                <div class="post-left">
                    <img src="${avatar}" class="user-avatar" alt="${post.username}">
                    <div class="post-line"></div>
                </div>
                <div class="post-right">
                    <div class="post-header">
                        <div style="display:flex; align-items:center; gap:10px;">
                            <a href="#" class="post-user">${post.username}</a>
                            <span class="post-time">${timeStr}</span>
                        </div>
                        <div style="display:flex; gap:5px;">
                            ${user && parseInt(post.user_id) === parseInt(user.id) ? `
                                <button class="edit-btn" onclick="prepareEdit(${post.id})">
                                    <i class="far fa-edit"></i>
                                </button>
                                <button class="delete-btn" onclick="handleDelete(event, ${post.id})">
                                    <i class="far fa-trash-alt"></i>
                                </button>
                            ` : ''}
                        </div>
                    </div>
                    <div class="post-title">${post.title}</div>
                    <div class="post-content">${post.content}</div>
                    
                    ${post.movie_id ? `
                        <a href="index.php?p=bW92aWU=&id=${post.movie_id}" class="post-tag">
                            <i class="fas fa-ticket-alt"></i> ${post.movie_title}
                        </a>
                    ` : ''}

                    <div class="post-footer">
                        <button class="footer-item like-btn ${post.liked ? 'liked' : ''}" onclick="handleLike(event, ${post.id})">
                            <i class="${post.liked ? 'fas' : 'far'} fa-heart"></i>
                            <span>${post.likes || 0}</span>
                        </button>
                        <button class="footer-item">
                            <i class="far fa-comment"></i>
                            <span>${post.comment_count || 0}</span>
                        </button>
                        <button class="footer-item">
                            <i class="far fa-paper-plane"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    function renderComments(comments) {
        if (!comments || comments.length === 0) {
            commentList.innerHTML = '<div class="loading-spinner">Chưa có bình luận nào.</div>';
            return;
        }

        commentList.innerHTML = comments.map(c => {
            const timeStr = formatTime(c.created_at);
            const cp = c.avatar ? (c.avatar.startsWith('/') ? c.avatar : '/' + c.avatar) : null;
            const cv = cp 
                ? `${API_BASE}/auth${cp}` 
                : "https://ui-avatars.com/api/?name=" + encodeURIComponent(c.username || "U") + "&background=e71a0f&color=fff";
            return `
                <div class="comment-item">
                    <img src="${cv}" class="user-avatar" style="width:36px; height:36px;">
                    <div class="post-right">
                        <div class="post-header">
                            <span class="post-user" style="font-size:14px;">${c.username}</span>
                            <span class="post-time" style="font-size:12px;">${timeStr}</span>
                        </div>
                        <div class="post-content" style="font-size:14px; margin-bottom:0;">${c.content}</div>
                    </div>
                </div>
            `;
        }).join("");
    }

    if (commentForm) {
        commentForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const text = document.getElementById("comment-text").value;
            if (!text) return;

            try {
                const res = await fetch(`${API_BASE}/forum/posts/${postId}/comments`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({ 
                        content: text,
                        username: user.fullname || user.username,
                        avatar: user.avatar
                    })
                });

                if (res.ok) {
                    document.getElementById("comment-text").value = "";
                    loadThread();
                }
            } catch (err) {
                alert("Lỗi bình luận!");
            }
        });
    }

    function formatTime(dateStr) {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = Math.floor((now - date) / 1000);
        if (diff < 60) return "vừa xong";
        if (diff < 3600) return Math.floor(diff / 60) + " phút";
        if (diff < 86400) return Math.floor(diff / 3600) + " giờ";
        return Math.floor(diff / 86400) + " ngày";
    }
});
</script>
