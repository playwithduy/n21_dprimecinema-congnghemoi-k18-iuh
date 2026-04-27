const Movie = require("../models/movie.model");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// ==========================
// HELPERS
// ==========================
const getAssetUrl = (path) => path && !path.startsWith('http') ? `/uploads/posters/${path.split('/').pop()}` : path;
const getAvatarUrl = (path) => path && !path.startsWith('http') ? `/uploads/avatars/${path.split('/').pop()}` : path;

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// ==========================
// ADMIN CRUD HANDLERS
// ==========================
exports.getAllAdmin = async (req, res) => {
  try {
    const movies = await Movie.getAllAdmin();
    const result = movies.map(m => ({
      ...m,
      poster: getAssetUrl(m.poster)
    }));
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.createMovie = async (req, res) => {
  try {
    const movieData = {
      ...req.body,
      poster: req.file ? req.file.filename : req.body.poster
    };
    const id = await Movie.create(movieData);
    res.status(201).json({ message: "Thêm phim thành công", id });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateMovie = async (req, res) => {
  try {
    const id = req.params.id;
    const updateData = { ...req.body };
    if (req.file) updateData.poster = req.file.filename;

    await Movie.update(id, updateData);
    res.json({ message: "Cập nhật thành công" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteMovie = async (req, res) => {
  try {
    await Movie.delete(req.params.id);
    res.json({ message: "Xoá phim thành công" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// ==========================
// PUBLIC HANDLERS
// ==========================
exports.getNowShowing = async (req, res) => {
  try {
    const movies = await Movie.getNowShowing();
    const result = movies.map(m => ({
      ...m,
      poster: getAssetUrl(m.poster)
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.getComingSoon = async (req, res) => {
  try {
    const movies = await Movie.getComingSoon();
    const result = movies.map(m => ({
      ...m,
      poster: getAssetUrl(m.poster)
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.getRanking = async (req, res) => {
  try {
    const movies = await Movie.getRanking();
    const result = movies.map(m => ({
      ...m,
      poster: getAssetUrl(m.poster)
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.getMovieBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const movie = await Movie.getBySlug(slug);

    if (!movie) {
      return res.status(404).json({ message: "Không tìm thấy phim" });
    }

    res.json({
      ...movie,
      poster: getAssetUrl(movie.poster)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

exports.search = async (req, res) => {
  try {
    const keyword = req.query.keyword || "";
    const movies  = await Movie.search(keyword);
    const result  = movies.map(m => ({
      ...m,
      poster: getAssetUrl(m.poster)
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// ==========================
// REVIEWS
// ==========================
exports.getReviews = async (req, res) => {
    try {
        const { slug } = req.params;
        const reviews = await Movie.getReviewsBySlug(slug);
        res.json(reviews);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};

exports.createReview = async (req, res) => {
    try {
        const { slug } = req.params;
        const result = await Movie.createReview({
            movie_slug: slug,
            ...req.body
        });
        res.status(201).json({ message: "Đánh giá thành công", id: result.insertId });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};

// ==========================
// CHATBOT
// ==========================
exports.handleChatbot = async (req, res) => {
    try {
        const { message, history } = req.body;
        if (!message) return res.status(400).json({ message: "Message is required" });

        // Simple search logic
        const foundMovies = await Movie.searchFlexible(message);
        let context = "";
        if (foundMovies.length > 0) {
            context = "Thông tin phim liên quan: " + foundMovies.map(m => `${m.title} (${m.description.substring(0, 50)}...)`).join(", ");
        }

        const prompt = `Bạn là trợ lý ảo D-Bot của rạp phim D PRIME CINEMA.
        ${context}
        Người dùng hỏi: ${message}
        Hãy trả lời thân thiện, ngắn gọn. Nếu có phim phù hợp hãy giới thiệu.`;

        const chatResult = await model.generateContent(prompt);
        const response = await chatResult.response;
        const text = response.text();

        res.json({
            reply: text,
            movies: foundMovies.map(m => ({
                ...m,
                poster: getAssetUrl(m.poster),
                link: `/v/${m.slug}--` // Simplified link for chatbot
            }))
        });
    } catch (err) {
        console.error("CHATBOT ERROR:", err);
        res.status(500).json({ reply: "Xin lỗi, tôi đang gặp chút trục trặc. Bạn vui lòng quay lại sau nhé!" });
    }
};