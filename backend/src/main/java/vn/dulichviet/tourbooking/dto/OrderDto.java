package vn.dulichviet.tourbooking.dto;

import vn.dulichviet.tourbooking.entity.TourOrder;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record OrderDto(
        Integer id,
        String orderCode,
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
        Boolean isB2b,
        Integer discountPercent,
        String paymentMethod,
        String paymentStatus,
        String paymentTransactionId,
        Integer cancellationFeePercent,
        BigDecimal cancellationFee,
        BigDecimal refundAmount,
        String refundBankName,
        String refundAccountNumber,
        String refundAccountName,
        String cancellationReason,
        List<OrderDetailDto> details) {
    public static OrderDto from(TourOrder o) {
        String username = o.getUser() != null ? o.getUser().getUsername() : null;
        Integer userId = o.getUser() != null ? o.getUser().getId() : null;
        String code = o.getOrderCode() != null ? o.getOrderCode() : ("ORD-" + o.getId());
        Boolean b2b = Boolean.TRUE.equals(o.getIsB2b());
        Integer discount = o.getDiscountPercent() != null ? o.getDiscountPercent() : 0;
        String payMethod = o.getPaymentMethod() != null ? o.getPaymentMethod() : "CASH";
        String payStatus = o.getPaymentStatus() != null ? o.getPaymentStatus() : "UNPAID";
        Integer cancelFeePercent = o.getCancellationFeePercent() != null ? o.getCancellationFeePercent() : 0;
        BigDecimal cancelFee = o.getCancellationFee() != null ? o.getCancellationFee() : BigDecimal.ZERO;
        BigDecimal refundAmt = o.getRefundAmount() != null ? o.getRefundAmount() : BigDecimal.ZERO;

        return new OrderDto(o.getId(), code, userId, username, o.getOrderDate(), o.getOrderDate(),
                o.getTotalAmount(), o.getStatus(), o.getContactName(), o.getContactPhone(),
                o.getContactEmail(), o.getContactName(), o.getContactPhone(), o.getContactEmail(),
                o.getNotes(), b2b, discount, payMethod, payStatus, o.getPaymentTransactionId(),
                cancelFeePercent, cancelFee, refundAmt,
                o.getRefundBankName(), o.getRefundAccountNumber(), o.getRefundAccountName(),
                o.getCancellationReason(),
                o.getDetails().stream().map(OrderDetailDto::from).toList());
    }
}
