package vn.dulichviet.tourbooking.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.dulichviet.tourbooking.dto.CreateTourReviewRequest;
import vn.dulichviet.tourbooking.dto.ReviewEligibilityDto;
import vn.dulichviet.tourbooking.dto.TourReviewDto;
import vn.dulichviet.tourbooking.entity.TourReview;
import vn.dulichviet.tourbooking.entity.User;
import vn.dulichviet.tourbooking.exception.ApiException;
import vn.dulichviet.tourbooking.repository.TourOrderRepository;
import vn.dulichviet.tourbooking.repository.TourRepository;
import vn.dulichviet.tourbooking.repository.TourReviewRepository;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class TourReviewService {
    private final TourReviewRepository reviewRepository;
    private final TourOrderRepository orderRepository;
    private final TourRepository tourRepository;

    public TourReviewService(TourReviewRepository reviewRepository,
                             TourOrderRepository orderRepository,
                             TourRepository tourRepository) {
        this.reviewRepository = reviewRepository;
        this.orderRepository = orderRepository;
        this.tourRepository = tourRepository;
    }

    @Transactional(readOnly = true)
    public List<TourReviewDto> getReviews(Integer tourId) {
        if (!tourRepository.existsById(tourId)) {
            throw new ApiException(404, "Không tìm thấy tour");
        }
        return reviewRepository.findByTour_IdOrderByCreatedAtDesc(tourId).stream()
                .map(TourReviewDto::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public ReviewEligibilityDto getEligibility(Integer tourId, User user) {
        if (!tourRepository.existsById(tourId)) {
            throw new ApiException(404, "Không tìm thấy tour");
        }
        boolean alreadyReviewed = reviewRepository.existsByTour_IdAndUser_Id(tourId, user.getId());
        boolean completedTour = orderRepository.hasCompletedTourForUser(user.getId(), tourId);
        return new ReviewEligibilityDto(completedTour && !alreadyReviewed, alreadyReviewed);
    }

    @Transactional
    public TourReviewDto createReview(Integer tourId, User user, CreateTourReviewRequest request) {
        if (request == null || request.rating() == null || request.rating() < 1 || request.rating() > 5) {
            throw new ApiException(400, "Đánh giá phải từ 1 đến 5 sao");
        }
        if (request.comment() == null || request.comment().isBlank() || request.comment().trim().length() > 2000) {
            throw new ApiException(400, "Nội dung đánh giá là bắt buộc và tối đa 2.000 ký tự");
        }
        if (!tourRepository.existsById(tourId)) {
            throw new ApiException(404, "Không tìm thấy tour");
        }
        if (!orderRepository.hasCompletedTourForUser(user.getId(), tourId)) {
            throw new ApiException(403, "Chỉ khách đã hoàn thành tour này mới được đánh giá");
        }
        if (reviewRepository.existsByTour_IdAndUser_Id(tourId, user.getId())) {
            throw new ApiException(409, "Bạn đã gửi đánh giá cho tour này");
        }

        TourReview review = new TourReview();
        review.setTour(tourRepository.getReferenceById(tourId));
        review.setUser(user);
        review.setRating(request.rating());
        review.setTripType(cleanTripType(request.tripType()));
        review.setComment(request.comment().trim());
        review.setCreatedAt(LocalDateTime.now());
        return TourReviewDto.from(reviewRepository.save(review));
    }

    private String cleanTripType(String tripType) {
        if (tripType == null || tripType.isBlank()) return null;
        String normalized = tripType.trim();
        if (normalized.length() > 50) {
            throw new ApiException(400, "Loại chuyến đi tối đa 50 ký tự");
        }
        return normalized;
    }
}
