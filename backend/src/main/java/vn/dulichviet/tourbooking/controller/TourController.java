package vn.dulichviet.tourbooking.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import vn.dulichviet.tourbooking.dto.TourDto;
import vn.dulichviet.tourbooking.dto.TourRequest;
import vn.dulichviet.tourbooking.service.TourService;

import java.util.List;

@RestController
@RequestMapping("/api/tours")
public class TourController {
    private final TourService tourService;
    private final vn.dulichviet.tourbooking.service.RecommendationService recommendationService;

    public TourController(TourService tourService,
                          vn.dulichviet.tourbooking.service.RecommendationService recommendationService) {
        this.tourService = tourService;
        this.recommendationService = recommendationService;
    }

    /** Công khai: lấy tất cả tour */
    @GetMapping
    public ResponseEntity<List<TourDto>> getAll() {
        return ResponseEntity.ok(tourService.findAll());
    }

    /** Công khai: lấy danh sách tour gợi ý cá nhân hóa dựa trên lịch sử hoạt động */
    @GetMapping("/recommendations")
    public ResponseEntity<List<TourDto>> getRecommendations(
            @RequestParam(required = false) String sessionId,
            @RequestParam(defaultValue = "4") int limit,
            @org.springframework.security.core.annotation.AuthenticationPrincipal vn.dulichviet.tourbooking.config.CustomUserDetails userDetails) {
        Integer userId = userDetails != null ? userDetails.getUser().getId() : null;
        return ResponseEntity.ok(recommendationService.getRecommendations(userId, sessionId, limit));
    }

    /** Công khai: lấy danh sách tour đã xem gần đây */
    @GetMapping("/recently-viewed")
    public ResponseEntity<List<TourDto>> getRecentlyViewed(
            @RequestParam(required = false) String sessionId,
            @RequestParam(defaultValue = "6") int limit,
            @org.springframework.security.core.annotation.AuthenticationPrincipal vn.dulichviet.tourbooking.config.CustomUserDetails userDetails) {
        Integer userId = userDetails != null ? userDetails.getUser().getId() : null;
        return ResponseEntity.ok(recommendationService.getRecentlyViewed(userId, sessionId, limit));
    }

    /** Ghi nhận hành vi người dùng (VIEW, ADD_TO_CART, BOOK) */
    @PostMapping("/{id}/activity")
    public ResponseEntity<Void> recordActivity(
            @PathVariable Integer id,
            @RequestParam(defaultValue = "VIEW") String type,
            @RequestParam(required = false) String sessionId,
            @org.springframework.security.core.annotation.AuthenticationPrincipal vn.dulichviet.tourbooking.config.CustomUserDetails userDetails) {
        Integer userId = userDetails != null ? userDetails.getUser().getId() : null;
        recommendationService.recordActivity(userId, sessionId, id, type);
        return ResponseEntity.ok().build();
    }

/** Công khai: Lọc tour thông minh theo đa tiêu chí (Specification) */
    @GetMapping("/filter")
    public ResponseEntity<List<TourDto>> filterTours(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Integer categoryId,
            @RequestParam(required = false) Integer providerId,
            @RequestParam(required = false) String departureLocation,
            @RequestParam(required = false) java.math.BigDecimal minPrice,
            @RequestParam(required = false) java.math.BigDecimal maxPrice,
            @RequestParam(required = false) Integer minDuration,
            @RequestParam(required = false) Integer maxDuration,
            @RequestParam(required = false) Integer hotelStar,
            @RequestParam(required = false) String vehicle,
            @RequestParam(required = false) String status,
            @RequestParam(required = false, defaultValue = "bestseller") String sortBy
    ) {
        vn.dulichviet.tourbooking.dto.TourFilterRequest filter = new vn.dulichviet.tourbooking.dto.TourFilterRequest(
                keyword, categoryId, providerId, departureLocation, minPrice, maxPrice,
                minDuration, maxDuration, hotelStar, vehicle, status, sortBy
        );
        return ResponseEntity.ok(tourService.filterTours(filter));
    }

    /** Công khai: lấy chi tiết 1 tour */
    @GetMapping("/{id:[0-9]+}")
    public ResponseEntity<TourDto> getById(
            @PathVariable Integer id,
            @RequestParam(required = false) String sessionId,
            @org.springframework.security.core.annotation.AuthenticationPrincipal vn.dulichviet.tourbooking.config.CustomUserDetails userDetails) {
        TourDto tour = tourService.findById(id);
        // Tự động lưu vết xem tour
        Integer userId = userDetails != null ? userDetails.getUser().getId() : null;
        recommendationService.recordActivity(userId, sessionId, id, "VIEW");
        return ResponseEntity.ok(tour);
    }

    /** Công khai: tìm kiếm tour */
    @GetMapping("/search")
    public ResponseEntity<List<TourDto>> search(@RequestParam String keyword) {
        return ResponseEntity.ok(tourService.search(keyword));
    }

    /** Công khai: lấy tour theo category */
    @GetMapping("/category/{categoryId}")
    public ResponseEntity<List<TourDto>> getByCategory(@PathVariable Integer categoryId) {
        return ResponseEntity.ok(tourService.findByCategoryId(categoryId));
    }

    // ---- ADMIN & PROVIDER ----

    @PreAuthorize("hasAnyRole('ADMIN', 'PROVIDER')")
    @PostMapping
    public ResponseEntity<TourDto> create(
            @jakarta.validation.Valid @RequestBody TourRequest request,
            @org.springframework.security.core.annotation.AuthenticationPrincipal vn.dulichviet.tourbooking.config.CustomUserDetails userDetails) {
        var user = userDetails != null ? userDetails.getUser() : null;
        return ResponseEntity.status(201).body(tourService.create(request, user));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'PROVIDER')")
    @PutMapping("/{id}")
    public ResponseEntity<TourDto> update(
            @PathVariable Integer id,
            @jakarta.validation.Valid @RequestBody TourRequest request,
            @org.springframework.security.core.annotation.AuthenticationPrincipal vn.dulichviet.tourbooking.config.CustomUserDetails userDetails) {
        var user = userDetails != null ? userDetails.getUser() : null;
        return ResponseEntity.ok(tourService.update(id, request, user));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'PROVIDER')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Integer id,
            @org.springframework.security.core.annotation.AuthenticationPrincipal vn.dulichviet.tourbooking.config.CustomUserDetails userDetails) {
        var user = userDetails != null ? userDetails.getUser() : null;
        tourService.delete(id, user);
        return ResponseEntity.noContent().build();
    }

    /** Công khai / Quản trị: Đồng bộ bộ dữ liệu 40 tour du lịch thực tế vào MariaDB */
    @PostMapping("/sync-real-data")
    public ResponseEntity<String> syncRealData(@RequestBody List<java.util.Map<String, Object>> tours) {
        int count = tourService.syncRealTours(tours);
        return ResponseEntity.ok("Đã đồng bộ thành công " + count + " tour du lịch thực tế vào cơ sở dữ liệu!");
    }
}
