package vn.dulichviet.tourbooking.dto;

import vn.dulichviet.tourbooking.entity.User;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record UserDto(
        Integer id,
        String username,
        String email,
        String fullName,
        String phone,
        String address,
        String role,
        Boolean active,
        Boolean isActive,
        String membershipTier,
        Integer loyaltyPoints,
        BigDecimal totalSpent,
        Double discountRate,
        LocalDateTime createdAt) {

    public static UserDto from(User u) {
        String tier = u.getMembershipTier() != null ? u.getMembershipTier() : "STANDARD";
        Integer points = u.getLoyaltyPoints() != null ? u.getLoyaltyPoints() : 0;
        BigDecimal spent = u.getTotalSpent() != null ? u.getTotalSpent() : BigDecimal.ZERO;

        double discountRate = switch (tier.toUpperCase()) {
            case "VIP_PLATINUM" -> 0.08;
            case "DIAMOND" -> 0.05;
            case "GOLD" -> 0.03;
            default -> 0.0;
        };

        return new UserDto(
                u.getId(),
                u.getUsername(),
                u.getEmail(),
                u.getFullName(),
                u.getPhone(),
                u.getAddress(),
                u.getRole(),
                u.getActive(),
                u.getActive(),
                tier,
                points,
                spent,
                discountRate,
                u.getCreatedAt()
        );
    }
}
