package vn.dulichviet.tourbooking.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ForgotPasswordRequest {
    @NotBlank(message = "Kênh xác thực (channel) không được để trống. Chấp nhận: EMAIL hoặc SMS / PHONE")
    private String channel;

    @NotBlank(message = "Thông tin xác định tài khoản (email hoặc số điện thoại) không được để trống")
    private String identifier;
}

