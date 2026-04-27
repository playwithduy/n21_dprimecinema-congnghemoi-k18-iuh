# N25 D-PRIME CINEMA
Xây dựng và phát triển Hệ thống quản lý và đặt vé rạp chiếu phim trực tuyến

Kiến trúc hạ tầng
- Microservices Architecture
- API Gateway (Express.js)
- Docker & Docker Compose

Backend
- Node.js
- Express.js
- RESTful API

Frontend
- PHP
- Vanilla JavaScript
- HTML5 / CSS3

Database
- MySQL 8.0
- Database per Service Pattern

Real-time
- WebSocket (ws)
- Room-based Broadcasting
- Seat Holding Mechanism
- Atomic Transactions (MySQL)

Ứng dụng Người dùng (Customer App)
- Khám phá phim
- Xem trailer
- Tìm kiếm thông minh
- Thông tin phim & lịch chiếu
- Đặt vé thời gian thực (WebSocket)
- Đặt combo (bắp nước)
- Thanh toán trực tuyến
- Quản lý vé (QR Check-in)
- Quản lý tài khoản
- Diễn đàn & cộng đồng
- Blog & tin tức
- Chatbot AI
- Vé điện tử
- Bình luận phim

Bảng điều khiển Quản trị (Admin Dashboard)
- Bảng điều khiển thống kê
- Báo cáo doanh thu & tỷ lệ lấp đầy
- Quản lý lịch chiếu
- Quản lý phòng & sơ đồ ghế
- Quản lý phim (CRUD)
- Quản lý sản phẩm & tồn kho
- Quản lý đơn hàng & thanh toán
- Hệ thống quét QR (Check-in)
- Quản lý khuyến mãi
- Hệ thống thông báo
- Quản lý người dùng & phân quyền (RBAC)
  

## CI/CD Workflow
Dự án được tích hợp GitHub Actions để tự động build Docker Images và push lên Docker Hub.

*Phát triển bởi Nhóm 25 K18 Ngành Hệ thống thông tin, Khoa Công Nghệ Thông Tin, IUH
