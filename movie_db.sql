-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 18, 2026 at 02:43 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";

CREATE DATABASE IF NOT EXISTS movie_db;
USE movie_db;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

CREATE DATABASE IF NOT EXISTS `movie_db`;
USE `movie_db`;

-- --------------------------------------------------------

--
-- Table structure for table `blog_posts`
--

CREATE TABLE `blog_posts` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `summary` text DEFAULT NULL,
  `content` longtext NOT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `author_id` int(11) DEFAULT NULL,
  `author_name` varchar(100) DEFAULT NULL,
  `views` int(11) DEFAULT 0,
  `category` varchar(50) DEFAULT 'Tin tức',
  `status` enum('draft','published') DEFAULT 'published',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `blog_posts`
--

INSERT INTO `blog_posts` (`id`, `title`, `slug`, `summary`, `content`, `image_url`, `author_id`, `author_name`, `views`, `category`, `status`, `created_at`, `updated_at`) VALUES
(1, 'Wicked: For Good - Nội dung, đánh giá, và lịch chiếu', 'wicked-for-good-noi-dung-djanh-gia-va-lich-chieu', 'Wicked - hiện tượng Broadway Musical về tình bạn và định mệnh, sắp trở lại với phần kết Wicked: For Good....', 'Nội dung chi tiết của bài viết Wicked: For Good...', 'http://localhost/N25_CNM_DPRIME/frontend/public/assets/images/blog/wicked.jpg', NULL, 'Admin D Prime', 414, 'Review', 'published', '2026-04-03 09:32:52', '2026-04-03 11:56:47'),
(2, 'Cần Biết Gì Về Avatar trước khi xem Avatar 2: Dòng Chảy Của Nước?', 'can-biet-gi-ve-avatar-truoc-khi-xem-avatar-2-dong-chay-cua-nuoc', 'Avatar: Dòng Chảy Của Nước sắp chiếu lại trong một tuần duy nhất tại Việt Nam từ 03/10/2025! Bài tóm tắt...', 'Nội dung chi tiết của bài viết Avatar 2...', 'http://localhost/N25_CNM_DPRIME/frontend/public/assets/images/blog/avatar.jpg', NULL, 'Admin D Prime', 911, 'Tin tức', 'published', '2026-04-03 09:32:52', '2026-04-03 11:57:13'),
(3, 'Phim chiếu rạp 2025 đáng mong đợi dành cho fan cine', 'phim-chieu-rap-2025-djang-mong-djoi-danh-cho-fan-cine', 'Cùng MoMo điểm qua nhanh những cái tên sẽ làm mưa làm gió trong năm 2025 với các tác phẩm điện ảnh nổ...', 'Nội dung chi tiết của bài viết Phim 2025...', 'http://localhost/N25_CNM_DPRIME/frontend/public/assets/images/blog/fancine.jpg', NULL, 'Admin D Prime', 30400, 'Tin tức', 'published', '2026-04-03 09:32:52', '2026-04-03 10:19:54'),
(5, '🎉 CHÀO MỪNG THÀNH VIÊN MỚI – NHẬN NGAY COUPON GIẢM 100K!', 'chao-mung-thanh-vien-moi-nhan-ngay-coupon-giam-100k-1775229677445', 'Nhận ngay ưu đãi giảm 100.000đ dành riêng cho thành viên mới tại DPrime Cinema. Đăng ký ngay – xem phim giá siêu hời!', '🎉 CHÀO MỪNG BẠN ĐẾN VỚI DPRIME CINEMA!\r\n\r\nLần đầu đến với DPrime Cinema?\r\nChúng tôi có món quà đặc biệt dành riêng cho bạn \r\nNhận ngay coupon giảm đến 100.000đ cho lần đặt vé đầu tiên!\r\n\r\n🎁 ƯU ĐÃI ĐẶC BIỆT\r\n🎟️ Mã khuyến mãi: DPRIME100\r\n💸 Giảm ngay: 100.000đ\r\n👤 Áp dụng: Thành viên mới\r\n⏰ Số lượng có hạn – hết là tiếc đó!\r\n🍿 TRẢI NGHIỆM ĐIỆN ẢNH ĐỈNH CAO\r\n\r\nTại DPrime Cinema, bạn sẽ được:\r\n\r\n🎬 Thưởng thức phim bom tấn mới nhất\r\n🔊 Âm thanh sống động – hình ảnh sắc nét\r\n🛋️ Không gian hiện đại, thoải mái\r\n\r\n👉 Tất cả với mức giá rẻ hơn 100K khi dùng mã!\r\n\r\n🚀 CÁCH NHẬN ƯU ĐÃI\r\n\r\nChỉ cần 3 bước cực nhanh:\r\n\r\nĐăng ký tài khoản\r\nChọn phim bạn muốn xem\r\nNhập mã DPRIME100 khi thanh toán\r\n\r\n💥 Giảm ngay 100K – áp dụng tức thì!\r\n\r\n🔥 ĐỪNG BỎ LỠ!\r\n\r\nƯu đãi chỉ dành cho người dùng mới và có giới hạn.\r\nĐăng ký ngay hôm nay để không bỏ lỡ cơ hội xem phim giá cực hời!\r\n\r\nHÀNH ĐỘNG NGAY', './assets/images/blog/1775229677424-601307506.png', 5, 'Admin 1', 2, 'Khuyến mãi', 'published', '2026-04-03 15:21:17', '2026-04-03 15:21:44'),
(6, '🔥 CUỐI TUẦN XEM PHIM CHỈ TỪ 50K?! CÓ THẬT KHÔNG?', 'cuoi-tuan-xem-phim-chi-tu-50k-co-that-khong-1775229997335', '', 'Bạn không nhìn nhầm đâu, DPrime Cinema đang tung ưu đãi cực sốc dành riêng cho cuối tuần khiến dân mê phim không thể ngồi yên. Chỉ cần nhập mã MOVIE50, bạn sẽ được giảm ngay 50.000đ khi đặt vé xem phim. Không cần săn sale, không cần chờ đợi, chỉ cần nhập mã là giá giảm liền.\r\n\r\n🍿 Đi xem phim giờ còn rẻ hơn cả một ly trà sữa. Bạn vẫn được xem phim bom tấn, trải nghiệm rạp chiếu hiện đại với âm thanh sống động và hình ảnh sắc nét, tất cả nhưng với mức giá cực kỳ “dễ chịu”. Ưu đãi áp dụng vào Thứ 6, Thứ 7 và Chủ nhật, quá hợp để rủ bạn bè hoặc người yêu đi chill cuối tuần.\r\n\r\n🚀 Cách sử dụng cực kỳ đơn giản, bạn chỉ cần chọn phim mình thích, chọn suất chiếu cuối tuần và nhập mã MOVIE50 khi thanh toán là được giảm ngay 50K. Nhanh gọn, không rườm rà, ai cũng dùng được.\r\n\r\n⚠️ Lưu ý nhỏ là ưu đãi có số lượng giới hạn, nên ai nhanh tay thì người đó hưởng. Chậm một chút là có thể lỡ mất deal ngon.\r\n\r\n🔥 Cuối tuần này nếu không đi xem phim thì đúng là… phí mất 50K rồi. Đừng bỏ lỡ cơ hội xem phim giá hời như vậy, đặt vé ngay hôm nay và tận hưởng trọn vẹn không khí điện ảnh tại DPrime Cinema! 🎬', './assets/images/blog/1775229997316-837289897.png', 5, 'Admin 1', 1, 'Khuyến mãi', 'published', '2026-04-03 15:26:37', '2026-04-06 23:54:04');

