# ==============================================================================
# STAGE 1: Build React Vite Frontend
# ==============================================================================
FROM node:20-alpine AS frontend-builder

WORKDIR /app

# Copy package descriptors
COPY package*.json ./

# Cài đặt dependencies
RUN npm ci

# Copy toàn bộ mã nguồn frontend
COPY . .

# Biên dịch gói sản phẩm (Vite Production Build)
RUN npm run build

# ==============================================================================
# STAGE 2: Nginx High-Concurrency Web Server
# ==============================================================================
FROM nginx:1.27-alpine

# Copy cấu hình Nginx tối ưu cho 1M CCU
COPY docker/nginx/nginx.conf /etc/nginx/nginx.conf

# Tạo thư mục cache cho Nginx
RUN mkdir -p /var/cache/nginx/api_cache && chown -R nginx:nginx /var/cache/nginx

# Copy build artifacts từ builder stage
COPY --from=frontend-builder /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
