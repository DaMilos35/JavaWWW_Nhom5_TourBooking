package com.nhom5.tourbooking.controller;

import com.nhom5.tourbooking.dto.OrderRequest;
import com.nhom5.tourbooking.entity.Order;
import com.nhom5.tourbooking.entity.User;
import com.nhom5.tourbooking.repository.UserRepository;
import com.nhom5.tourbooking.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin
public class OrderController {

    @Autowired
    private OrderService orderService;
    
    @Autowired
    private UserRepository userRepository;

    private Integer getCurrentUserId() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username).orElseThrow();
        return user.getUserId();
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    public ResponseEntity<Order> createOrder(@Valid @RequestBody OrderRequest request) {
        Integer userId = getCurrentUserId();
        Order order = orderService.createOrder(request, userId);
        return ResponseEntity.ok(order);
    }

    @GetMapping("/my")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    public ResponseEntity<List<Order>> getMyOrders() {
        Integer userId = getCurrentUserId();
        return ResponseEntity.ok(orderService.getOrdersByUser(userId));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    public ResponseEntity<Order> getOrderById(@PathVariable Integer id) {
        Order order = orderService.getOrderById(id).orElseThrow();
        Integer userId = getCurrentUserId();
        
        // Ensure user is fetching their own order unless ADMIN
        User user = userRepository.findById(userId).orElseThrow();
        if (!user.getRole().name().equals("ADMIN") && !order.getUser().getUserId().equals(userId)) {
            return ResponseEntity.status(403).build();
        }
        
        return ResponseEntity.ok(order);
    }
}
