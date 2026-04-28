FROM node:18-alpine

WORKDIR /app

# Chỉ copy package.json trước để tận dụng cache
COPY package*.json ./

# Cài đặt toàn bộ dependencies (bỏ --production để tránh thiếu lib)
RUN npm install

# Copy toàn bộ code
COPY . .

# Expose port
EXPOSE 3007

# Lệnh khởi chạy
CMD ["node", "src/index.js"]
