# ==============================================================================
# STAGE 1: Build Spring Boot JAR với Gradle
# ==============================================================================
FROM gradle:8.10-jdk17-alpine AS builder

WORKDIR /app

# Copy tệp cấu hình Gradle để cache dependencies
COPY build.gradle settings.gradle ./
COPY gradle ./gradle
COPY gradlew ./
RUN chmod +x gradlew

# Tải dependencies trước để tận dụng Docker Layer Cache
RUN ./gradlew dependencies --no-daemon || true

# Copy toàn bộ mã nguồn
COPY src ./src

# Biên dịch và đóng gói JAR
RUN ./gradlew bootJar --no-daemon -x test

# ==============================================================================
# STAGE 2: Lightweight Production Runtime (Alpine JRE)
# ==============================================================================
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Tạo non-root user vì lý do bảo mật
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Cài curl để hỗ trợ container healthcheck
RUN apk add --no-cache curl

# Copy JAR từ builder stage
COPY --from=builder /app/build/libs/*.jar app.jar

# Phân quyền cho appuser
RUN chown -R appuser:appgroup /app
USER appuser

# Biến môi trường JVM tối ưu hóa bộ nhớ cho môi trường chịu tải cao
ENV JAVA_OPTS="-XX:+UseG1GC \
               -XX:MaxGCPauseMillis=100 \
               -XX:+ParallelRefProcEnabled \
               -XX:+UseStringDeduplication \
               -Xms512m \
               -Xmx2048m \
               -Djava.security.egd=file:/dev/./urandom"

EXPOSE 8080

HEALTHCHECK --interval=15s --timeout=5s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:8080/api/tours?page=0&size=1 || exit 1

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
