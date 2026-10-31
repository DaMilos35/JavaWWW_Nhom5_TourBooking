package vn.dulichviet.tourbooking.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Service quản lý giới hạn tần suất (Rate Limiter) & Thu hồi phiên đăng nhập (Revocation)
 * Sử dụng Redis làm bộ đệm tập trung khi chạy phân tán / microservice.
 * Tự động dự phòng (Failover) sang bộ nhớ cục bộ In-Memory (ConcurrentHashMap) 
 * nếu kết nối Redis tạm thời không khả dụng.
 */
@Service
public class RateLimiterService {

    private static final Logger log = LoggerFactory.getLogger(RateLimiterService.class);

    @Autowired(required = false)
    private StringRedisTemplate redisTemplate;

    // Bộ nhớ đệm dự phòng In-Memory khi Redis offline
    private static class CounterWindow {
        long windowStartMs;
        int count;

        CounterWindow(long windowStartMs) {
            this.windowStartMs = windowStartMs;
            this.count = 1;
        }
    }

    private final Map<String, CounterWindow> localRateLimits = new ConcurrentHashMap<>();
    private final Map<Integer, Long> localRevocations = new ConcurrentHashMap<>();

    /**
     * Kiểm tra và tăng bộ đếm tần suất gọi API
     * @param key Khóa định danh (ví dụ: rl:forgot:ip:127.0.0.1 hoặc rl:forgot:phone:0901234567)
     * @param maxRequests Số lượt yêu cầu tối đa cho phép trong cửa sổ thời gian
     * @param windowSeconds Thời gian của cửa sổ tính bằng giây
     * @return true nếu trong ngưỡng cho phép; false nếu vượt quá hạn mức (Rate Limited)
     */
    public boolean tryAcquire(String key, int maxRequests, long windowSeconds) {
        if (redisTemplate != null) {
            try {
                Long current = redisTemplate.opsForValue().increment(key);
                if (current != null && current == 1) {
                    redisTemplate.expire(key, Duration.ofSeconds(windowSeconds));
                }
                if (current != null && current > maxRequests) {
                    log.warn("[REDIS RATE LIMIT] Khóa [{}] vượt quá hạn mức {} requests/{}s (Hiện tại: {})",
                            key, maxRequests, windowSeconds, current);
                    return false;
                }
                return true;
            } catch (Exception ex) {
                log.debug("[REDIS FALLBACK] Lỗi kết nối Redis: {}. Chuyển sang In-Memory Rate Limiter.", ex.getMessage());
            }
        }

        // Fallback sang bộ nhớ RAM cục bộ
        long now = System.currentTimeMillis();
        long windowMs = windowSeconds * 1000L;
        CounterWindow window = localRateLimits.compute(key, (k, current) -> {
            if (current == null || (now - current.windowStartMs) > windowMs) {
                return new CounterWindow(now);
            }
            current.count++;
            return current;
        });

        if (window.count > maxRequests) {
            log.warn("[LOCAL RATE LIMIT] Khóa [{}] vượt quá hạn mức {} requests/{}s (Hiện tại: {})",
                    key, maxRequests, windowSeconds, window.count);
            return false;
        }
        return true;
    }

    /**
     * Đánh dấu mốc thời gian thu hồi toàn bộ phiên đăng nhập/JWT cũ của người dùng
     * @param userId ID người dùng
     */
    public void recordUserTokenRevocation(Integer userId) {
        if (userId == null) return;
        long now = System.currentTimeMillis();
        String redisKey = "auth:revoked_before:" + userId;

        if (redisTemplate != null) {
            try {
                // Lưu mốc thu hồi trong 7 ngày (bằng thời gian sống của Refresh token)
                redisTemplate.opsForValue().set(redisKey, String.valueOf(now), Duration.ofDays(7));
                log.info("[REDIS REVOKE] Đã ghi nhận thu hồi toàn bộ token cũ cho userId=[{}]", userId);
            } catch (Exception ex) {
                log.debug("[REDIS FALLBACK] Ghi nhận mốc thu hồi vào In-Memory: {}", ex.getMessage());
            }
        }
        localRevocations.put(userId, now);
    }

    /**
     * Kiểm tra xem token cấp tại thời điểm issueTimeMs có bị vô hiệu hóa hay không
     */
    public boolean isTokenRevoked(Integer userId, long issueTimeMs) {
        if (userId == null) return false;
        String redisKey = "auth:revoked_before:" + userId;

        if (redisTemplate != null) {
            try {
                String revokedTimeStr = redisTemplate.opsForValue().get(redisKey);
                if (revokedTimeStr != null) {
                    long revokedAt = Long.parseLong(revokedTimeStr);
                    return issueTimeMs < revokedAt;
                }
            } catch (Exception ex) {
                log.debug("[REDIS FALLBACK] Lỗi đọc mốc thu hồi từ Redis: {}", ex.getMessage());
            }
        }

        Long localRevokedAt = localRevocations.get(userId);
        return localRevokedAt != null && issueTimeMs < localRevokedAt;
    }
}

