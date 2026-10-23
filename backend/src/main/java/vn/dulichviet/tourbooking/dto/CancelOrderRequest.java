package vn.dulichviet.tourbooking.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record CancelOrderRequest(
        String refundBankName,
        String refundAccountNumber,
        String refundAccountName,
        String reason
) {}
