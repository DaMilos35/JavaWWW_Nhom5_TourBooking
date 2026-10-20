package vn.dulichviet.tourbooking.dto;

import vn.dulichviet.tourbooking.entity.Tour;

import java.math.BigDecimal;
import java.time.LocalDate;

public record TourDto(
        Integer id,
        String name,
        String description,
        BigDecimal price,
        Integer duration,
        String departureLocation,
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

    public TourDto(Integer id, String name, String description, BigDecimal price, Integer duration,
                   String departureLocation, String imageUrl, Integer availableSeats, LocalDate startDate,
                   LocalDate endDate, String status, BigDecimal rating, Integer categoryId, String categoryName) {
        this(id, name, description, price, duration, departureLocation, imageUrl, availableSeats,
                startDate, endDate, status, rating, categoryId, categoryName, null, null);
    }

    public static TourDto from(Tour t) {
        Integer pId = t.getProvider() != null ? t.getProvider().getId() : null;
        String pName = t.getProvider() != null ? t.getProvider().getFullName() : null;
        Integer cId = t.getCategory() != null ? t.getCategory().getId() : null;
        String cName = t.getCategory() != null ? t.getCategory().getName() : null;

        return new TourDto(t.getId(), t.getName(), t.getDescription(), t.getPrice(), t.getDuration(),
                t.getDepartureLocation(), t.getImageUrl(), t.getAvailableSeats(), t.getStartDate(),
                t.getEndDate(), t.getStatus(), t.getRating(), cId, cName, pId, pName);
    }
}
