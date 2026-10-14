package vn.dulichviet.tourbooking.dto;

import vn.dulichviet.tourbooking.entity.OrderDetail;

import java.math.BigDecimal;

public record OrderDetailDto(
        Integer id,
        Integer tourId,
        String tourName,
        Integer quantity,
        BigDecimal unitPrice,
        BigDecimal price,
        TourDto tour) {
    public static OrderDetailDto from(OrderDetail d) {
        TourDto tourDto = d.getTour() != null ? TourDto.from(d.getTour()) : null;
        String name = d.getTour() != null ? d.getTour().getName() : "Tour";
        Integer tId = d.getTour() != null ? d.getTour().getId() : null;
        return new OrderDetailDto(d.getId(), tId, name,
                d.getQuantity(), d.getUnitPrice(), d.getUnitPrice(), tourDto);
    }
}
