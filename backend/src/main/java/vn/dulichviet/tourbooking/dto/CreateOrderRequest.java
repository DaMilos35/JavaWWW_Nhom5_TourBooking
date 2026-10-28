package vn.dulichviet.tourbooking.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;

/**
 * DTO yêu cầu đặt tour với đầy đủ validation và hỗ trợ Đặt Cọc (DEPOSIT) & Điểm Thưởng Hội Viên
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public record CreateOrderRequest(
        @NotBlank(message = "Họ và tên người liên hệ không được để trống")
        String contactName,

        @NotBlank(message = "Số điện thoại liên hệ không được để trống")
        String contactPhone,

        @NotBlank(message = "Email liên hệ không được để trống")
        @Email(message = "Địa chỉ email không đúng định dạng")
        String contactEmail,

        String notes,
        Boolean isB2b,
        String companyName,
        String taxId,
        String paymentMethod,
        String paymentType,       // "FULL" (mặc định) hoặc "DEPOSIT"
        Integer depositPercent,   // Tỷ lệ cọc (VD: 30)
        Integer pointsUsed,       // Số điểm thưởng quy đổi giảm tiền

        @NotEmpty(message = "Đơn hàng phải chứa ít nhất 1 tour du lịch")
        @Valid
        List<Item> items) {

    public CreateOrderRequest(String contactName, String contactPhone, String contactEmail, String notes, List<Item> items) {
        this(contactName, contactPhone, contactEmail, notes, false, null, null, "CASH", "FULL", 0, 0, items);
    }

    public CreateOrderRequest(String contactName, String contactPhone, String contactEmail, String notes, Boolean isB2b, String companyName, String taxId, List<Item> items) {
        this(contactName, contactPhone, contactEmail, notes, isB2b, companyName, taxId, "CASH", "FULL", 0, 0, items);
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Item(
            @NotNull(message = "Mã tour không được để trống")
            Integer tourId,

            @NotNull(message = "Số lượng vé không được để trống")
            Integer quantity) {
    }
}
