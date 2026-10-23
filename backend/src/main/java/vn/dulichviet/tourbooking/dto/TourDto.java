package vn.dulichviet.tourbooking.dto;

import vn.dulichviet.tourbooking.entity.Tour;

import java.math.BigDecimal;
import java.time.LocalDate;

public record TourDto(
        Integer id,
        String name,
        String description,
        BigDecimal price,
        BigDecimal originalPrice,
        Integer duration,
        String departureLocation,
        String vehicle,
        Integer hotelStar,
        String badge,
        String highlights,
        String itinerary,
        String inclusions,
        String exclusions,
        String imageUrl,
        Integer availableSeats,
        LocalDate startDate,
        LocalDate endDate,
        String status,
        BigDecimal rating,
        Integer categoryId,
        String categoryName,
        Integer providerId,
        String providerName) {

    // Constructor tương thích 16 tham số cũ
    public TourDto(Integer id, String name, String description, BigDecimal price, Integer duration,
                   String departureLocation, String imageUrl, Integer availableSeats, LocalDate startDate,
                   LocalDate endDate, String status, BigDecimal rating, Integer categoryId,
                   String categoryName, Integer providerId, String providerName) {
        this(id, name, description, price, null, duration, departureLocation, null, 3, null,
                null, null, null, null, imageUrl, availableSeats, startDate, endDate, status,
                rating, categoryId, categoryName, providerId, providerName);
    }

    // Constructor tương thích 14 tham số cũ
    public TourDto(Integer id, String name, String description, BigDecimal price, Integer duration,
                   String departureLocation, String imageUrl, Integer availableSeats, LocalDate startDate,
                   LocalDate endDate, String status, BigDecimal rating, Integer categoryId, String categoryName) {
        this(id, name, description, price, null, duration, departureLocation, null, 3, null,
                null, null, null, null, imageUrl, availableSeats, startDate, endDate, status,
                rating, categoryId, categoryName, null, null);
    }

    public static TourDto from(Tour t) {
        Integer pId = t.getProvider() != null ? t.getProvider().getId() : null;
        String pName = t.getProvider() != null ? t.getProvider().getFullName() : null;
        Integer cId = t.getCategory() != null ? t.getCategory().getId() : null;
        String cName = t.getCategory() != null ? t.getCategory().getName() : null;

        return new TourDto(
                t.getId(),
                t.getName(),
                t.getDescription(),
                t.getPrice(),
                t.getOriginalPrice(),
                t.getDuration(),
                t.getDepartureLocation(),
                t.getVehicle(),
                t.getHotelStar(),
                t.getBadge(),
                t.getHighlights(),
                t.getItinerary(),
                t.getInclusions(),
                t.getExclusions(),
                t.getImageUrl(),
                t.getAvailableSeats(),
                t.getStartDate(),
                t.getEndDate(),
                t.getStatus(),
                t.getRating(),
                cId,
                cName,
                pId,
                pName
        );
    }
}
