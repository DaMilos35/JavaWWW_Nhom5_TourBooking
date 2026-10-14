package vn.dulichviet.tourbooking.dto;

import vn.dulichviet.tourbooking.entity.TourOrder;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record OrderDto(
        Integer id,
        Integer userId,
        String username,
        LocalDateTime orderDate,
        LocalDateTime createdAt,
        BigDecimal totalAmount,
        String status,
        String contactName,
        String contactPhone,
        String contactEmail,
        String fullName,
        String phone,
        String email,
        String notes,
        List<OrderDetailDto> details) {
    public static OrderDto from(TourOrder o) {
        String username = o.getUser() != null ? o.getUser().getUsername() : null;
        Integer userId = o.getUser() != null ? o.getUser().getId() : null;
        return new OrderDto(o.getId(), userId, username, o.getOrderDate(), o.getOrderDate(),
                o.getTotalAmount(), o.getStatus(), o.getContactName(), o.getContactPhone(),
                o.getContactEmail(), o.getContactName(), o.getContactPhone(), o.getContactEmail(),
                o.getNotes(),
                o.getDetails().stream().map(OrderDetailDto::from).toList());
    }
}
