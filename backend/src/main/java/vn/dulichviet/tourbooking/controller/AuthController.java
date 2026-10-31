package vn.dulichviet.tourbooking.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import vn.dulichviet.tourbooking.config.CustomUserDetails;
import vn.dulichviet.tourbooking.dto.ForgotPasswordRequest;
import vn.dulichviet.tourbooking.dto.RegisterRequest;
import vn.dulichviet.tourbooking.dto.ResetPasswordRequest;
import vn.dulichviet.tourbooking.dto.VerifyOtpRequest;
import vn.dulichviet.tourbooking.service.AuthService;
import vn.dulichviet.tourbooking.service.PasswordResetService;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;
    private final PasswordResetService passwordResetService;

    public AuthController(AuthService authService, PasswordResetService passwordResetService) {
        this.authService = authService;
        this.passwordResetService = passwordResetService;
    }

    @PostMapping("/send-otp")
    public ResponseEntity<Map<String, String>> sendOtp(@RequestBody Map<String, String> body) {
        String email = body != null ? body.get("email") : null;
        return ResponseEntity.ok(authService.sendOtp(email));
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, String>> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    /**
     * 1. API yêu cầu gửi mã xác thực (hỗ trợ cả kênh Email và Phone SMS)
     */
    @PostMapping({"/password/forgot", "/forgot-password"})
    public ResponseEntity<Map<String, Object>> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request,
            HttpServletRequest servletRequest) {
        String clientIp = extractClientIp(servletRequest);
        return ResponseEntity.ok(passwordResetService.requestReset(request, clientIp));
    }

    /**
     * 2. API xác thực OTP (đối với số điện thoại) và cấp Reset Token tạm thời
     */
    @PostMapping({"/password/verify-otp", "/verify-otp"})
    public ResponseEntity<Map<String, Object>> verifyOtp(
            @Valid @RequestBody VerifyOtpRequest request,
            HttpServletRequest servletRequest) {
        String clientIp = extractClientIp(servletRequest);
        return ResponseEntity.ok(passwordResetService.verifyOtp(request, clientIp));
    }

    /**
     * 3. API đặt lại mật khẩu mới (xác thực qua Reset Token từ link email hoặc qua OTP token)
     */
    @PostMapping({"/password/reset", "/reset-password"})
    public ResponseEntity<Map<String, Object>> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request,
            HttpServletRequest servletRequest) {
        String clientIp = extractClientIp(servletRequest);
        return ResponseEntity.ok(passwordResetService.resetPassword(request, clientIp));
    }

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getCurrentUser(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Chưa đăng nhập"));
        }
        if (userDetails instanceof CustomUserDetails customUser) {
            var user = customUser.getUser();
            return ResponseEntity.ok(Map.of(
                "userId", user.getId(),
                "username", user.getUsername(),
                "email", user.getEmail(),
                "role", user.getRole(),
                "fullName", user.getFullName() != null ? user.getFullName() : user.getUsername(),
                "phone", user.getPhone() != null ? user.getPhone() : "",
                "address", user.getAddress() != null ? user.getAddress() : "",
                "membershipTier", user.getMembershipTier() != null ? user.getMembershipTier() : "STANDARD",
                "loyaltyPoints", user.getLoyaltyPoints() != null ? user.getLoyaltyPoints() : 0,
                "totalSpent", user.getTotalSpent() != null ? user.getTotalSpent() : java.math.BigDecimal.ZERO
            ));
        }
        return ResponseEntity.status(401).build();
    }

    private String extractClientIp(HttpServletRequest request) {
        if (request == null) return "127.0.0.1";
        String xf = request.getHeader("X-Forwarded-For");
        if (xf != null && !xf.isBlank()) {
            return xf.split(",")[0].trim();
        }
        return request.getRemoteAddr() != null ? request.getRemoteAddr() : "127.0.0.1";
    }
}
