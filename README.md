cinema-booking-system/
│
├── README.md
├── docker-compose.yml
├── .env
│
├── frontend/                     # FRONTEND (PHP – router)
│   │
│   ├── public/
│   │   ├── index.php                 # ROUTER / ENTRY POINT
│   │   ├── .htaccess                 # Rewrite URL
│   │
│   │   ├── pages/
│   │   │   ├── home.php              # Trang chủ (mô phỏng rạp chiếu)
│   │   │   ├── movie.php             # Chi tiết phim + trailer
│   │   │   ├── showtime.php          # Suất chiếu
│   │   │   ├── booking.php           # Chọn ghế realtime
│   │   │   ├── checkout.php          # Thanh toán
│   │   │   ├── ticket.php            # Vé QR
│   │   │   ├── login.php
│   │   │   ├── register.php
│   │   │   ├── profile.php
│   │   │   └── 404.php
│   │
│   │   ├── layouts/
│   │   │   ├── header.php
│   │   │   ├── footer.php
│   │   │   ├── navbar.php
│   │   │   ├── cinema-header.php     # Header kiểu rạp chiếu
│   │   │   └── trailer-modal.php
│   │
│   │   ├── assets/
│   │   │   ├── css/
│   │   │   │   ├── base.css
│   │   │   │   ├── layout.css
│   │   │   │   ├── cinema.css
│   │   │   │   ├── seat.css
│   │   │   │   ├── animation.css
│   │   │   │   └── responsive.css
│   │   │   │
│   │   │   ├── js/
│   │   │   │   ├── api.js             # Call API Gateway
│   │   │   │   ├── slider.js          # Trailer slider
│   │   │   │   ├── booking.js         # Chọn ghế
│   │   │   │   ├── seat-realtime.js   # WebSocket client
│   │   │   │   ├── payment.js
│   │   │   │   └── auth.js
│   │   │   │
│   │   │   └── images/
│   │   │       ├── movies/
│   │   │       ├── seats/
│   │   │       └── icons/
│   │
│   │   ├── config/
│   │   │   ├── app.php
│   │   │   └── api.php                # API Gateway URL
│   │
│   │   ├── helpers/
│   │   │   ├── auth.php
│   │   │   ├── session.php
│   │   │   └── formatter.php
│   │
│   │   └── vendor/                    # Composer (nếu cần)
│
├── api-gateway/                       # API GATEWAY
│   ├── src/
│   │   ├── index.js
│   │   ├── routes/
│   │   │   ├── auth.route.js
│   │   │   ├── movie.route.js
│   │   │   ├── booking.route.js
│   │   │   └── payment.route.js
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.js
│   │   │   ├── rate-limit.js
│   │   │   └── proxy.js
│   │   └── config/
│   │       └── services.js
│   ├── package.json
│   └── Dockerfile
│
├── services/                          # MICROSERVICES
│   │
│   ├── auth-service/
│   │   ├── src/
│   │   │   ├── controllers/
│   │   │   ├── routes/
│   │   │   ├── models/
│   │   │   └── index.js
│   │   ├── package.json
│   │   └── Dockerfile
│   │
│   ├── movie-service/
│   │   ├── src/
│   │   │   ├── controllers/
│   │   │   ├── routes/
│   │   │   ├── models/
│   │   │   └── index.js
│   │
│   ├── booking-service/
│   │   ├── src/
│   │   │   ├── seat-manager.js
│   │   │   ├── routes/
│   │   │   └── index.js
│   │
│   ├── payment-service/
│   │   ├── src/
│   │   │   ├── vnpay.js
│   │   │   ├── momo.js
│   │   │   └── index.js
│   │
│   ├── notification-service/
│   │   ├── src/
│   │   │   ├── mailer.js              # PHPMailer
│   │   │   ├── qr-generator.js
│   │   │   └── index.js
│   │
│   └── websocket-service/
│       ├── src/
│       │   ├── socket.js
│       │   └── index.js
│
├── database/
│   ├── mysql/
│   │   ├── schema.sql
│   │   └── seed.sql
│   │
│   └── mongodb/
│       └── collections.json
│
└── docs/
    ├── architecture.png
    ├── api-spec.md
    └── sequence-diagram.md

CREATE TABLE movies (
  id INT AUTO_INCREMENT PRIMARY KEY,

  -- Thông tin cơ bản
  title VARCHAR(255) NOT NULL,                  -- Tên phim
  original_title VARCHAR(255),                  -- Tên gốc (nếu có)
  slug VARCHAR(255) UNIQUE,                     -- URL thân thiện
  description TEXT,                             -- Nội dung phim
  duration INT,                                 -- Thời lượng (phút)
  release_date DATE,                            -- Ngày khởi chiếu

  -- Phân loại
  genres VARCHAR(255),                          -- Kinh dị, Gây cấn
  country VARCHAR(100),                         -- Quốc gia
  age_limit VARCHAR(10),                        -- 18+, 16+, K
  status ENUM('NOW_SHOWING','COMING_SOON','STOPPED'),

  -- Hình ảnh & media
  poster VARCHAR(255),                          -- Poster dọc
  banner VARCHAR(255),                          -- Ảnh nền chi tiết
  trailer_url VARCHAR(255),                     -- Link trailer

  -- Đánh giá
  rating FLOAT DEFAULT 0,                       -- Điểm trung bình
  rating_count INT DEFAULT 0,                   -- Số lượt đánh giá

  -- SEO / hiển thị
  is_hot BOOLEAN DEFAULT 0,                     -- Phim nổi bật
  is_recommended BOOLEAN DEFAULT 0,             -- Gợi ý
  view_count INT DEFAULT 0,                     -- Lượt xem

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE cinemas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255),
    city VARCHAR(100),
    address VARCHAR(255)
);

CREATE TABLE rooms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cinema_id INT,
    name VARCHAR(100),
    FOREIGN KEY (cinema_id) REFERENCES cinemas(id)
);

CREATE TABLE showtimes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    movie_id INT,
    room_id INT,
    show_date DATE,
    show_time TIME,
    FOREIGN KEY (movie_id) REFERENCES movies(id),
    FOREIGN KEY (room_id) REFERENCES rooms(id)
);

CREATE TABLE seats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    room_id INT,
    seat_code VARCHAR(10),
    FOREIGN KEY (room_id) REFERENCES rooms(id)
);
