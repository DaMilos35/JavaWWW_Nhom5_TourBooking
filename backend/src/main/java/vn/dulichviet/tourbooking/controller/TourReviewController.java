package vn.dulichviet.tourbooking.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.dulichviet.tourbooking.config.CustomUserDetails;
import vn.dulichviet.tourbooking.dto.CreateTourReviewRequest;
import vn.dulichviet.tourbooking.dto.ReviewEligibilityDto;
import vn.dulichviet.tourbooking.dto.TourReviewDto;
import vn.dulichviet.tourbooking.service.TourReviewService;

import java.util.List;

@RestController
@RequestMapping("/api/tours/{tourId}/reviews")
public class TourReviewController {
    private final TourReviewService reviewService;

    public TourReviewController(TourReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @GetMapping
    public List<TourReviewDto> getReviews(@PathVariable Integer tourId) {
        return reviewService.getReviews(tourId);
    }

    @GetMapping("/eligibility")
    @PreAuthorize("isAuthenticated()")
    public ReviewEligibilityDto getEligibility(@PathVariable Integer tourId,
                                               @AuthenticationPrincipal CustomUserDetails userDetails) {
        return reviewService.getEligibility(tourId, userDetails.getUser());
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public TourReviewDto createReview(@PathVariable Integer tourId,
                                      @RequestBody CreateTourReviewRequest request,
                                      @AuthenticationPrincipal CustomUserDetails userDetails) {
        return reviewService.createReview(tourId, userDetails.getUser(), request);
    }
}
