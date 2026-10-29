package vn.dulichviet.tourbooking.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * DTO đăng ký tài khoản khách hàng với validation chuẩn mực và mã xác thực OTP
 */
public record RegisterRequest(
        @NotBlank(message = "Tên đăng nhập không được để trống")
        @Size(min = 3, max = 50, message = "Tên đăng nhập phải từ 3 đến 50 ký tự")
        String username,

        @NotBlank(message = "Email không được để trống")
        @Email(message = "Địa chỉ email không đúng định dạng")
        String email,

        @NotBlank(message = "Mật khẩu không được để trống")
        @Size(min = 6, message = "Mật khẩu phải có ít nhất 6 ký tự")
        String password,

        @NotBlank(message = "Họ và tên không được để trống")
        String fullName,

        String phone,

        String otp) {

    public RegisterRequest(String username, String email, String password, String fullName, String phone) {
        this(username, email, password, fullName, phone, null);
    }
}
