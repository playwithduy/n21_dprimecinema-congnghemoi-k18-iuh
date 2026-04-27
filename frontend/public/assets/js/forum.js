const FORUM_API = window.location.protocol + "//" + window.location.hostname + ":3000/api/forum";

document.addEventListener("DOMContentLoaded", () => {
  const forumFeed = document.getElementById("forum-feed");
  const postModal = document.getElementById("post-modal");
  const writeBox = document.getElementById("write-box");
  const closeBtn = document.getElementById("close-modal");
  const postForm = document.getElementById("post-form");
  const movieSelect = document.getElementById("movie-select");
  const starIcons = document.querySelectorAll(".star-icon");
  const ratingInput = document.getElementById("rating-value");
  const sidebarTags = document.getElementById("sidebar-tags");
  const forumSearch = document.getElementById("forum-search");
  const activeFilterContainer = document.getElementById("active-filter-container");
  const filterText = document.getElementById("filter-text");
  const clearFilterBtn = document.getElementById("clear-filter");
  
  let movies = [];
  let user = JSON.parse(localStorage.getItem("user") || "null");
  let token = localStorage.getItem("token");
  let editingPostId = null;
  let currentFilter = { movie_id: null, search: "" };

  // Initial load
  if (forumFeed) loadPosts();
  if (movieSelect) loadMovies();

  // --- MODAL LOGIC ---
  if (writeBox) {
    writeBox.addEventListener("click", () => {
      if (!user) {
        alert("Vui lòng đăng nhập để đăng bài!");
        return;
      }
      openModal();
    });
  }

  function openModal(post = null) {
    if (post) {
      editingPostId = post.id;
      document.querySelector(".modal-title").innerText = "Chỉnh sửa bài viết";
      document.querySelector(".btn-submit-post").innerText = "Lưu thay đổi";
      document.getElementById("post-title").value = post.title;
      document.getElementById("post-content-input").value = post.content;
      movieSelect.value = post.movie_id || "";
      ratingInput.value = post.rating || 0;
      updateStars(post.rating || 0);
      document.getElementById("rating-group").style.display = post.movie_id ? "block" : "none";
    } else {
      editingPostId = null;
      document.querySelector(".modal-title").innerText = "Bài viết mới";
      document.querySelector(".btn-submit-post").innerText = "Đăng bài";
      postForm.reset();
      updateStars(0);
      document.getElementById("rating-group").style.display = "none";
    }
    postModal.style.display = "flex";
    document.body.style.overflow = "hidden";
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      postModal.style.display = "none";
      document.body.style.overflow = "auto";
    });
  }

  window.onclick = (e) => {
    if (e.target == postModal) {
      postModal.style.display = "none";
      document.body.style.overflow = "auto";
    }
  };

  // --- RATING LOGIC ---
  starIcons.forEach(star => {
    star.addEventListener("click", () => {
      const val = star.getAttribute("data-value");
      ratingInput.value = val;
      updateStars(val);
    });
  });

  function updateStars(val) {
    starIcons.forEach(s => {
      s.classList.toggle("active", s.getAttribute("data-value") <= val);
    });
  }

  // --- LOAD MOVIES FOR TAG ---
  async function loadMovies() {
    try {
      const res = await fetch(`${FORUM_API}/movies`);
      movies = await res.json();
      
      movieSelect.innerHTML = '<option value="">-- Chọn phim (không bắt buộc) --</option>';
      movies.forEach(m => {
        movieSelect.innerHTML += `<option value="${m.id}">${m.title}</option>`;
      });

      // Render sidebar tags
      if (sidebarTags) {
        sidebarTags.innerHTML = movies.slice(0, 8).map(m => `
          <div class="sidebar-tag" onclick="handleFilter({movie_id: ${m.id}, title: '${getMovieTitle(m)}'})">
            ${getMovieTitle(m)}
          </div>
        `).join("");
      }
    } catch (err) {
      console.error("Load movies error:", err);
    }
  }

  // --- LOAD & FILTER POSTS ---
  async function loadPosts() {
    forumFeed.innerHTML = `<div class="loading-spinner">${t('Đang tải...') || 'Đang tải bảng tin...'}</div>`;
    try {
      let url = `${FORUM_API}/posts?`;
      if (currentFilter.movie_id) url += `movie_id=${currentFilter.movie_id}&`;
      if (currentFilter.search) url += `search=${encodeURIComponent(currentFilter.search)}&`;

      const res = await fetch(url, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      renderPosts(data.posts);
    } catch (err) {
      forumFeed.innerHTML = '<div class="loading-spinner" style="color:#e50914;">Lỗi kết nối máy chủ.</div>';
    }
  }

  window.handleFilter = (filter) => {
    currentFilter.movie_id = filter.movie_id;
    if (filter.movie_id) {
      filterText.innerText = `Đang lọc: ${filter.title}`;
      activeFilterContainer.style.display = "block";
    } else {
      activeFilterContainer.style.display = "none";
    }
    loadPosts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (clearFilterBtn) {
    clearFilterBtn.addEventListener("click", () => handleFilter({ movie_id: null }));
  }

  if (forumSearch) {
    let searchTimeout;
    forumSearch.addEventListener("input", (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        currentFilter.search = e.target.value;
        loadPosts();
      }, 500);
    });
  }

  function renderPosts(posts) {
    if (posts.length === 0) {
      forumFeed.innerHTML = `<div class="loading-spinner">${t('Không tìm thấy bài viết nào.') || 'Không tìm thấy bài viết nào.'}</div>`;
      return;
    }

    forumFeed.innerHTML = posts.map(post => {
      const timeStr = formatTime(post.created_at);
      const avatarPath = post.avatar ? (post.avatar.startsWith('/') ? post.avatar : '/' + post.avatar) : null;
      const avatar = avatarPath 
        ? `${window.location.protocol}//${window.location.hostname}:3000/api/auth${avatarPath}` 
        : "https://ui-avatars.com/api/?name=" + encodeURIComponent(post.username || "U") + "&background=e71a0f&color=fff";
      // FIX: Ép kiểu INT để so sánh chính xác
      const isOwner = user && parseInt(post.user_id) === parseInt(user.id);
      
      return `
        <div class="forum-post" data-id="${post.id}">
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
                ${isOwner ? `
                  <button class="edit-btn" onclick="prepareEdit(${post.id})">
                    <i class="far fa-edit"></i>
                  </button>
                  <button class="delete-btn" onclick="handleDelete(event, ${post.id})">
                    <i class="far fa-trash-alt"></i>
                  </button>
                ` : ''}
              </div>
            </div>
            <div class="post-title" onclick="openThread(${post.id})">${post.title}</div>
            <div class="post-content" onclick="openThread(${post.id})">${post.content}</div>
            
            ${post.movie_id ? `
              <div class="post-tag" onclick="handleFilter({movie_id: ${post.movie_id}, title: '${getMovieTitle({title: post.movie_title, original_title: post.original_title})}'})">
                <i class="fas fa-ticket-alt"></i> ${getMovieTitle({title: post.movie_title, original_title: post.original_title})}
              </div>
            ` : ''}

            <div class="post-footer">
              <button class="footer-item like-btn ${post.liked ? 'liked' : ''}" onclick="handleLike(event, ${post.id})">
                <i class="${post.liked ? 'fas' : 'far'} fa-heart"></i>
                <span>${post.likes || 0}</span>
              </button>
              <button class="footer-item" onclick="openThread(${post.id})">
                <i class="far fa-comment"></i>
                <span>${post.comment_count || 0}</span>
              </button>
            </div>
          </div>
        </div>
      `;
    }).join("");
  }

  // --- SUBMIT (CREATE OR UPDATE) ---
  if (postForm) {
    postForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const btn = postForm.querySelector(".btn-submit-post");
      btn.disabled = true;

      const title = document.getElementById("post-title").value;
      const content = document.getElementById("post-content-input").value;
      const movieId = movieSelect.value;
      const movieTitle = movieSelect.options[movieSelect.selectedIndex].text;
      const rating = ratingInput.value;

      const payload = {
        title, content, 
        movie_id: movieId || null,
        movie_title: movieId ? movieTitle : null,
        rating: rating || null,
        type: rating ? 'review' : 'discussion',
        username: user.fullname || user.username,
        avatar: user.avatar
      };

      try {
        const method = editingPostId ? "PUT" : "POST";
        const url = editingPostId ? `${FORUM_API}/posts/${editingPostId}` : `${FORUM_API}/posts`;

        const res = await fetch(url, {
          method,
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          postModal.style.display = "none";
          loadPosts();
        } else {
          const err = await res.json();
          alert(err.message);
        }
      } catch (err) {
        alert("Lỗi kết nối!");
      } finally {
        btn.disabled = false;
      }
    });
  }

  window.prepareEdit = async (postId) => {
    try {
      const res = await fetch(`${FORUM_API}/posts/${postId}`);
      const post = await res.json();
      openModal(post);
    } catch (err) {
      alert("Lỗi tải thông tin bài viết!");
    }
  };

  window.openThread = (id) => {
    // We can pass extra params like 'id' to encodeLink
    window.location.href = window.encodeLink("thread", `topic-${id}`, { id: id });
  };


  window.handleLike = async (e, postId) => {
    e.stopPropagation();
    if (!user) {
      alert("Vui lòng đăng nhập để like!");
      return;
    }
    try {
      const res = await fetch(`${FORUM_API}/posts/${postId}/like`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      const btn = e.currentTarget;
      const icon = btn.querySelector("i");
      const span = btn.querySelector("span");
      if (data.liked) {
        btn.classList.add("liked");
        icon.className = "fas fa-heart";
        span.innerText = parseInt(span.innerText) + 1;
      } else {
        btn.classList.remove("liked");
        icon.className = "far fa-heart";
        span.innerText = parseInt(span.innerText) - 1;
      }
    } catch (err) { console.error(err); }
  };

  window.handleDelete = async (e, postId) => {
    e.stopPropagation();
    if (!confirm("Bạn có chắc muốn xóa bài này?")) return;
    try {
      const res = await fetch(`${FORUM_API}/posts/${postId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const postEl = document.querySelector(`.forum-post[data-id="${postId}"]`);
        if (postEl) {
          postEl.style.opacity = "0";
          setTimeout(() => postEl.remove(), 300);
        }
        if (window.location.href.includes('thread')) window.location.href = 'index.php?p=Zm9ydW0=';
      }
    } catch (err) { alert("Lỗi khi xóa!"); }
  };

  function formatTime(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    if (diff < 60) return t("vừa xong") || "vừa xong";
    if (diff < 3600) return Math.floor(diff / 60) + " " + t("phút");
    if (diff < 86400) return Math.floor(diff / 3600) + " " + t("giờ");
    return Math.floor(diff / 86400) + " " + t("ngày");
  }
});
