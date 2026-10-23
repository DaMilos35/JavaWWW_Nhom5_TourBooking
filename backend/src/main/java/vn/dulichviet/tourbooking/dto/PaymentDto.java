package vn.dulichviet.tourbooking.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.math.BigDecimal;

public class PaymentDto {

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record PaymentInfoDto(
            Integer orderId,
            String orderCode,
            BigDecimal amount,
            String bankName,
            String bankCode,
            String accountNumber,
            String accountName,
            String transferContent,
            String vietQrUrl,
            String paymentMethod,
            String paymentStatus
    ) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record VnPayResponseDto(
            Integer orderId,
            String orderCode,
            BigDecimal amount,
            String paymentUrl
    ) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record PaymentConfirmRequest(
            Integer orderId,
            String paymentMethod,
            String transactionId
    ) {}
}