-- --------------------------------------------------------

--
-- Table structure for table `cinemas`
--

CREATE TABLE `cinemas` (
  `id` int(11) NOT NULL COMMENT 'ID rạp',
  `city_id` int(11) NOT NULL COMMENT 'ID thành phố',
  `name` varchar(255) NOT NULL COMMENT 'Tên rạp',
  `address` text NOT NULL COMMENT 'Địa chỉ rạp'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `cinemas`
--

INSERT INTO `cinemas` (`id`, `city_id`, `name`, `address`) VALUES
(1, 1, 'D Prime Cinema Nguyễn Văn Bảo', 'Số 12 Nguyễn Văn Bảo, P. Hạnh Thông, TP.HCM'),
(2, 1, 'D Prime Cinema An Hội Tây', 'Số 20 Đường số 53, Phường An Hội Tây, TP.HCM'),
(3, 1, 'D Prime Cinema Nguyễn Văn Dung', 'Số 10 Nguyễn Văn Dung, Phường An Nhơn, TP.HCM'),
(4, 2, 'D Prime Cinema Cầu Giấy', 'Quận Cầu Giấy, Hà Nội'),
(5, 2, 'D Prime Cinema Hai Bà Trưng', 'Quận Hai Bà Trưng, Hà Nội'),
(6, 2, 'D Prime Cinema Hà Đông', 'Quận Hà Đông, Hà Nội');

-- --------------------------------------------------------

--
-- Table structure for table `cities`
--

CREATE TABLE `cities` (
  `id` int(11) NOT NULL COMMENT 'ID thành phố',
  `name` varchar(100) NOT NULL COMMENT 'Tên thành phố'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `cities`
--

INSERT INTO `cities` (`id`, `name`) VALUES
(1, 'Hồ Chí Minh'),
(2, 'Hà Nội');

-- --------------------------------------------------------

--
-- Table structure for table `formats`
--

CREATE TABLE `formats` (
  `id` int(11) NOT NULL COMMENT 'ID định dạng',
  `name` varchar(100) NOT NULL COMMENT 'Định dạng phim (2D, 3D, IMAX)'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `formats`
--

INSERT INTO `formats` (`id`, `name`) VALUES
(1, 'IMAX 2D'),
(2, '2D'),
(3, '4DX'),
(4, 'SCREENX');

-- --------------------------------------------------------

--
-- Table structure for table `forum_comments`
--

CREATE TABLE `forum_comments` (
  `id` int(11) NOT NULL,
  `post_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `username` varchar(100) DEFAULT NULL,
  `avatar` varchar(255) DEFAULT NULL,
  `content` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `forum_likes`
--

CREATE TABLE `forum_likes` (
  `user_id` int(11) NOT NULL,
  `post_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `forum_likes`
--

INSERT INTO `forum_likes` (`user_id`, `post_id`) VALUES
(2, 2);

-- --------------------------------------------------------

--
-- Table structure for table `forum_posts`
--

CREATE TABLE `forum_posts` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `username` varchar(100) DEFAULT NULL,
  `avatar` varchar(255) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `movie_id` int(11) DEFAULT NULL,
  `movie_title` varchar(255) DEFAULT NULL,
  `type` enum('review','discussion','news') DEFAULT 'review',
  `rating` tinyint(4) DEFAULT NULL,
  `likes` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `forum_posts`
--

INSERT INTO `forum_posts` (`id`, `user_id`, `username`, `avatar`, `title`, `content`, `movie_id`, `movie_title`, `type`, `rating`, `likes`, `created_at`) VALUES
(1, 2, NULL, NULL, 'Thỏ ơi hay quá!', 'Trấn Thành năm nay làm phim rất hay! nội dung phim hấp dẫn không có gì để chê. Đến cuối vẫn xoay khán giả như chong chóng', 7, 'Thỏ ơi', 'review', 9, 0, '2026-04-02 16:31:43'),
(2, 2, 'Nguyễn Văn Duy', 'http://localhost:3001/uploads/avatars/1772999497797.jpg?t=1775147193025', 'Tình cha con thật cảm động', 'Phim đầu tay mà hay quá', 9, 'Nhà Ba Tôi Một Phòng', 'review', 9, 1, '2026-04-02 16:35:12');

-- --------------------------------------------------------

--
-- Table structure for table `languages`
--

CREATE TABLE `languages` (
  `id` int(11) NOT NULL COMMENT 'ID ngôn ngữ',
  `name` varchar(100) NOT NULL COMMENT 'Ngôn ngữ phim (Phụ đề, Lồng tiếng)'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `languages`
--

INSERT INTO `languages` (`id`, `name`) VALUES
(1, 'Phụ đề Việt'),
(2, 'Lồng tiếng Việt');

-- --------------------------------------------------------

--
-- Table structure for table `movies`
--

CREATE TABLE `movies` (
  `id` int(11) NOT NULL COMMENT 'ID phim',
  `title` varchar(255) NOT NULL COMMENT 'Tên phim',
  `original_title` varchar(255) DEFAULT NULL COMMENT 'Tên gốc',
  `slug` varchar(255) DEFAULT NULL COMMENT 'Đường dẫn SEO',
  `description` text DEFAULT NULL COMMENT 'Mô tả phim',
  `duration` int(11) DEFAULT NULL COMMENT 'Thời lượng phim (phút)',
  `release_date` date DEFAULT NULL COMMENT 'Ngày khởi chiếu',
  `genres` varchar(255) DEFAULT NULL COMMENT 'Thể loại',
  `country` varchar(100) DEFAULT NULL COMMENT 'Quốc gia sản xuất',
  `director` varchar(255) DEFAULT NULL COMMENT 'Đạo diễn',
  `actors` text DEFAULT NULL COMMENT 'Diễn viên',
  `age_limit` varchar(10) DEFAULT NULL COMMENT 'Độ tuổi xem',
  `status` enum('NOW_SHOWING','COMING_SOON','STOPPED') DEFAULT NULL COMMENT 'Trạng thái phim',
  `poster` varchar(255) DEFAULT NULL COMMENT 'Ảnh poster',
  `banner` varchar(255) DEFAULT NULL COMMENT 'Ảnh banner',
  `trailer_url` varchar(255) DEFAULT NULL COMMENT 'Link trailer',
  `rating` float DEFAULT 0 COMMENT 'Điểm đánh giá',
  `rating_count` int(11) DEFAULT 0 COMMENT 'Số lượt đánh giá',
  `view_count` int(11) DEFAULT 0 COMMENT 'Số lượt xem',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() COMMENT 'Ngày tạo',
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT 'Ngày cập nhật',
  `is_hot` tinyint(1) DEFAULT 0,
  `is_recommended` tinyint(1) DEFAULT 0,
  `seat_styles` text DEFAULT NULL COMMENT 'Cấu hình ghế theo phim',
  `end_date` date DEFAULT NULL COMMENT 'Ngày rời rạp',
  `revenue` decimal(15,2) DEFAULT 0 COMMENT 'Doanh thu'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `movies`
--

INSERT INTO `movies` (`id`, `title`, `original_title`, `slug`, `description`, `duration`, `release_date`, `genres`, `country`, `director`, `actors`, `age_limit`, `status`, `poster`, `banner`, `trailer_url`, `rating`, `rating_count`, `view_count`, `created_at`, `updated_at`, `is_hot`, `is_recommended`) VALUES
(2, 'Nhà Trấn Quỷ', 'Our House', 'nha-tran-quy', 'Nhà Trấn Quỷ xoay quanh câu chuyện của một đôi vợ chồng trẻ chuyển đến sống trong căn nhà biệt lập rộng lớn với mức giá rẻ như mơ...', 120, '2026-01-23', 'Gay cấn, Kinh dị', 'Việt Nam', 'Khom-Kongkiat Khomsiri', 'Teeradetch Metawarayut, Sarunrat Puagpipat', '18+', 'NOW_SHOWING', 'uploads/posters/nhatranquy.jpg', 'uploads/banners/nhatranquy-banner.jpg', 'https://www.youtube.com/embed/33lKp6JtCvY', 7.9, 1390, 0, '2026-03-16 13:41:30', '2026-03-22 12:07:06', 1, 1),
(3, 'Lễ Đoạt Hồn', 'Don\'t Follow Me', 'le-doat-hon', 'Carla chuyển vào sống trong một tòa nhà bị ma ám...', 83, '2026-01-30', 'Bí ẩn, Kinh dị', 'Mexico', NULL, NULL, '16+', 'NOW_SHOWING', 'uploads/posters/ledoathon.jpg', 'uploads/banners/ledoathon-banner.jpg', 'https://youtu.be/NWU5dDC4lE4?si=vKq7vi6cFjNQkts9', 1.8, 30, 0, '2026-03-16 13:41:30', '2026-03-22 12:07:23', 0, 0),
(4, 'Tiểu Yêu Quái Núi Lãng Lãng', 'Nobody', 'tieu-yeu-quai-nui-lang-lang', 'Nhóm tiểu yêu quái vô danh phải chống lại số phận...', 118, '2026-01-23', 'Phiêu lưu, Giả tưởng, Hài, Hoạt hình', 'Trung Quốc', NULL, NULL, 'P', 'NOW_SHOWING', 'uploads/posters/tieuyeunuilanglang.jpg', 'uploads/posters/tieuyeunuilanglang.jpg', 'https://youtu.be/D6vLPsyMSUY?si=ZaeCY3DO4k6O9Ypi', 9.2, 2120, 0, '2026-03-16 13:41:30', '2026-03-22 12:07:38', 1, 1),
(5, 'Cứu', 'Send Help', 'cuu-send-help', 'Hai đồng nghiệp sống sót sau vụ rơi máy bay...', 113, '2026-01-30', 'Gay cấn, Kinh dị, Hài', 'Mỹ', NULL, NULL, '18+', 'NOW_SHOWING', 'uploads/posters/cuu.jpg', 'uploads/posters/cuu.jpg', 'https://youtu.be/q1y0R8yMaho?si=IQcz5cegXa-vynYv', 8.2, 55, 0, '2026-03-16 13:41:30', '2026-03-22 12:07:52', 0, 1),
(6, 'Running Man Việt Nam Mùa 3 - Con Rối Tự Do', 'Running Man Vietnam Season 3 - Free Puppet', 'running-man-viet-nam-mua-3-con-roi-tu-do', 'Chương trình giải trí Running Man...', 161, '2026-01-24', 'Giải trí, Hài, Truyền hình thực tế', 'Việt Nam', NULL, NULL, 'P', 'COMING_SOON', 'uploads/posters/runningman.jpg', 'uploads/posters/runningman.jpg', 'https://www.youtube.com/watch?v=XXXX', 9.2, 1469, 0, '2026-03-16 13:41:30', '2026-03-16 13:41:30', 1, 1),
(7, 'Thỏ ơi', 'Đoán xemmm ai là Thỏ nào!', 'thooi', 'Phim “Thỏ ơi!!” dự kiến công chiếu trong dịp Tết 2026, thuộc thể loại hài, tâm lý sở trường của Trấn Thành, mang màu sắc trẻ trung với dàn diễn viên mới, tiếp nối tinh thần đem đến cho khán giả những điều vui vẻ, hài hước vào dịp Tết Nguyên đán.', 110, '2026-02-01', 'Tình Cảm, Tâm lý, Hành động', 'Việt Nam', 'Trấn Thành', 'Pháo; Lyly; Trấn Thành; Pháp Kiều; Gil Lê; Cris Phan; Ali Hoàng Dương; BB Trần; Đinh Ngọc Diệp', '16+', 'NOW_SHOWING', 'uploads/posters/thooi.jpg', 'uploads/posters/thooi.jpg', 'https://youtu.be/XMv1Zhj5TQg?si=IPR0CHhWZLfkU5Xt', 9.5, 14039, 0, '2026-03-16 17:06:39', '2026-03-22 13:20:27', 0, 0),
(8, 'Tài', 'Tai', 'tai', 'Tài bất ngờ rơi vào vòng xoáy nguy hiểm vì một khoản nợ tiền khổng lồ. Bị dồn vào đường cùng, Tài buộc phải dấn thân vào những lựa chọn sai lầm khiến gia đình trở thành mục tiêu bị đe dọa. Đằng sau những hành động liều lĩnh ấy là nỗi ám ảnh về người mẹ mà Tài luôn muốn bảo vệ và bù đắp bằng mọi giá. Khi ranh giới giữa đúng và sai ngày càng mong manh, Tài phải đối mặt với câu hỏi lớn nhất của đời mình: liệu lòng hiếu thảo có đủ để biện minh cho con đường anh đang đi.', 115, '2026-02-02', 'Hanh dong', 'Viet Nam', 'Mai Tài Phến', 'Mai Tài Phến, Mỹ Tâm, NSƯT Hạnh Thuý, Hồng Ánh, Long Đẹp Trai, Vinh Râu, Trần Kim Hải, Sỹ Toàn, Quang Trung, Huỳnh Thi, Ray Nguyễn,...', '16+', 'NOW_SHOWING', 'uploads/posters/tai.jpg', 'uploads/posters/tai.jpg', 'https://youtu.be/HyaRaYwgQ-A?si=UMQA8JkPiqYh2hnk', 8.5, 1245, 0, '2026-03-16 17:06:39', '2026-03-22 13:21:48', 125, 1),
(9, 'Nhà Ba Tôi Một Phòng', 'Nha Ba Toi Mot Phong', 'nhabatoimotphong', 'Lấy bối cảnh một khu chung cư cũ với căn nhà chỉ vỏn vẹn một phòng, Nhà Ba Tôi Một Phòng khắc họa mối quan hệ “lệch pha” giữa người cha bảo thủ và cô con gái Gen Z đầy mơ ước. Khi những khác biệt thế hệ va chạm trong không gian chật chội, tình thân dần được thử thách và hàn gắn. Bộ phim mang đến một lát cắt gần gũi về gia đình Việt hiện đại, nơi yêu thương đôi khi bắt đầu từ sự thấu hiểu.', 120, '2026-02-03', 'Gia đình, Hài, Tâm Lý', 'Việt Nam', 'Trường Giang', 'Trường Giang, Đoàn Minh Anh, Anh Tú Atus, Lê Khánh,…', 'P', 'NOW_SHOWING', 'uploads/posters/nhabatoimotphong.jpg', 'uploads/posters/nhabatoimotphong.jpg', 'https://youtu.be/gCmV2d_82CU?si=jDTAQFkVl66G6iyZ', 9.4, 12039, 0, '2026-03-16 17:06:39', '2026-03-22 13:21:20', 0, 0),
(10, 'Quỷ Nhập Tràng 2', 'Quy Nhap Trang 2', 'quynhaptrang2', 'Quỷ Nhập Tràng 2 là tiền truyện của nhân vật Minh Như, trở về xưởng nhuộm gia đình sau nhiều năm bị xua đuổi. Tại đây, cô phải đối mặt với những hiện tượng ma quái cùng sự thật tàn khốc về cái chết của mẹ và giao ước đẫm máu năm xưa. Ác giả ác báo, liệu Minh Như có thoát khỏi vòng vây của quỷ dữ?', 118, '2026-02-04', 'Hồi hộp, Kinh Dị', 'Việt Nam', 'Pom Nguyễn', 'Khả Như, Doãn Quốc Đam, Ngọc Hương...', '18+', 'NOW_SHOWING', 'uploads/posters/quynhaptrang2.jpg', 'uploads/posters/quynhaptrang2.jpg', 'https://youtu.be/q0UWKBzFFxQ?si=mlAKz_0D96bj_cze', 0, 0, 0, '2026-03-16 17:06:39', '2026-03-22 12:09:20', 0, 0),
(11, 'Tội Phạm 101', 'Crime 101', 'toipham101', 'Lấy bối cảnh thành phố Los Angeles đầy nắng và bụi đường, Tội Phạm 101 kể về một tên trộm nữ trang bí ẩn (Chris Hemsworth) với hàng loạt phi vụ táo bạo khiến cảnh sát phải đau đầu. Trong lúc chuẩn bị cho phi vụ lớn nhất của mình, hắn gặp gỡ một nữ nhân viên bảo hiểm (Halle Berry), người cũng đang vật lộn với những lựa chọn trong đời mình. Trong khi đó, một thanh tra (Mark Ruffalo) đã tìm ra quy luật trong chuỗi các vụ án và đang ráo riết truy đuổi tên trộm, khiến cuộc chơi trở nên căng thẳng hơn bao giờ hết. Khi phi vụ định mệnh đến gần, ranh giới giữa kẻ săn đuổi và con mồi dần trở nên mờ nhạt và cả ba buộc phải đối mặt với những lựa chọn khó khăn và không còn cơ hội để quay đầu lại. Bộ phim được chuyển thể từ tiểu thuyết ngắn nổi tiếng cùng tên của Don Winslow, do Bart Layton (tác giả của American Animals, The Imposter) viết kịch bản và đạo diễn. Dàn diễn viên có sự tham gia của Barry Keoghan, Monica Barbaro, Corey Hawkins, Jennifer Jason Leigh và Nick Nolte.', 120, '2026-02-10', 'Hành động, Tội phạm', 'Mỹ', 'Bart Layton', 'Chris Hemsworth, Mark Ruffalo, Halle Berry, Barry Keoghan, Monica Barbaro, Corey Hawkins, Jennifer Jason Leigh, Nick Nolte', '16+', 'NOW_SHOWING', 'uploads/posters/toipham101.jpg', 'uploads/posters/toipham101.jpg', 'https://youtu.be/TxY9GfEEMOI?si=zdEtKFtTdsa9npRT', 0, 0, 0, '2026-03-16 17:19:07', '2026-03-22 12:09:50', 0, 0);

-- --------------------------------------------------------

--
-- Table structure for table `movie_reviews`
--

CREATE TABLE `movie_reviews` (
  `id` int(11) NOT NULL,
  `movie_slug` varchar(255) NOT NULL,
  `user_name` varchar(255) NOT NULL,
  `user_avatar` varchar(255) DEFAULT NULL,
  `rating` int(11) NOT NULL COMMENT '1-10',
  `content` text DEFAULT NULL,
  `tags` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`tags`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `movie_reviews`
--

INSERT INTO `movie_reviews` (`id`, `movie_slug`, `user_name`, `user_avatar`, `rating`, `content`, `tags`, `created_at`) VALUES
(1, 'nha-tran-quy', 'Duy Nguyễn Văn', 'https://ui-avatars.com/api/?name=Guest&background=random', 10, '', '[\"Hài lòng\",\"Tuyệt vời\",\"Đáng xem\"]', '2026-04-03 05:42:54');

-- --------------------------------------------------------

--
-- Table structure for table `rooms`
--

CREATE TABLE `rooms` (
  `id` int(11) NOT NULL COMMENT 'ID phòng chiếu',
  `cinema_id` int(11) NOT NULL COMMENT 'Thuộc rạp nào',
  `room_number` int(11) NOT NULL COMMENT 'Số phòng',
  `room_name` varchar(50) DEFAULT NULL COMMENT 'Tên phòng',
  `seat_styles` text DEFAULT NULL COMMENT 'Cấu hình ghế mặc định'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `rooms`
--

INSERT INTO `rooms` (`id`, `cinema_id`, `room_number`, `room_name`) VALUES
(1, 1, 1, 'Phòng 1'),
(2, 1, 2, 'Phòng 2'),
(3, 2, 1, 'Phòng 1'),
(4, 2, 2, 'Phòng 2'),
(5, 3, 1, 'Phòng 1'),
(6, 3, 2, 'Phòng 2'),
(7, 4, 1, 'Phòng 1'),
(8, 4, 2, 'Phòng 2'),
(9, 5, 1, 'Phòng 1'),
(10, 5, 2, 'Phòng 2'),
(11, 6, 1, 'Phòng 1'),
(12, 6, 2, 'Phòng 2');

-- --------------------------------------------------------

--
-- Table structure for table `showtimes`
--

CREATE TABLE `showtimes` (
  `id` int(11) NOT NULL COMMENT 'ID suất chiếu',
  `movie_id` int(11) NOT NULL COMMENT 'Phim nào',
  `cinema_id` int(11) NOT NULL COMMENT 'Rạp nào',
  `room_id` int(11) NOT NULL COMMENT 'Phòng chiếu',
  `format_id` int(11) NOT NULL COMMENT 'Định dạng 2D 3D',
  `language_id` int(11) NOT NULL COMMENT 'Ngôn ngữ',
  `show_date_id` int(11) NOT NULL COMMENT 'Ngày chiếu',
  `show_time` time NOT NULL COMMENT 'Giờ chiếu',
  `seat_styles` text DEFAULT NULL COMMENT 'Cấu hình ghế riêng cho suất chiếu'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `showtimes`
--

INSERT INTO `showtimes` (`id`, `movie_id`, `cinema_id`, `room_id`, `format_id`, `language_id`, `show_date_id`, `show_time`) VALUES
(2, 2, 1, 1, 1, 1, 16, '22:00:00'),
(3, 2, 1, 1, 1, 1, 16, '23:00:00'),
(4, 2, 1, 1, 1, 1, 17, '09:00:00'),
(5, 2, 1, 1, 1, 1, 17, '15:00:00'),
(8, 2, 4, 1, 1, 1, 17, '09:00:00'),
(10, 2, 1, 1, 1, 1, 17, '21:00:00'),
(11, 2, 1, 1, 1, 1, 18, '20:00:00'),
(12, 2, 1, 1, 1, 1, 19, '20:00:00'),
(13, 2, 1, 1, 1, 1, 20, '18:00:00'),
(14, 2, 1, 1, 1, 1, 21, '18:00:00'),
(15, 2, 1, 1, 1, 1, 22, '09:00:00'),
(16, 2, 2, 2, 1, 2, 22, '13:00:00'),
(18, 2, 1, 1, 1, 2, 22, '21:00:00'),
(19, 2, 4, 2, 2, 2, 23, '09:00:00'),
(20, 2, 1, 1, 1, 1, 23, '13:00:00'),
(22, 2, 1, 1, 1, 1, 23, '21:00:00'),
(23, 7, 1, 1, 1, 1, 23, '09:00:00'),
(24, 7, 2, 2, 2, 2, 23, '13:00:00'),
(25, 7, 3, 2, 2, 1, 23, '18:00:00'),
(26, 7, 4, 1, 1, 2, 23, '21:00:00'),
(40, 2, 5, 0, 2, 2, 23, '20:30:00'),
(53, 2, 2, 3, 1, 1, 23, '09:00:00'),
(54, 2, 2, 3, 1, 1, 25, '09:00:00');

--
-- Triggers `showtimes`
--
DELIMITER $$
CREATE TRIGGER `auto_create_showtime_seats` AFTER INSERT ON `showtimes` FOR EACH ROW BEGIN

INSERT INTO booking_db.showtime_seats
(showtime_id, seat_id, status)

SELECT
NEW.id,
id,
'available'

FROM booking_db.seat_layout
WHERE room_id = NEW.room_id;

END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `show_dates`
--

CREATE TABLE `show_dates` (
  `id` int(11) NOT NULL COMMENT 'ID ngày chiếu',
  `show_date` date NOT NULL COMMENT 'Ngày chiếu phim'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `show_dates`
--

INSERT INTO `show_dates` (`id`, `show_date`) VALUES
(16, '2026-03-16'),
(17, '2026-03-17'),
(18, '2026-03-18'),
(19, '2026-03-22'),
(20, '2026-03-21'),
(21, '2026-03-24'),
(22, '2026-03-23'),
(23, '2026-04-17'),
(24, '2026-04-17'),
(25, '2026-04-19');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `blog_posts`
--
ALTER TABLE `blog_posts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`);

--
-- Indexes for table `cinemas`
--
ALTER TABLE `cinemas`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `cities`
--
ALTER TABLE `cities`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `formats`
--
ALTER TABLE `formats`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `forum_comments`
--
ALTER TABLE `forum_comments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `post_id` (`post_id`);

--
-- Indexes for table `forum_likes`
--
ALTER TABLE `forum_likes`
  ADD PRIMARY KEY (`user_id`,`post_id`),
  ADD KEY `post_id` (`post_id`);

--
-- Indexes for table `forum_posts`
--
ALTER TABLE `forum_posts`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `languages`
--
ALTER TABLE `languages`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `movies`
--
ALTER TABLE `movies`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`);

--
-- Indexes for table `movie_reviews`
--
ALTER TABLE `movie_reviews`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_movie_slug` (`movie_slug`);

--
-- Indexes for table `rooms`
--
ALTER TABLE `rooms`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `showtimes`
--
ALTER TABLE `showtimes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `cinema_id` (`cinema_id`,`room_id`,`show_date_id`,`show_time`);

--
-- Indexes for table `show_dates`
--
ALTER TABLE `show_dates`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `blog_posts`
--
ALTER TABLE `blog_posts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `cinemas`
--
ALTER TABLE `cinemas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'ID rạp', AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `cities`
--
ALTER TABLE `cities`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'ID thành phố', AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `formats`
--
ALTER TABLE `formats`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'ID định dạng', AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `forum_comments`
--
ALTER TABLE `forum_comments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `forum_posts`
--
ALTER TABLE `forum_posts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `languages`
--
ALTER TABLE `languages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'ID ngôn ngữ', AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `movies`
--
ALTER TABLE `movies`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'ID phim', AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `movie_reviews`
--
ALTER TABLE `movie_reviews`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `rooms`
--
ALTER TABLE `rooms`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'ID phòng chiếu', AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `showtimes`
--
ALTER TABLE `showtimes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'ID suất chiếu', AUTO_INCREMENT=55;

--
-- AUTO_INCREMENT for table `show_dates`
--
ALTER TABLE `show_dates`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'ID ngày chiếu', AUTO_INCREMENT=26;

DELIMITER $$
--
-- Events
--
CREATE DEFINER=`root`@`localhost` EVENT `auto_insert_show_dates` ON SCHEDULE EVERY 1 DAY STARTS '2026-03-16 23:04:03' ON COMPLETION NOT PRESERVE ENABLE DO INSERT INTO movie_db.show_dates (show_date)
SELECT DATE_ADD(CURDATE(), INTERVAL 30 DAY)
WHERE NOT EXISTS (
    SELECT 1 FROM movie_db.show_dates
    WHERE show_date = DATE_ADD(CURDATE(), INTERVAL 30 DAY)
)$$

CREATE DEFINER=`root`@`localhost` EVENT `auto_delete_old_dates` ON SCHEDULE EVERY 1 DAY STARTS '2026-03-16 23:04:11' ON COMPLETION NOT PRESERVE ENABLE DO DELETE FROM movie_db.show_dates
WHERE show_date < CURDATE()$$

DELIMITER ;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
