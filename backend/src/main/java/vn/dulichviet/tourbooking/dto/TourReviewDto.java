package vn.dulichviet.tourbooking.dto;

import vn.dulichviet.tourbooking.entity.TourReview;

import java.time.LocalDateTime;

public record TourReviewDto(
        Integer id,
        String author,
        Integer rating,
        String tripType,
        String comment,
        LocalDateTime createdAt) {

    public static TourReviewDto from(TourReview review) {
        String fullName = review.getUser().getFullName();
        if (fullName == null || fullName.isBlank()) fullName = review.getUser().getUsername();
        String[] nameParts = fullName.trim().split("\\s+");
        String author = nameParts.length > 1
                ? nameParts[0] + " " + nameParts[nameParts.length - 1].charAt(0) + "."
                : nameParts[0].charAt(0) + "***";
        return new TourReviewDto(review.getId(), author, review.getRating(), review.getTripType(),
                review.getComment(), review.getCreatedAt());
    }
}
