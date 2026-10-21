package vn.dulichviet.tourbooking.dto;

public record PayOrderRequest(
        String paymentMethod,
        String transactionCode,
        String notes
) {
    public PayOrderRequest() {
        this("VIETQR", null, null);
    }
}
