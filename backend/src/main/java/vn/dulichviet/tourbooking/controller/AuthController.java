package vn.dulichviet.tourbooking.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.dulichviet.tourbooking.dto.RegisterRequest;
import vn.dulichviet.tourbooking.service.AuthService;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/send-otp")
    public ResponseEntity<Map<String, String>> sendOtp(@RequestBody Map<String, String> body) {
        String email = body != null ? body.get("email") : null;
        return ResponseEntity.ok(authService.sendOtp(email));
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, String>> register(@jakarta.validation.Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getCurrentUser(@org.springframework.security.core.annotation.AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Chưa đăng nhập"));
        }
        if (userDetails instanceof vn.dulichviet.tourbooking.config.CustomUserDetails customUser) {
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
}
