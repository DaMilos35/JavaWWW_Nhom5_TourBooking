package vn.dulichviet.tourbooking.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import vn.dulichviet.tourbooking.config.CustomUserDetails;
import vn.dulichviet.tourbooking.dto.OrderDto;
import vn.dulichviet.tourbooking.dto.PaymentDto;
import vn.dulichviet.tourbooking.service.PaymentService;

import java.util.Enumeration;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/payment")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    /** Lấy thông tin thanh toán tài khoản ngân hàng & mã VietQR động */
    @GetMapping("/info/{orderId}")
    public ResponseEntity<PaymentDto.PaymentInfoDto> getPaymentInfo(
            @PathVariable Integer orderId,
            @AuthenticationPrincipal UserDetails userDetails) {
        Integer userId = extractUserId(userDetails);
        return ResponseEntity.ok(paymentService.getPaymentInfo(orderId, userId));
    }

    /** Tạo URL thanh toán sang cổng VNPay Sandbox */
    @PostMapping("/vnpay/create-url")
    public ResponseEntity<PaymentDto.VnPayResponseDto> createVnPayUrl(
            @RequestBody Map<String, Object> body,
            HttpServletRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        Integer userId = extractUserId(userDetails);
        Integer orderId = body.get("orderId") != null ? Integer.valueOf(body.get("orderId").toString()) : null;
        String clientReturnUrl = body.get("returnUrl") != null ? body.get("returnUrl").toString() : null;

        String ipAddress = request.getHeader("X-FORWARDED-FOR");
        if (ipAddress == null || ipAddress.isBlank()) {
            ipAddress = request.getRemoteAddr();
        }

        return ResponseEntity.ok(paymentService.createVnPayUrl(orderId, userId, ipAddress, clientReturnUrl));
    }

    /** Xử lý kết quả trả về từ cổng VNPay */
    @GetMapping("/vnpay/return")
    public ResponseEntity<OrderDto> processVnPayReturn(HttpServletRequest request) {
        Map<String, String> fields = new HashMap<>();
        for (Enumeration<String> params = request.getParameterNames(); params.hasMoreElements();) {
            String fieldName = params.nextElement();
            String fieldValue = request.getParameter(fieldName);
            if (fieldValue != null && !fieldValue.isBlank()) {
                fields.put(fieldName, fieldValue);
            }
        }
        return ResponseEntity.ok(paymentService.processVnPayReturn(fields));
    }

    /** Xác nhận thanh toán thành công (Chuyển khoản, VietQR, hoặc Mô phỏng VNPay Sandbox) */
    @PostMapping("/confirm")
    public ResponseEntity<OrderDto> confirmPayment(
            @RequestBody PaymentDto.PaymentConfirmRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        Integer userId = extractUserId(userDetails);
        return ResponseEntity.ok(paymentService.confirmPaymentSuccess(
                request.orderId(),
                userId,
                request.paymentMethod(),
                request.transactionId()
        ));
    }

    private Integer extractUserId(UserDetails userDetails) {
        if (userDetails instanceof CustomUserDetails custom) {
            return custom.getUser().getId();
        }
        return null; // Có thể null với các luồng guest/admin kiểm tra riêng
    }
}
