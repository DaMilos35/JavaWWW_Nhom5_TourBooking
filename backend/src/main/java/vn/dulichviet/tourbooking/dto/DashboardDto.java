package vn.dulichviet.tourbooking.dto;

import java.math.BigDecimal;
import java.util.List;

public record DashboardDto(
        long totalTours,
        long totalOrders,
        long totalUsers,
        BigDecimal totalRevenue,
        List<OrderDto> recentOrders) {
}
