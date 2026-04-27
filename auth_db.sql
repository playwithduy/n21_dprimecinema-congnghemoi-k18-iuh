-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 18, 2026 at 02:43 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";

CREATE DATABASE IF NOT EXISTS auth_db;
USE auth_db;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

CREATE DATABASE IF NOT EXISTS `auth_db`;
USE `auth_db`;

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `body` text NOT NULL,
  `target_type` enum('all','admin','user') DEFAULT 'all',
  `sent_by` int(11) DEFAULT NULL,
  `reach_count` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `fullname` varchar(255) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `birthday` date NOT NULL,
  `gender` enum('Nam','Nữ') NOT NULL,
  `region` varchar(50) NOT NULL,
  `favorite_cinema` varchar(255) NOT NULL,
  `role` enum('user','admin') DEFAULT 'user',
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `avatar` varchar(255) DEFAULT NULL,
  `reset_token` varchar(255) DEFAULT NULL,
  `reset_token_expiry` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `fullname`, `phone`, `email`, `password`, `birthday`, `gender`, `region`, `favorite_cinema`, `role`, `is_active`, `created_at`, `updated_at`, `avatar`, `reset_token`, `reset_token_expiry`) VALUES
(1, 'Test', '0123456789', 'test@gmail.com', '$2b$10$weueuNhmw12Li0OHQu512uXNWjSD32Oh6FNVX2VIronltFFpQiEo2', '2000-01-01', 'Nam', 'HCM', 'D Prime Quận 1', 'user', 1, '2026-02-08 05:23:51', '2026-04-02 15:04:05', NULL, '2ca5d11855ac4deec67aad8499f9cf74a6d8cd2d863ca6e4b9618d3e7b52e107', '2026-04-02 15:19:05'),
(2, 'Nguyễn Văn Duy', '0398278164', 'nguyenvanduy@gmail.com', '$2b$10$f87iCo5.epQmy/HIH/OcrOt8hGLgsEgiTjIv0imllOjtIK//6iSmO', '2004-10-13', 'Nam', 'HCM', 'D Prime Quận 1', 'user', 1, '2026-02-08 05:24:05', '2026-03-08 19:51:37', '/uploads/avatars/1772999497797.jpg', NULL, NULL),
(3, 'Nguyễn Thu Hằng ', '0987955339', 'thuhang@gmail.com', '$2b$10$yDywGKozF.3BpTr/1AU6F.h.SlKvTZ6UMe5YNurn3cFlx09sgvTGa', '2004-10-13', 'Nữ', 'HN', 'D Prime Hai Bà Trưng', 'user', 1, '2026-02-08 16:40:32', '2026-02-08 16:40:32', NULL, NULL, NULL),
(4, 'Nguyễn Bảo Duy', '0987955339', 'thenewking.duy@gmail.com', '$2b$10$4fdjEV2D010Nr4tiCKWXLeUEdl9ECoJU86nU3RuWYtIUzx7IxMWEC', '2010-06-23', 'Nam', 'HCM', 'D Prime Cinema Số 12 Nguyễn Văn Bảo, P. Hạnh Thông, Thành phố Hồ Chí Minh', 'user', 1, '2026-02-12 16:59:13', '2026-04-02 15:05:29', '/uploads/avatars/1773802020844.jpg', 'be09b0ce88466031c445e3c88f49b4a36e93e3fddce4413d1f34c90abd3155e2', '2026-04-02 15:20:29'),
(5, 'Admin 1', '3979', 'admin@dprime.com', '$2b$10$UJZYYj55qwAaKH1U24SkP.iOtxNHGv/euVDEgBqq7sHh1/.wlV5vG', '2000-01-01', 'Nam', 'HCM', 'D Prime Quận 1', 'admin', 1, '2026-02-15 15:16:05', '2026-04-17 05:09:15', '/uploads/avatars/1775227734844.jpg', NULL, NULL),
(6, 'Duy Nguyễn Văn', '0398278164', 'nguyenvanduy1310@gmail.com', '$2b$10$P9TCuLmLWUuaDMqNZlXF5euRMQsYl4qasVsxnL53a0DKj5TVuyyCS', '2004-10-13', 'Nam', 'HCM', 'D Prime Cinema Số 10 Nguyễn Văn Dung, Phường An Nhơn, TP.HCM', 'admin', 1, '2026-03-21 09:29:17', '2026-04-03 09:47:20', '/uploads/avatars/1774085376949.jpg', '6f62551d6bda9b0244de7891ebc86cae1c244ec6d9a011f959b2da628cb9a1ab', '2026-04-02 15:27:15'),
(7, 'Đỗ Hoàng Qúy Linh', '0837404648', 'dohoangquylinh@gmail.com', '$2b$10$IkNQyrgBk8oyiACE7AEfI.dU2i0YBeX2P7u8eQ0xqmzKWft/eLkgy', '2004-08-03', 'Nữ', 'HCM', 'D Prime Cinema Số 10 Nguyễn Văn Dung, Phường An Nhơn, TP.HCM', 'user', 1, '2026-03-21 10:02:15', '2026-03-21 10:02:33', '/uploads/avatars/1774087353959.jpg', NULL, NULL),
(8, 'Đỗ Hoàng Qúy Linh', '0987955339', 'aigod1310@gmail.com', '$2b$10$qDaw.9DTFAYor5XPkOQkpOk/LcYebAZ12WwaUs1VvTUAbm2KfHmvO', '2004-08-03', 'Nữ', 'HCM', 'D Prime Cinema Địa chỉ: Số 20 Đường số 53, Phường An Hội Tây, TP.HCM', 'user', 1, '2026-03-21 11:23:51', '2026-03-21 12:23:11', '/uploads/avatars/1774095791617.jpg', NULL, NULL),
(9, 'Nguyễn Văn Duy', '0349366952', 'vanduyasian@gmail.com', '$2b$10$Q1.NV7h5aWBrO8qlO.MVYOufWcReQpVfGTe5Tt35vZFYL8DPoPbg6', '2004-10-13', 'Nam', 'HCM', 'D Prime Cinema Số 12 Nguyễn Văn Bảo, P. Hạnh Thông, Thành phố Hồ Chí Minh', 'user', 1, '2026-03-22 23:39:42', '2026-03-22 23:41:34', '/uploads/avatars/1774222894435.jpg', NULL, NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
