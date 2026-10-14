package vn.dulichviet.tourbooking.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import vn.dulichviet.tourbooking.config.CustomUserDetails;
import vn.dulichviet.tourbooking.dto.CreateOrderRequest;
import vn.dulichviet.tourbooking.dto.OrderDto;
import vn.dulichviet.tourbooking.service.OrderService;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {
    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    /** Lấy danh sách đơn hàng của user hiện tại */
    @GetMapping("/my")
    public ResponseEntity<List<OrderDto>> getMyOrders(
            @AuthenticationPrincipal UserDetails userDetails) {
        Integer userId = extractUserId(userDetails);
        return ResponseEntity.ok(orderService.getMyOrders(userId));
    }

    /** Lấy chi tiết 1 đơn của user hiện tại */
    @GetMapping("/my/{id}")
    public ResponseEntity<OrderDto> getMyOrderById(
            @PathVariable Integer id,
            @AuthenticationPrincipal UserDetails userDetails) {
        Integer userId = extractUserId(userDetails);
        return ResponseEntity.ok(orderService.getMyOrderById(id, userId));
    }

    /** Tạo đơn hàng mới */
    @PostMapping
    public ResponseEntity<OrderDto> createOrder(
            @jakarta.validation.Valid @RequestBody CreateOrderRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        Integer userId = extractUserId(userDetails);
        return ResponseEntity.status(201).body(orderService.createOrder(request, userId));
    }

    /** Huỷ đơn hàng (chỉ khi PENDING) */
    @PostMapping("/my/{id}/cancel")
    public ResponseEntity<OrderDto> cancelOrder(
            @PathVariable Integer id,
            @AuthenticationPrincipal UserDetails userDetails) {
        Integer userId = extractUserId(userDetails);
        return ResponseEntity.ok(orderService.cancelOrder(id, userId));
    }

    private Integer extractUserId(UserDetails userDetails) {
        if (userDetails instanceof CustomUserDetails custom) {
            return custom.getUser().getId();
        }
        throw new vn.dulichviet.tourbooking.exception.ApiException(401, "Chưa đăng nhập");
    }
}
