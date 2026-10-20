package vn.dulichviet.tourbooking.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.dulichviet.tourbooking.config.CustomUserDetails;
import vn.dulichviet.tourbooking.service.RecommendationService;

import java.util.Map;

/**
 * Controller ghi nhận lịch sử tương tác người dùng.
 * Phục vụ trực tiếp cho Ca sử dụng UC04 (Gợi ý tour cá nhân hóa) theo đặc tả báo cáo.
 * Endpoint: POST /api/activity/log
 */
@RestController
@RequestMapping("/api/activity")
public class ActivityController {

    private final RecommendationService recommendationService;

    public ActivityController(RecommendationService recommendationService) {
        this.recommendationService = recommendationService;
    }

    @PostMapping("/log")
    public ResponseEntity<Void> logActivity(
            @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        Integer tourId = null;
        if (body.get("tourId") instanceof Number n) {
            tourId = n.intValue();
        } else if (body.get("tourId") != null) {
            try {
                tourId = Integer.parseInt(body.get("tourId").toString());
            } catch (NumberFormatException ignored) {}
        }

        String action = body.getOrDefault("action", body.getOrDefault("type", "VIEW")).toString();
        String sessionId = body.get("sessionId") != null ? body.get("sessionId").toString() : null;
        Integer userId = userDetails != null ? userDetails.getUser().getId() : null;

        if (tourId != null) {
            recommendationService.recordActivity(userId, sessionId, tourId, action);
        }
        return ResponseEntity.ok().build();
    }
}
