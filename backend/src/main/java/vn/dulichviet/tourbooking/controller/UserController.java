package vn.dulichviet.tourbooking.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import vn.dulichviet.tourbooking.config.CustomUserDetails;
import vn.dulichviet.tourbooking.dto.UpdatePasswordRequest;
import vn.dulichviet.tourbooking.dto.UpdateProfileRequest;
import vn.dulichviet.tourbooking.dto.UserDto;
import vn.dulichviet.tourbooking.exception.ApiException;
import vn.dulichviet.tourbooking.service.UserService;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    /** Lấy profile của chính mình */
    @GetMapping("/me")
    public ResponseEntity<UserDto> getMyProfile(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(userService.getById(extractUserId(userDetails)));
    }

    /** Cập nhật profile */
    @PutMapping("/me")
    public ResponseEntity<UserDto> updateMyProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(userService.updateProfile(extractUserId(userDetails), request));
    }

    /** Đổi mật khẩu */
    @PutMapping("/me/password")
    public ResponseEntity<UserService.MapMessage> changePassword(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody UpdatePasswordRequest request) {
        return ResponseEntity.ok(userService.updatePassword(extractUserId(userDetails), request));
    }

    private Integer extractUserId(UserDetails userDetails) {
        if (userDetails instanceof CustomUserDetails custom) {
            return custom.getUser().getId();
        }
        throw new ApiException(401, "Chưa đăng nhập");
    }
}
