package vn.dulichviet.tourbooking.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class VerifyOtpRequest {
    @NotBlank(message = "Số điện thoại hoặc thông tin nhận mã không được để trống")
    private String phone;

    @NotBlank(message = "Mã xác thực OTP không được để trống")
    @Pattern(regexp = "^\\d{6}$", message = "Mã xác thực OTP phải gồm 6 chữ số")
    private String otp;
}

