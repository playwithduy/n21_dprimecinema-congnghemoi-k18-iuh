(() => {
  const input     = document.getElementById("searchMovie");
  const resultBox = document.getElementById("searchResult");
  const API_BASE = window.location.origin + "/api";
  const API = `${API_BASE}/movies`;

  if (input) {

    let debounceTimer;

    input.addEventListener("keyup", function() {
      const keyword = this.value.trim();

      clearTimeout(debounceTimer);

      if (keyword.length < 1) {
        resultBox.style.display = "none";
        return;
      }

      debounceTimer = setTimeout(() => {

        fetch(`${API}/search?keyword=${encodeURIComponent(keyword)}`)
          .then(res => res.json())
          .then(data => {

            if (!data.length) {
              resultBox.innerHTML = `
                <div class="search-empty">
                  <i class="fa-solid fa-magnifying-glass"></i>
                  Không tìm thấy "<b>${keyword}</b>"
                </div>`;
              resultBox.style.display = "block";
              return;
            }

            resultBox.innerHTML = data.map(movie => `
              <div class="search-item" onclick="goMovie('${movie.slug}')">
                <img src="${movie.poster}" alt="${movie.title}"
                     onerror="this.style.display='none'">
                <div class="search-item-info">
                  <span class="search-item-title">${movie.title}</span>
                </div>
              </div>
            `).join("");

            resultBox.style.display = "block";

          })
          .catch(() => {
            resultBox.innerHTML = `<div class="search-empty">Lỗi tìm kiếm</div>`;
            resultBox.style.display = "block";
          });

      }, 250);
    });

  }

  function goMovie(slug) {
    window.location.href = window.encodeLink("movie", slug);
  }

  window.goMovie = goMovie;

  document.addEventListener("click", function(e) {
    if (resultBox && !e.target.closest(".topbar-search")) {
      resultBox.style.display = "none";
    }
  });
})();
