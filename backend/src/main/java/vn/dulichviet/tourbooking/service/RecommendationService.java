package vn.dulichviet.tourbooking.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.dulichviet.tourbooking.dto.TourDto;
import vn.dulichviet.tourbooking.entity.Tour;
import vn.dulichviet.tourbooking.entity.User;
import vn.dulichviet.tourbooking.entity.UserActivityHistory;
import vn.dulichviet.tourbooking.repository.TourRepository;
import vn.dulichviet.tourbooking.repository.UserActivityHistoryRepository;
import vn.dulichviet.tourbooking.repository.UserRepository;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Service theo dõi lịch sử hoạt động và gợi ý tour cá nhân hóa (Personalized Tour Recommendation)
 * Áp dụng giải thuật Content-Based kết hợp trọng số tương tác (VIEW=1, ADD_TO_CART=3, BOOK=5).
 * Hỗ trợ cả Khách vãng lai (Guest thông qua SessionId) và Khách hàng đã đăng nhập (User).
 */
@Service
public class RecommendationService {
    private static final Logger log = LoggerFactory.getLogger(RecommendationService.class);

    private final UserActivityHistoryRepository activityRepository;
    private final TourRepository tourRepository;
    private final UserRepository userRepository;

    public RecommendationService(UserActivityHistoryRepository activityRepository,
                                 TourRepository tourRepository,
                                 UserRepository userRepository) {
        this.activityRepository = activityRepository;
        this.tourRepository = tourRepository;
        this.userRepository = userRepository;
    }

    /**
     * Ghi nhận hành vi người dùng
     * @param userId ID người dùng đăng nhập (có thể null nếu là Guest)
     * @param sessionId Session ID của khách vãng lai
     * @param tourId ID tour được tương tác
     * @param activityType "VIEW", "ADD_TO_CART", "BOOK"
     */
    @Transactional
    public void recordActivity(Integer userId, String sessionId, Integer tourId, String activityType) {
        try {
            if (tourId == null || activityType == null) return;

            Tour tour = tourRepository.findById(tourId).orElse(null);
            if (tour == null) return;

            User user = null;
            if (userId != null) {
                user = userRepository.findById(userId).orElse(null);
            }

            int score = switch (activityType.toUpperCase()) {
                case "BOOK" -> 5;
                case "ADD_TO_CART" -> 3;
                default -> 1; // VIEW
            };

            UserActivityHistory history = new UserActivityHistory(user, sessionId, tour, activityType.toUpperCase(), score);
            activityRepository.save(history);
            log.debug("Recorded activity: type={}, tourId={}, userId={}, sessionId={}", activityType, tourId, userId, sessionId);
        } catch (Exception e) {
            log.warn("Không thể ghi nhận lịch sử hoạt động: {}", e.getMessage());
        }
    }

    /**
     * Lấy danh sách tour gợi ý cá nhân hóa dựa trên lịch sử tương tác
     */
    public List<TourDto> getRecommendations(Integer userId, String sessionId, int limit) {
        if (limit <= 0) limit = 4;

        List<Integer> preferredCategoryIds = new ArrayList<>();
        if (userId != null) {
            preferredCategoryIds = activityRepository.findTopCategoryIdsByUserId(userId, PageRequest.of(0, 3));
        }
        if (preferredCategoryIds.isEmpty() && sessionId != null && !sessionId.isBlank()) {
            preferredCategoryIds = activityRepository.findTopCategoryIdsBySessionId(sessionId, PageRequest.of(0, 3));
        }

        Set<Integer> excludedTourIds = new HashSet<>();
        // Lấy các tour vừa xem gần nhất để ưu tiên gợi ý tour mới cùng danh mục
        if (userId != null) {
            activityRepository.findRecentByUserId(userId, PageRequest.of(0, 10))
                    .forEach(h -> excludedTourIds.add(h.getTour().getId()));
        } else if (sessionId != null && !sessionId.isBlank()) {
            activityRepository.findRecentBySessionId(sessionId, PageRequest.of(0, 10))
                    .forEach(h -> excludedTourIds.add(h.getTour().getId()));
        }

        List<Tour> recommendedTours = new ArrayList<>();

        // Bước 1: Tìm các tour cùng danh mục yêu thích
        if (!preferredCategoryIds.isEmpty()) {
            for (Integer catId : preferredCategoryIds) {
                List<Tour> catTours = tourRepository.findByCategoryId(catId).stream()
                        .filter(t -> "ACTIVE".equalsIgnoreCase(t.getStatus()))
                        .filter(t -> !excludedTourIds.contains(t.getId()))
                        .sorted(Comparator.comparing(Tour::getRating, Comparator.nullsLast(Comparator.reverseOrder())))
                        .toList();

                for (Tour t : catTours) {
                    if (recommendedTours.size() < limit && !recommendedTours.contains(t)) {
                        recommendedTours.add(t);
                    }
                }
            }
        }

        // Bước 2: Nếu chưa đủ số lượng, bổ sung các tour có rating cao nhất toàn hệ thống
        if (recommendedTours.size() < limit) {
            List<Tour> popularTours = tourRepository.findByStatus("ACTIVE").stream()
                    .filter(t -> !recommendedTours.contains(t))
                    .sorted(Comparator.comparing(Tour::getRating, Comparator.nullsLast(Comparator.reverseOrder()))
                            .thenComparing(Tour::getAvailableSeats, Comparator.reverseOrder()))
                    .limit(limit - recommendedTours.size())
                    .toList();
            recommendedTours.addAll(popularTours);
        }

        return recommendedTours.stream().limit(limit).map(TourDto::from).collect(Collectors.toList());
    }

    /**
     * Lấy danh sách tour đã xem gần đây (Recently Viewed)
     */
    public List<TourDto> getRecentlyViewed(Integer userId, String sessionId, int limit) {
        if (limit <= 0) limit = 6;

        List<UserActivityHistory> recents;
        if (userId != null) {
            recents = activityRepository.findRecentByUserId(userId, PageRequest.of(0, limit * 2));
        } else if (sessionId != null && !sessionId.isBlank()) {
            recents = activityRepository.findRecentBySessionId(sessionId, PageRequest.of(0, limit * 2));
        } else {
            return List.of();
        }

        // Lọc trùng ID và giữ nguyên thứ tự gần nhất
        Set<Integer> seenIds = new HashSet<>();
        List<TourDto> result = new ArrayList<>();
        for (UserActivityHistory h : recents) {
            if (h.getTour() != null && seenIds.add(h.getTour().getId())) {
                result.add(TourDto.from(h.getTour()));
                if (result.size() >= limit) break;
            }
        }
        return result;
    }
}
