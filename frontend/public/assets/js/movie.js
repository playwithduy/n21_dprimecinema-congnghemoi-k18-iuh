(() => {
const API_BASE = window.location.origin + "/api";
const API = `${API_BASE}/movies`;

let currentMovieId = null;
let trailerUrl = null;

/* ================= TRAILER HELPERS ================= */

function getYoutubeEmbedUrl(url) {
    if (!url) return "";

    if (url.includes("youtube.com/embed/")) {
        return url + (url.includes("?") ? "&autoplay=1" : "?autoplay=1");
    }

    const match = url.match(/(?:youtube\.com.*v=|youtu\.be\/)([^&]+)/);

    return match
        ? `https://www.youtube.com/embed/${match[1]}?autoplay=1`
        : "";
}

function openTrailerModal() {
    const embedUrl = getYoutubeEmbedUrl(trailerUrl);

    if (!embedUrl) return;

    document.getElementById("mvTrailerFrame").src = embedUrl;
    document.getElementById("mvTrailerOverlay").classList.add("active");
}

function closeTrailerModal() {
    document.getElementById("mvTrailerOverlay").classList.remove("active");
    document.getElementById("mvTrailerFrame").src = "";
}

/* ================= HELPERS ================= */

function setElText(id, text) {
    const el = document.getElementById(id);
    if (el) el.innerText = text;
}

function translateValue(val) {
    if (!val) return val;

    const lang = localStorage.getItem("lang") || "vi";

    if (lang === "vi") return val;

    return val
        .split(",")
        .map(v => {
            const trimmed = v.trim();
            return window.t(trimmed);
        })
        .join(", ");
}

/* ================= LOAD MOVIE DETAIL ================= */

async function loadMovieDetail() {
    try {
        const res = await fetch(`${API}/slug/${slug}`);

        if (!res.ok) {
            throw new Error("Movie API Error");
        }

        const movie = await res.json();

        currentMovieId = movie.id;
        trailerUrl = movie.trailer_url || null;

        renderMovieInfo(movie);

        await loadInlineShowtimes(currentMovieId);

        loadNowShowingSidebar();

    } catch (err) {
        console.error("MOVIE ERROR:", err);

        if (typeof Toast !== "undefined") {
            Toast.error(t("Không tải được dữ liệu phim"), "Error");
        }
    }
}

function renderMovieInfo(movie) {

    /* POSTER */
    const posterEl = document.getElementById("moviePoster");
    const posterSk = document.getElementById("moviePosterSkeleton");

    if (posterEl) {
        posterEl.src = getAssetUrl(movie.poster);
        posterEl.style.display = "block";

        if (posterSk) posterSk.style.display = "none";
    }

    /* TITLE */
    const titleEl = document.getElementById("movieTitleDetail");

    if (titleEl) {
        titleEl.classList.remove("skeleton", "sk-title");

        titleEl.setAttribute("data-movie-title", movie.title);
        titleEl.setAttribute(
            "data-movie-original",
            movie.original_title || movie.title
        );

        titleEl.innerText = getMovieTitle(movie);
    }

    /* INFO */
    setElText(
        "movieDirector",
        translateValue(movie.director) || t("Đang cập nhật")
    );

    setElText(
        "movieActors",
        translateValue(movie.actors) || t("Đang cập nhật")
    );

    setElText(
        "movieGenre",
        translateValue(movie.genres) || t("Đang cập nhật")
    );

    setElText(
        "movieDuration",
        (movie.duration || 0) + " " + t("movie_duration")
    );

    setElText(
        "movieDurationCompact",
        (movie.duration || 0) + " " + t("movie_duration")
    );

    setElText(
        "movieLanguage",
        translateValue(movie.language || movie.country) ||
        t("Đang cập nhật")
    );

    /* DATE */
    const date = movie.release_date
        ? new Date(movie.release_date)
        : new Date();

    const year = date.getFullYear();

    const durationText =
        (movie.duration || 0) + " " + t("movie_duration");

    /* META */
    const metaRow = document.getElementById("movieMetaRow");

    if (metaRow) {
        metaRow.innerHTML = `
            <span id="movieOriginalTitle">
                ${movie.original_title || ""}
            </span>

            <span class="dot-separator">•</span>

            <span id="movieYear">
                ${year}
            </span>

            <span class="dot-separator">•</span>

            <span id="movieDuration">
                ${durationText}
            </span>
        `;
    }

    /* DESCRIPTION */
    let desc = movie.description;

    if (
        localStorage.getItem("lang") === "en" &&
        movie.original_title === "Our House"
    ) {
        desc =
            "Our House revolves around the story of a young couple who move into a large isolated villa with a surprisingly cheap price. However, they soon realize that the house holds dark secrets...";
    }

    const descEl = document.getElementById("movieDescription");
    const descSk = document.getElementById("movieDescSkeleton");
    const descToggle = document.getElementById("toggleDescription");

    if (descEl) {
        descEl.innerText =
            desc || t("Đang cập nhật nội dung...");

        descEl.style.display = "block";

        if (descSk) descSk.style.display = "none";

        if (descToggle) descToggle.style.display = "inline";
    }

    /* SHOWTIME TITLE */
    const stTitleEl = document.getElementById("stMovieTitle");

    if (stTitleEl) {
        stTitleEl.setAttribute("data-movie-title", movie.title);

        stTitleEl.setAttribute(
            "data-movie-original",
            movie.original_title || movie.title
        );

        stTitleEl.innerText = getMovieTitle(movie);
    }

    /* RELEASE */
    setElText(
        "movieRelease",
        date.toLocaleDateString("vi-VN")
    );

    /* AGE */
    let age = (movie.age_limit || "P")
        .toString()
        .replace("+", "");

    const ageTag = document.getElementById("movieAge");

    if (ageTag) {

        if (age === "P") {

            ageTag.innerText = "P";
            ageTag.style.background = "#4CAF50";

        } else {

            ageTag.innerText = "T" + age;

            if (age === "13") {
                ageTag.style.background = "#f6c200";
            }

            if (age === "16") {
                ageTag.style.background = "#ff7a00";
            }

            if (age === "18") {
                ageTag.style.background = "#e53935";
            }
        }
    }

    /* TRAILER BUTTON */
    const btnTrailer = document.getElementById("btnTrailer");

    if (btnTrailer) {

        if (!trailerUrl) {
            btnTrailer.style.display = "none";
        } else {
            btnTrailer.onclick = openTrailerModal;
        }
    }
}

/* ================= TOGGLE DESCRIPTION ================= */

const toggleDescriptionBtn =
    document.getElementById("toggleDescription");

if (toggleDescriptionBtn) {

    toggleDescriptionBtn.onclick = () => {

        const desc =
            document.getElementById("movieDescription");

        const toggle =
            document.getElementById("toggleDescription");

        if (!desc || !toggle) return;

        if (desc.classList.contains("short")) {

            desc.classList.remove("short");

            toggle.innerHTML =
                `...${t("Thu gọn") || "Thu gọn"}`;

        } else {

            desc.classList.add("short");

            toggle.innerHTML =
                `...<span data-i18n="load_more">${t("load_more")}</span>`;
        }
    };
}

/* ================= TRAILER MODAL ================= */

const trailerCloseBtn =
    document.getElementById("mvTrailerClose");

if (trailerCloseBtn) {
    trailerCloseBtn.onclick = closeTrailerModal;
}

const trailerOverlay =
    document.getElementById("mvTrailerOverlay");

if (trailerOverlay) {

    trailerOverlay.onclick = (e) => {

        if (e.target.id === "mvTrailerOverlay") {
            closeTrailerModal();
        }
    };
}

/* ================= SHOWTIMES ================= */

async function loadInlineShowtimes(movieId) {

    const inlineDateList =
        document.getElementById("inlineDateList");

    const inlineContent =
        document.getElementById("inlineBookingContent");

    if (!inlineDateList || !inlineContent) return;

    try {

        const res = await fetch(
            `${API_BASE}/showtimes/movie/${movieId}`
        );

        if (!res.ok) {
            throw new Error("Showtime API Error");
        }

        const data = await res.json();

        if (
            !data ||
            !data.dates ||
            data.dates.length === 0
        ) {

            inlineDateList.innerHTML = "";

            inlineContent.innerHTML =
                "<p>⚠️ Hiện tại phim chưa có suất chiếu nào.</p>";

            return;
        }

        const showtimeMap = {};

        data.dates.forEach(d => {
            showtimeMap[d.date] = d;
        });

        function getTodayVN() {

            const now = new Date();

            const vn = new Date(
                now.toLocaleString("en-US", {
                    timeZone: "Asia/Ho_Chi_Minh"
                })
            );

            vn.setHours(0, 0, 0, 0);

            return vn;
        }

        function generateRolling7Days() {

            const today = getTodayVN();

            const days = [];

            for (let i = 0; i < 7; i++) {

                const d = new Date(today);

                d.setDate(today.getDate() + i);

                days.push(
                    `${d.getFullYear()}-${String(
                        d.getMonth() + 1
                    ).padStart(2, "0")}-${String(
                        d.getDate()
                    ).padStart(2, "0")}`
                );
            }

            return days;
        }

        const rollingDays = generateRolling7Days();

        inlineDateList.innerHTML = "";

        rollingDays.forEach(dateStr => {

            const btn = document.createElement("button");

            btn.className = "date-btn";

            btn.innerText = dateStr
                .split("-")
                .reverse()
                .slice(0, 2)
                .join("/");

            btn.onclick = () => {

                document
                    .querySelectorAll(
                        "#inlineDateList .date-btn"
                    )
                    .forEach(b => b.classList.remove("active"));

                btn.classList.add("active");

                if (showtimeMap[dateStr]) {

                    const oldContent =
                        document.getElementById(
                            "bookingContent"
                        );

                    if (oldContent) {
                        oldContent.id =
                            "bookingContent_hidden";
                    }

                    inlineContent.id = "bookingContent";

                    if (window.renderShowtimes) {
                        renderShowtimes(showtimeMap[dateStr]);
                    }

                    inlineContent.id =
                        "inlineBookingContent";

                    const hidden =
                        document.getElementById(
                            "bookingContent_hidden"
                        );

                    if (hidden) {
                        hidden.id = "bookingContent";
                    }

                } else {

                    inlineContent.innerHTML =
                        "<p>⚠️ Chưa có suất chiếu cho ngày này</p>";
                }
            };

            inlineDateList.appendChild(btn);
        });

        const firstAvailable =
            rollingDays.find(d => showtimeMap[d]);

        if (firstAvailable) {

            const idx =
                rollingDays.indexOf(firstAvailable);

            inlineDateList.children[idx].click();

        } else {

            inlineContent.innerHTML =
                "<p>⚠️ Không có suất chiếu trong 7 ngày tới</p>";
        }

    } catch (e) {

        console.error(e);

        inlineDateList.innerHTML = "";

        inlineContent.innerHTML =
            "Lỗi khi tải suất chiếu.";
    }
}

/* ================= SIDEBAR ================= */

async function loadNowShowingSidebar() {

    const listDiv =
        document.getElementById(
            "now-showing-sidebar-list"
        );

    if (!listDiv) return;

    try {

        const res = await fetch(
            `${API}/now-showing`
        );

        const movies = await res.json();

        listDiv.innerHTML = "";

        const subset = movies.slice(0, 4);

        subset.forEach(m => {

            const link =
                window.encodeLink("movie", m.slug);

            listDiv.innerHTML += `
                <a href="${link}" class="sidebar-movie-card">

                    <img
                        src="${getAssetUrl(m.poster)}"
                        class="sidebar-poster"
                        alt="${getMovieTitle(m)}"
                        loading="lazy"
                    >

                    <div class="sidebar-info">

                        <div
                            class="sidebar-title"
                            data-movie-title="${m.title}"
                            data-movie-original="${m.original_title || m.title}"
                        >
                            ${getMovieTitle(m)}
                        </div>

                        <span class="sidebar-tag">
                            ${m.age_limit}
                        </span>

                        <div class="sidebar-rating">
                            ⭐ ${parseFloat(
                m.rating || 9.4
            ).toFixed(1)}
                        </div>

                    </div>

                </a>
            `;
        });

    } catch (e) {

        console.error(e);

        listDiv.innerHTML = "Lỗi tải phim.";
    }
}

/* ================= REVIEWS ================= */

let selectedRating = 10;
let selectedTags = [];

function initReviewEvents() {

    const stars =
        document.querySelectorAll("#ratingPicker i");

    stars.forEach(star => {

        star.addEventListener("click", () => {

            selectedRating = parseInt(
                star.getAttribute("data-rating")
            );

            stars.forEach(s => {

                const r = parseInt(
                    s.getAttribute("data-rating")
                );

                if (r <= selectedRating) {
                    s.classList.add("active");
                } else {
                    s.classList.remove("active");
                }
            });
        });
    });

    const star10 =
        document.querySelector(
            "#ratingPicker i[data-rating='10']"
        );

    if (star10) star10.click();

    const tags =
        document.querySelectorAll(
            "#reviewTagsPicker .tag-btn"
        );

    tags.forEach(tag => {

        tag.addEventListener("click", () => {

            const val =
                tag.getAttribute("data-tag");

            if (tag.classList.contains("selected")) {

                tag.classList.remove("selected");

                selectedTags =
                    selectedTags.filter(
                        t => t !== val
                    );

            } else {

                tag.classList.add("selected");

                selectedTags.push(val);
            }
        });
    });

    const btnSubmit =
        document.getElementById("btnSubmitReview");

    if (btnSubmit) {
        btnSubmit.addEventListener(
            "click",
            submitReview
        );
    }
}

async function loadReviews() {

    const listEl =
        document.getElementById("reviewList");

    const countEl =
        document.getElementById(
            "totalReviewsCount"
        );

    if (!listEl) return;

    try {

        const res = await fetch(
            `${API}/slug/${slug}/reviews`
        );

        const reviews = await res.json();

        if (countEl) {
            countEl.innerText = reviews.length;
        }

        if (reviews.length === 0) {

            listEl.innerHTML = `
                <div style="text-align:center;color:#888;">
                    Chưa có bình luận nào.
                </div>
            `;

            return;
        }

        let html = "";
        let totalScore = 0;

        reviews.forEach(r => {

            totalScore += r.rating;

            let tagsHtml = "";
            let tagsArray = [];

            try {
                tagsArray =
                    typeof r.tags === "string"
                        ? JSON.parse(r.tags)
                        : r.tags;
            } catch (e) { }

            if (
                tagsArray &&
                Array.isArray(tagsArray) &&
                tagsArray.length > 0
            ) {

                tagsHtml =
                    `<div class="review-tags" style="margin-top:10px;">`
                    +
                    tagsArray
                        .map(
                            t =>
                                `<span class="review-tag">${t}</span>`
                        )
                        .join("")
                    +
                    `</div>`;
            }

            html += `
                <div class="review-item">

                    <div class="review-user-info">

                        <img
                            src="${getAssetUrl(r.user_avatar)}"
                            class="reviewer-avatar"
                        >

                        <div class="reviewer-details">

                            <span class="reviewer-name">
                                ${r.user_name}
                            </span>

                            <div class="reviewer-meta">
                                <span>Vừa xong</span>

                                <span class="verified-badge">
                                    <i class="fa-solid fa-circle-check"></i>
                                    Đã mua vé
                                </span>
                            </div>

                        </div>

                    </div>

                    <div class="review-stars">
                        <i class="fa-solid fa-star"></i>
                        ${r.rating}/10
                    </div>

                    <div class="review-content">
                        ${r.content}
                    </div>

                    ${tagsHtml}

                </div>
            `;
        });

        listEl.innerHTML = html;

        const avg =
            (totalScore / reviews.length).toFixed(1);

        const overallEl =
            document.getElementById("overallRating");

        if (overallEl) {
            overallEl.innerText = avg;
        }

    } catch (e) {

        console.error(e);

        listEl.innerHTML = `
            <div style="text-align:center;color:red;">
                Lỗi tải bình luận
            </div>
        `;
    }
}

async function submitReview() {

    const content =
        document.getElementById(
            "reviewContent"
        ).value.trim();

    if (!content && selectedTags.length === 0) {

        Toast.info(
            t(
                "Vui lòng chia sẻ cảm nhận hoặc chọn ít nhất một nhãn nha!"
            ),
            "Review"
        );

        return;
    }

    let userObj = {};

    try {
        userObj =
            JSON.parse(
                localStorage.getItem("user")
            ) || {};
    } catch (e) { }

    const userName =
        userObj.fullname || "Khách D'Prime";

    const userAvatar =
        userObj.avatar ||
        "https://ui-avatars.com/api/?name=Guest&background=random";

    const payload = {
        user_name: userName,
        user_avatar: userAvatar,
        rating: selectedRating,
        content: content,
        tags: selectedTags
    };

    const btnSubmit =
        document.getElementById(
            "btnSubmitReview"
        );

    btnSubmit.innerText = "Đang gửi...";
    btnSubmit.disabled = true;

    try {

        const res = await fetch(
            `${API}/slug/${slug}/reviews`,
            {
                method: "POST",
                headers: {
                    "Content-Type":
                        "application/json"
                },
                body: JSON.stringify(payload)
            }
        );

        if (res.ok) {

            Toast.success(
                t("Cảm ơn bạn đã gửi đánh giá!"),
                "Success"
            );

            document.getElementById(
                "reviewContent"
            ).value = "";

            document
                .querySelectorAll(
                    "#reviewTagsPicker .tag-btn"
                )
                .forEach(t =>
                    t.classList.remove("selected")
                );

            selectedTags = [];

            loadReviews();

        } else {

            Toast.error(
                t(
                    "Lỗi khi gửi bình luận. Vui lòng thử lại!"
                ),
                "Error"
            );
        }

    } catch (e) {

        console.error(e);

        Toast.error(
            t("Lỗi kết nối Server."),
            "Connection Error"
        );
    }

    btnSubmit.innerText = "Gửi đánh giá";
    btnSubmit.disabled = false;
}

/* ================= INIT ================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadMovieDetail();

        initReviewEvents();

        loadReviews();
    }
);

/* ================= LANGUAGE CHANGE ================= */

window.addEventListener(
    "langChanged",
    () => {

        loadMovieDetail();

        loadNowShowingSidebar();
    }
);
})();