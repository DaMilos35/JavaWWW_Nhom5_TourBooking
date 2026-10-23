package vn.dulichviet.tourbooking.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * DTO tạo và cập nhật tour với validation các thuộc tính phong phú theo chuẩn Traveloka
 */
public record TourRequest(
        @NotNull(message = "Danh mục tour không được để trống")
        Integer categoryId,

        @NotBlank(message = "Tên tour không được để trống")
        String name,

        String description,

        @NotNull(message = "Giá tour không được để trống")
        @DecimalMin(value = "1000", message = "Giá tour phải từ 1.000 VNĐ trở lên")
        BigDecimal price,

        BigDecimal originalPrice,

        @NotNull(message = "Thời lượng tour không được để trống")
        @Min(value = 1, message = "Thời lượng tour tối thiểu là 1 ngày")
        Integer duration,

        @NotBlank(message = "Điểm khởi hành không được để trống")
        String departureLocation,

        String vehicle,
        Integer hotelStar,
        String badge,
        String highlights,
        String itinerary,
        String inclusions,
        String exclusions,
        String imageUrl,

        @NotNull(message = "Số chỗ nhận khách không được để trống")
        @Min(value = 0, message = "Số chỗ nhận khách phải từ 0 trở lên")
        Integer availableSeats,

        LocalDate startDate,
        LocalDate endDate,
        String status,
        BigDecimal rating) {

    // Constructor tương thích phiên bản 12 tham số cũ
    public TourRequest(Integer categoryId, String name, String description, BigDecimal price,
                       Integer duration, String departureLocation, String imageUrl,
                       Integer availableSeats, LocalDate startDate, LocalDate endDate,
                       String status, BigDecimal rating) {
        this(categoryId, name, description, price, null, duration, departureLocation,
                null, 3, null, null, null, null, null, imageUrl,
                availableSeats, startDate, endDate, status, rating);
    }
}
