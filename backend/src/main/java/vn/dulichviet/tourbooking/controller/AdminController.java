package vn.dulichviet.tourbooking.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import vn.dulichviet.tourbooking.dto.DashboardDto;
import vn.dulichviet.tourbooking.dto.OrderDto;
import vn.dulichviet.tourbooking.dto.UpdateOrderStatusRequest;
import vn.dulichviet.tourbooking.dto.UserDto;
import vn.dulichviet.tourbooking.exception.ApiException;
import vn.dulichviet.tourbooking.dto.UpdateQuantityRequest;
import vn.dulichviet.tourbooking.repository.TourOrderRepository;
import vn.dulichviet.tourbooking.repository.UserRepository;
import vn.dulichviet.tourbooking.service.OrderService;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasAnyRole('ADMIN', 'PROVIDER')")
public class AdminController {
    private final OrderService orderService;
    private final UserRepository userRepository;
    private final TourOrderRepository orderRepository;
    private final vn.dulichviet.tourbooking.repository.TourRepository tourRepository;
    private final vn.dulichviet.tourbooking.repository.UserActivityHistoryRepository userActivityHistoryRepository;

    public AdminController(OrderService orderService,
                           UserRepository userRepository,
                           TourOrderRepository orderRepository,
                           vn.dulichviet.tourbooking.repository.TourRepository tourRepository,
                           vn.dulichviet.tourbooking.repository.UserActivityHistoryRepository userActivityHistoryRepository) {
        this.orderService = orderService;
        this.userRepository = userRepository;
        this.orderRepository = orderRepository;
        this.tourRepository = tourRepository;
        this.userActivityHistoryRepository = userActivityHistoryRepository;
    }

    /** Dashboard tổng quan */
    @GetMapping("/dashboard")
    public ResponseEntity<DashboardDto> dashboard(
            @org.springframework.security.core.annotation.AuthenticationPrincipal vn.dulichviet.tourbooking.config.CustomUserDetails userDetails) {
        var user = userDetails != null ? userDetails.getUser() : null;
        return ResponseEntity.ok(orderService.getDashboard(user));
    }

    // ===== ORDERS =====

    @GetMapping("/orders")
    public ResponseEntity<List<OrderDto>> getAllOrders(
            @org.springframework.security.core.annotation.AuthenticationPrincipal vn.dulichviet.tourbooking.config.CustomUserDetails userDetails) {
        var user = userDetails != null ? userDetails.getUser() : null;
        return ResponseEntity.ok(orderService.getAllOrders(user));
    }

    @GetMapping("/orders/{id}")
    public ResponseEntity<OrderDto> getOrderById(@PathVariable Integer id) {
        return ResponseEntity.ok(orderService.getOrderById(id));
    }

    @PutMapping("/orders/{id}/status")
    public ResponseEntity<OrderDto> updateOrderStatus(
            @PathVariable Integer id,
            @RequestBody UpdateOrderStatusRequest request) {
        return ResponseEntity.ok(orderService.updateOrderStatus(id, request));
    }

    @PutMapping("/orders/{orderId}/details/{detailId}")
    public ResponseEntity<OrderDto> updateOrderDetailQuantity(
            @PathVariable Integer orderId,
            @PathVariable Integer detailId,
            @RequestBody UpdateQuantityRequest request,
            @org.springframework.security.core.annotation.AuthenticationPrincipal vn.dulichviet.tourbooking.config.CustomUserDetails userDetails) {
        var user = userDetails != null ? userDetails.getUser() : null;
        return ResponseEntity.ok(orderService.updateOrderDetailQuantity(orderId, detailId, request.quantity(), user));
    }

    // ===== USERS (Chỉ ADMIN) =====

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/users")
    public ResponseEntity<List<UserDto>> getAllUsers() {
        List<UserDto> users = userRepository.findAll().stream()
                .map(UserDto::from)
                .collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/users/{id}")
    public ResponseEntity<UserDto> getUserById(@PathVariable Integer id) {
        return userRepository.findById(id)
                .map(u -> ResponseEntity.ok(UserDto.from(u)))
                .orElseThrow(() -> new ApiException(404, "Không tìm thấy người dùng"));
    }

    /** Cập nhật user chung (role hoặc active) */
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/users/{id}")
    public ResponseEntity<UserDto> updateUser(
            @PathVariable Integer id,
            @RequestBody Map<String, Object> body) {
        var user = userRepository.findById(id)
                .orElseThrow(() -> new ApiException(404, "Không tìm thấy người dùng"));
        if (body.containsKey("role")) {
            String role = (String) body.get("role");
            if (role != null) {
                user.setRole(role.trim());
            }
        }
        if (body.containsKey("isActive")) {
            user.setActive(Boolean.TRUE.equals(body.get("isActive")));
        } else if (body.containsKey("active")) {
            user.setActive(Boolean.TRUE.equals(body.get("active")));
        }
        return ResponseEntity.ok(UserDto.from(userRepository.save(user)));
    }

    /** Khoá / mở khoá tài khoản */
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/users/{id}/toggle-active")
    public ResponseEntity<Map<String, Object>> toggleUserActive(@PathVariable Integer id) {
        var user = userRepository.findById(id)
                .orElseThrow(() -> new ApiException(404, "Không tìm thấy người dùng"));
        user.setActive(!Boolean.TRUE.equals(user.getActive()));
        userRepository.save(user);
        return ResponseEntity.ok(Map.of(
                "message", user.getActive() ? "Tài khoản đã được mở khoá" : "Tài khoản đã bị khoá",
                "active", user.getActive(),
                "isActive", user.getActive()
        ));
    }

    /** Thay đổi role */
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/users/{id}/role")
    public ResponseEntity<UserDto> updateUserRole(
            @PathVariable Integer id,
            @RequestBody Map<String, String> body) {
        String newRole = body.get("role");
        if (newRole == null || newRole.isBlank()) {
            throw new ApiException(400, "Role không hợp lệ (ADMIN | CUSTOMER | PROVIDER)");
        }
        var user = userRepository.findById(id)
                .orElseThrow(() -> new ApiException(404, "Không tìm thấy người dùng"));
        user.setRole(newRole.trim());
        return ResponseEntity.ok(UserDto.from(userRepository.save(user)));
    }

    /** Xóa người dùng (Safe Delete) */
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Integer id) {
        var user = userRepository.findById(id)
                .orElseThrow(() -> new ApiException(404, "Không tìm thấy người dùng"));
        if (!orderRepository.findByUserIdWithDetails(id).isEmpty()) {
            throw new ApiException(400, "Không thể xóa người dùng đang có đơn hàng trong hệ thống. Vui lòng tạm khóa tài khoản.");
        }
        if (tourRepository.countByProviderId(id) > 0) {
            throw new ApiException(400, "Không thể xóa đối tác đang có tour đăng ký trong hệ thống. Vui lòng chuyển trạng thái tour sang Tạm ẩn.");
        }
        userActivityHistoryRepository.deleteByUserId(id);
        userRepository.delete(user);
        return ResponseEntity.noContent().build();
    }
}
