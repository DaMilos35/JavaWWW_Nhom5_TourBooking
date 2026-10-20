package vn.dulichviet.tourbooking.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Filter giới hạn tần suất yêu cầu (Rate Limiting) theo địa chỉ IP
 * Áp dụng cho các endpoint nhạy cảm (Đăng nhập, Trợ lý AI) nhằm ngăn chặn Brute-Force và lạm dụng API.
 * Tuân thủ tiêu chuẩn an toàn bảo mật Spring Security từ ECC.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 5)
public class RateLimitingFilter extends OncePerRequestFilter {

    private static final ObjectMapper JSON = new ObjectMapper();
    private static final int MAX_LOGIN_REQUESTS_PER_MINUTE = 15;
    private static final int MAX_AI_REQUESTS_PER_MINUTE = 30;

    private static class RequestCounter {
        long windowStartMs;
        int count;

        RequestCounter(long windowStartMs) {
            this.windowStartMs = windowStartMs;
            this.count = 1;
        }
    }

    private final Map<String, RequestCounter> loginCounters = new ConcurrentHashMap<>();
    private final Map<String, RequestCounter> aiCounters = new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String uri = request.getRequestURI();
        String clientIp = getClientIp(request);
        long now = System.currentTimeMillis();

        if (uri.startsWith("/api/auth/login") && "POST".equalsIgnoreCase(request.getMethod())) {
            if (isRateLimited(loginCounters, clientIp, MAX_LOGIN_REQUESTS_PER_MINUTE, now)) {
                writeTooManyRequests(response, "Bạn đã thử đăng nhập quá nhiều lần. Vui lòng thử lại sau 1 phút.");
                return;
            }
        } else if (uri.startsWith("/api/ai/chat") && "POST".equalsIgnoreCase(request.getMethod())) {
            if (isRateLimited(aiCounters, clientIp, MAX_AI_REQUESTS_PER_MINUTE, now)) {
                writeTooManyRequests(response, "Bạn đã gửi quá nhiều câu hỏi tới Trợ lý AI. Vui lòng đợi trong giây lát.");
                return;
            }
        }

        filterChain.doFilter(request, response);
    }

    private boolean isRateLimited(Map<String, RequestCounter> counters, String clientIp, int maxRequests, long now) {
        RequestCounter counter = counters.compute(clientIp, (ip, current) -> {
            if (current == null || (now - current.windowStartMs) > 60_000) {
                return new RequestCounter(now);
            }
            current.count++;
            return current;
        });
        return counter.count > maxRequests;
    }

    private String getClientIp(HttpServletRequest request) {
        String xf = request.getHeader("X-Forwarded-For");
        if (xf != null && !xf.isBlank()) {
            return xf.split(",")[0].trim();
        }
        return request.getRemoteAddr() != null ? request.getRemoteAddr() : "unknown";
    }

    private void writeTooManyRequests(HttpServletResponse response, String message) throws IOException {
        response.setStatus(429);
        response.setContentType("application/json;charset=UTF-8");
        JSON.writeValue(response.getWriter(), Map.of(
                "status", 429,
                "error", "Too Many Requests",
                "message", message
        ));
    }
}
