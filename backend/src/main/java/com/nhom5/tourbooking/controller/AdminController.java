package com.nhom5.tourbooking.controller;

import com.nhom5.tourbooking.dto.TourRequest;
import com.nhom5.tourbooking.entity.*;
import com.nhom5.tourbooking.repository.OrderRepository;
import com.nhom5.tourbooking.repository.TourRepository;
import com.nhom5.tourbooking.repository.UserRepository;
import com.nhom5.tourbooking.service.CategoryService;
import com.nhom5.tourbooking.service.OrderService;
import com.nhom5.tourbooking.service.TourService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@CrossOrigin
public class AdminController {

    @Autowired
    private TourService tourService;

    @Autowired
    private CategoryService categoryService;

    @Autowired
    private OrderService orderService;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private TourRepository tourRepository;
    
    @Autowired
    private OrderRepository orderRepository;

    // Tour management
    @GetMapping("/tours")
    public ResponseEntity<List<Tour>> getAllTours() {
        return ResponseEntity.ok(tourService.getAllTours());
    }

    @GetMapping("/tours/{id}")
    public ResponseEntity<Tour> getTourById(@PathVariable Integer id) {
        return tourService.getTourById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/tours")
    public ResponseEntity<Tour> createTour(@Valid @RequestBody TourRequest request) {
        return ResponseEntity.ok(tourService.createTour(request));
    }

    @PutMapping("/tours/{id}")
    public ResponseEntity<Tour> updateTour(@PathVariable Integer id, @Valid @RequestBody TourRequest request) {
        return ResponseEntity.ok(tourService.updateTour(id, request));
    }

    @DeleteMapping("/tours/{id}")
    public ResponseEntity<?> deleteTour(@PathVariable Integer id) {
        tourService.deleteTour(id);
        return ResponseEntity.ok().build();
    }

    // Category management
    @GetMapping("/categories")
    public ResponseEntity<List<Category>> getAllCategories() {
        return ResponseEntity.ok(categoryService.getAllCategories());
    }

    @GetMapping("/categories/{id}")
    public ResponseEntity<Category> getCategoryById(@PathVariable Integer id) {
        return categoryService.getCategoryById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/categories")
    public ResponseEntity<Category> createCategory(@Valid @RequestBody Category category) {
        return ResponseEntity.ok(categoryService.createCategory(category));
    }

    @PutMapping("/categories/{id}")
    public ResponseEntity<Category> updateCategory(@PathVariable Integer id, @Valid @RequestBody Category category) {
        return ResponseEntity.ok(categoryService.updateCategory(id, category));
    }

    @DeleteMapping("/categories/{id}")
    public ResponseEntity<?> deleteCategory(@PathVariable Integer id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.ok().build();
    }

    // User management
    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Integer id) {
        return userRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Integer id, @RequestBody User userDetails) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new com.nhom5.tourbooking.exception.ResourceNotFoundException("User not found with id: " + id));
        if (userDetails.getFullName() != null) user.setFullName(userDetails.getFullName());
        if (userDetails.getPhone() != null) user.setPhone(userDetails.getPhone());
        if (userDetails.getAddress() != null) user.setAddress(userDetails.getAddress());
        if (userDetails.getRole() != null) user.setRole(userDetails.getRole());
        if (userDetails.getIsActive() != null) user.setIsActive(userDetails.getIsActive());
        return ResponseEntity.ok(userRepository.save(user));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Integer id) {
        // Ràng buộc: không xóa user nếu đã từng đặt hàng
        boolean hasOrders = orderRepository.existsByUserUserId(id);
        if (hasOrders) {
            return ResponseEntity.badRequest()
                    .body("Không thể xóa tài khoản này vì người dùng đã có đơn đặt tour!");
        }
        userRepository.deleteById(id);
        return ResponseEntity.ok("Xóa tài khoản thành công!");
    }

    // Order management
    @GetMapping("/orders")
    public ResponseEntity<Page<Order>> getAllOrders(@RequestParam(defaultValue = "0") int page,
                                                    @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(orderService.getAllOrders(PageRequest.of(page, size)));
    }

    @GetMapping("/orders/{id}")
    public ResponseEntity<Order> getOrderById(@PathVariable Integer id) {
        return orderService.getOrderById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/orders/{id}/status")
    public ResponseEntity<Order> updateOrderStatus(@PathVariable Integer id, @RequestParam OrderStatus status) {
        return ResponseEntity.ok(orderService.updateOrderStatus(id, status));
    }

    @PutMapping("/orders/{orderId}/details/{detailId}/quantity")
    public ResponseEntity<OrderDetail> updateOrderDetailQuantity(
            @PathVariable Integer orderId,
            @PathVariable Integer detailId,
            @RequestParam Integer quantity) {
        return ResponseEntity.ok(orderService.updateOrderDetailQuantity(detailId, quantity));
    }

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalTours", tourRepository.count());
        stats.put("totalOrders", orderRepository.count());
        stats.put("totalUsers", userRepository.count());

        List<Order> allOrders = orderRepository.findAll();
        BigDecimal totalRevenue = allOrders.stream()
                .filter(o -> o.getStatus() == OrderStatus.COMPLETED || o.getStatus() == OrderStatus.CONFIRMED)
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        stats.put("totalRevenue", totalRevenue);
        stats.put("recentOrders", orderRepository.findTop5ByOrderByOrderDateDesc());
        return ResponseEntity.ok(stats);
    }
}
