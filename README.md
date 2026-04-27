# N25 D-PRIME CINEMA

Hệ thống quản lý rạp chiếu phim Microservices.

## Tính năng nổi bật
- Quản lý rạp, phòng chiếu và sơ đồ ghế linh hoạt.
- Thiết lập **Vùng Trung Tâm (Premium Zone)**: Tự động tăng giá 20% cho các vị trí VIP.
- Real-time booking với Socket.io.
- Kiến trúc Microservices: Gateway, Auth, Movie, Booking, Socket, Forum, Blog.

## CI/CD Workflow
Dự án được tích hợp GitHub Actions để tự động build Docker Images và push lên Docker Hub.

### Các biến Secrets cần thiết trên GitHub:
- `DOCKERHUB_USERNAME`: Tên đăng nhập Docker Hub.
- `DOCKERHUB_TOKEN`: Access Token từ Docker Hub.

---
*Phát triển bởi Antigravity AI Assistant.*
