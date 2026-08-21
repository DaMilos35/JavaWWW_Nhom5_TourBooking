package com.nhom5.tourbooking.controller;

import com.nhom5.tourbooking.entity.User;
import com.nhom5.tourbooking.exception.ResourceNotFoundException;
import com.nhom5.tourbooking.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@CrossOrigin
public class UserController {

    @Autowired
    private UserRepository userRepository;

    /**
     * GET /api/users/me - Lấy thông tin người dùng hiện tại
     */
    @GetMapping("/me")
    public ResponseEntity<User> getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
        // Ẩn password trước khi trả về
        user.setPassword(null);
        return ResponseEntity.ok(user);
    }

    /**
     * PUT /api/users/me - Cập nhật thông tin cá nhân
     */
    @PutMapping("/me")
    public ResponseEntity<User> updateCurrentUser(@RequestBody User userDetails) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        // Chỉ cho phép cập nhật các trường cá nhân, không cho đổi username/role
        if (userDetails.getFullName() != null && !userDetails.getFullName().isBlank()) {
            user.setFullName(userDetails.getFullName());
        }
        if (userDetails.getPhone() != null && !userDetails.getPhone().isBlank()) {
            user.setPhone(userDetails.getPhone());
        }
        if (userDetails.getAddress() != null && !userDetails.getAddress().isBlank()) {
            user.setAddress(userDetails.getAddress());
        }
        // Email: kiểm tra không trùng với người khác
        if (userDetails.getEmail() != null && !userDetails.getEmail().isBlank()) {
            if (!user.getEmail().equals(userDetails.getEmail()) &&
                    userRepository.existsByEmail(userDetails.getEmail())) {
                return ResponseEntity.badRequest().build();
            }
            user.setEmail(userDetails.getEmail());
        }

        User saved = userRepository.save(user);
        saved.setPassword(null); // Ẩn password
        return ResponseEntity.ok(saved);
    }
}
