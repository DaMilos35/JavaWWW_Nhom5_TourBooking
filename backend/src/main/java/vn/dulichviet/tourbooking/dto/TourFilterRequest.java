package vn.dulichviet.tourbooking.dto;

import java.math.BigDecimal;

public record TourFilterRequest(
        String keyword,
        Integer categoryId,
        Integer providerId,
        String departureLocation,
        BigDecimal minPrice,
        BigDecimal maxPrice,
        Integer minDuration,
        Integer maxDuration,
        Integer hotelStar,
        String vehicle,
        String status,
        String sortBy
) {}
