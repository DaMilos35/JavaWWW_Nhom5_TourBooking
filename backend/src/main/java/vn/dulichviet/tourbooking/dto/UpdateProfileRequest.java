package vn.dulichviet.tourbooking.dto;

public record UpdateProfileRequest(
        String fullName,
        String phone,
        String address,
        String email) {
}
