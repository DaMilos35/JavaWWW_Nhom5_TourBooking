package vn.dulichviet.tourbooking.dto;

import vn.dulichviet.tourbooking.entity.User;

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
        LocalDateTime createdAt) {
    public static UserDto from(User u) {
        return new UserDto(u.getId(), u.getUsername(), u.getEmail(), u.getFullName(),
                u.getPhone(), u.getAddress(), u.getRole(), u.getActive(), u.getActive(), u.getCreatedAt());
    }
}
