package vn.dulichviet.tourbooking.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;

/**
 * DTO yêu cầu đặt tour với đầy đủ validation theo chuẩn Jakarta Bean Validation
 */
public record CreateOrderRequest(
        @NotBlank(message = "Họ và tên người liên hệ không được để trống")
        String contactName,

        @NotBlank(message = "Số điện thoại liên hệ không được để trống")
        String contactPhone,

        @NotBlank(message = "Email liên hệ không được để trống")
        @Email(message = "Địa chỉ email không đúng định dạng")
        String contactEmail,

        String notes,

        @NotEmpty(message = "Đơn hàng phải chứa ít nhất 1 tour du lịch")
        @Valid
        List<Item> items) {

    public record Item(
            @NotNull(message = "Mã tour không được để trống")
            Integer tourId,

            @NotNull(message = "Số lượng vé không được để trống")
            @Min(value = 1, message = "Số lượng vé đăng ký phải từ 1 người trở lên")
            Integer quantity) {
    }
}
