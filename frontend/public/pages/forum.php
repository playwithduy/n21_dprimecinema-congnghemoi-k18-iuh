<link rel="stylesheet" href="./assets/css/forum.css?v=<?php echo time(); ?>">

<div class="forum-page-bg">
    <div class="forum-grid">
    <!-- MAIN CONTENT -->
    <div class="forum-main">
        <!-- HEADER -->
        <div class="section-heading">
            <span class="section-line"></span>
            <h3 data-i18n="nav_forum">FORUM CỘNG ĐỒNG</h3>
            <span class="section-line"></span>
        </div>

        <!-- WRITE BOX (CLICK TO OPEN MODAL) -->
        <div class="forum-write-card" id="write-box">
            <img src="https://ui-avatars.com/api/?name=User" id="user-avatar-current" class="user-avatar" alt="User">
            <div class="write-placeholder" data-i18n="search_placeholder">Có gì mới không? Review phim đi...</div>
            <button class="btn-post-inline" data-i18n="forum_new_post">Đăng</button>
        </div>

        <!-- ACTIVE FILTER CHIP (Hidden by default) -->
        <div id="active-filter-container" style="display:none; margin-bottom: 20px;">
            <div class="filter-chip">
                <span id="filter-text">Đang lọc: Phim A</span>
                <i class="fas fa-times" id="clear-filter" style="cursor:pointer; margin-left:10px;"></i>
            </div>
        </div>

        <!-- FEED -->
        <div id="forum-feed">
            <!-- JS renders posts here -->
        </div>
    </div>

    <!-- SIDEBAR -->
    <div class="forum-sidebar">
        <div class="sidebar-block">
            <h4 class="sidebar-title">TÌM KIẾM</h4>
            <div class="sidebar-search">
                <input type="text" id="forum-search" placeholder="Tìm bài viết, phim..." data-i18n="search_placeholder">
                <i class="fas fa-search"></i>
            </div>
        </div>

        <div class="sidebar-block">
            <h4 class="sidebar-title">PHIM ĐANG HOT</h4>
            <div id="sidebar-tags" class="tag-list">
                <!-- JS renders movie tags here -->
                <div class="loading-spinner" style="padding:10px; font-size:12px;" data-i18n="Đang tải...">Đang tải...</div>
            </div>
        </div>

        <div class="sidebar-block">
            <h4 class="sidebar-title">VỀ CỘNG ĐỒNG</h4>
            <p style="font-size:13px; color:var(--text-dim); line-height:1.6;">
                Nơi chia sẻ cảm xúc, đánh giá và thảo luận về những bộ phim bom tấn tại D Prime Cinema. 
                Hãy tôn trọng ý kiến cá nhân và không spoil nội dung phim bạn nhé!
            </p>
        </div>
    </div>
</div>

<!-- MODAL ĐĂNG BÀI -->
<div class="forum-modal" id="post-modal">
    <div class="modal-content">
        <div class="modal-header">
            <span class="modal-title" data-i18n="forum_new_post">Bài viết mới</span>
            <span class="modal-close" id="close-modal">&times;</span>
        </div>
        <div class="modal-body">
            <form id="post-form">
                <div class="post-form-group">
                    <label>Tiêu đề</label>
                    <input type="text" id="post-title" class="post-input" placeholder="Tóm tắt nội dung bài viết..." required>
                </div>
                
                <div class="post-form-group">
                    <label>Tag phim (Gán phim để review)</label>
                    <select id="movie-select" class="post-select">
                        <!-- JS renders movie list here -->
                    </select>
                </div>

                <div class="post-form-group" id="rating-group" style="display: none;">
                    <label>Đánh giá phim (Số sao)</label>
                    <div class="rating-input">
                        <input type="hidden" id="rating-value" value="0">
                        <i class="far fa-star star-icon" data-value="1"></i>
                        <i class="far fa-star star-icon" data-value="2"></i>
                        <i class="far fa-star star-icon" data-value="3"></i>
                        <i class="far fa-star star-icon" data-value="4"></i>
                        <i class="far fa-star star-icon" data-value="5"></i>
                        <i class="far fa-star star-icon" data-value="6"></i>
                        <i class="far fa-star star-icon" data-value="7"></i>
                        <i class="far fa-star star-icon" data-value="8"></i>
                        <i class="far fa-star star-icon" data-value="9"></i>
                        <i class="far fa-star star-icon" data-value="10"></i>
                    </div>
                </div>

                <div class="post-form-group">
                    <label>Nội dung</label>
                    <textarea id="post-content-input" class="post-textarea" placeholder="Bạn nghĩ sao về phim này?" required></textarea>
                </div>

                <div class="modal-footer">
                    <button type="submit" class="btn-submit-post">Đăng bài</button>
                </div>
            </form>
        </div>
    </div>
</div>

<script src="./assets/js/forum.js?v=<?php echo time(); ?>"></script>

<script>
// Cập nhật UI avatar và hiện rating nếu chọn phim
document.addEventListener("DOMContentLoaded", () => {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (user) {
        const avatarImg = document.getElementById("user-avatar-current");
        if (avatarImg) {
            const avatarPath = user.avatar ? (user.avatar.startsWith('/') ? user.avatar : '/' + user.avatar) : null;
            const API_BASE = window.location.origin + "/api";
            avatarImg.src = avatarPath 
                ? `${API_BASE}/auth${avatarPath}` 
                : `https://ui-avatars.com/api/?name=${user.username}&background=e71a0f&color=fff`;
        }
    }

    const movieSelect = document.getElementById("movie-select");
    const ratingGroup = document.getElementById("rating-group");
    if (movieSelect && ratingGroup) {
        movieSelect.addEventListener("change", () => {
            ratingGroup.style.display = movieSelect.value ? "block" : "none";
        });
    }
});
</script>
