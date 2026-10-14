package vn.dulichviet.tourbooking.service;

import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import vn.dulichviet.tourbooking.entity.OrderDetail;
import vn.dulichviet.tourbooking.entity.TourOrder;

import java.text.NumberFormat;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

/**
 * Service xử lý gửi email thông báo bất đồng bộ (@Async)
 * Tối ưu hóa hiệu năng để quy trình đặt tour và đăng ký tài khoản
 * phản hồi ngay lập tức cho người dùng mà không bị chờ đợi máy chủ SMTP.
 */
@Service
public class EmailService {
    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String fromEmail;

    /**
     * Gửi email xác nhận đặt tour thành công cho khách hàng
     */
    @Async
    public void sendOrderConfirmation(TourOrder order) {
        String recipient = order.getContactEmail();
        if (recipient == null || recipient.isBlank()) {
            return;
        }

        try {
            NumberFormat currencyFormat = NumberFormat.getCurrencyInstance(new Locale("vi", "VN"));
            String formattedDate = order.getOrderDate() != null
                    ? order.getOrderDate().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"))
                    : "";

            StringBuilder itemsHtml = new StringBuilder();
            for (OrderDetail d : order.getDetails()) {
                String tourName = d.getTour() != null ? d.getTour().getName() : "Tour Du Lịch";
                String unitPrice = currencyFormat.format(d.getUnitPrice());
                String lineTotal = currencyFormat.format(d.getUnitPrice().multiply(java.math.BigDecimal.valueOf(d.getQuantity())));

                itemsHtml.append(String.format(
                        "<tr>" +
                        "<td style='padding:10px; border-bottom:1px solid #e2e8f0;'>%s</td>" +
                        "<td style='padding:10px; border-bottom:1px solid #e2e8f0; text-align:center;'>%d vé</td>" +
                        "<td style='padding:10px; border-bottom:1px solid #e2e8f0; text-align:right;'>%s</td>" +
                        "<td style='padding:10px; border-bottom:1px solid #e2e8f0; text-align:right; font-weight:bold;'>%s</td>" +
                        "</tr>",
                        tourName, d.getQuantity(), unitPrice, lineTotal
                ));
            }

            String content = "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;'>"
                    + "<div style='background: #0284c7; color: #fff; padding: 24px; text-align: center;'>"
                    + "<h1 style='margin: 0; font-size: 24px;'>DU LỊCH VIỆT</h1>"
                    + "<p style='margin: 6px 0 0; font-size: 15px;'>Xác Nhận Yêu Cầu Đặt Tour Trực Tuyến</p>"
                    + "</div>"
                    + "<div style='padding: 24px; color: #334155; line-height: 1.6;'>"
                    + "<p>Xin chào <strong>" + order.getContactName() + "</strong>,</p>"
                    + "<p>Cảm ơn bạn đã lựa chọn dịch vụ của <strong>Du Lịch Việt</strong>. Yêu cầu đặt tour của bạn đã được ghi nhận trên hệ thống với thông tin chi tiết như sau:</p>"
                    + "<div style='background: #f8fafc; border-left: 4px solid #0284c7; padding: 12px 16px; margin: 16px 0;'>"
                    + "<p style='margin: 4px 0;'><strong>Mã đơn hàng:</strong> #" + order.getId() + "</p>"
                    + "<p style='margin: 4px 0;'><strong>Ngày gửi yêu cầu:</strong> " + formattedDate + "</p>"
                    + "<p style='margin: 4px 0;'><strong>Số điện thoại liên hệ:</strong> " + order.getContactPhone() + "</p>"
                    + "<p style='margin: 4px 0;'><strong>Trạng thái:</strong> <span style='color:#b45309; font-weight:bold;'>Đang chờ xác nhận</span></p>"
                    + "</div>"
                    + "<h3 style='margin: 20px 0 10px; color: #0f172a;'>Danh Sách Tour Đã Chọn:</h3>"
                    + "<table style='width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;'>"
                    + "<thead>"
                    + "<tr style='background: #f1f5f9; color: #475569;'>"
                    + "<th style='padding:10px; text-align:left;'>Tour</th>"
                    + "<th style='padding:10px; text-align:center;'>Số vé</th>"
                    + "<th style='padding:10px; text-align:right;'>Đơn giá</th>"
                    + "<th style='padding:10px; text-align:right;'>Thành tiền</th>"
                    + "</tr>"
                    + "</thead>"
                    + "<tbody>" + itemsHtml + "</tbody>"
                    + "</table>"
                    + "<div style='text-align: right; margin-bottom: 24px;'>"
                    + "<span style='font-size: 16px;'>Tổng thanh toán tạm tính: </span>"
                    + "<span style='font-size: 20px; font-weight: bold; color: #e8400c;'>" + currencyFormat.format(order.getTotalAmount()) + "</span>"
                    + "</div>"
                    + "<p style='font-size: 13px; color: #64748b; background: #fffbeb; border: 1px solid #fef3c7; padding: 12px; border-radius: 6px;'>"
                    + "<strong>Lưu ý:</strong> Chuyên viên tư vấn của chúng tôi sẽ liên hệ qua số điện thoại <strong>" + order.getContactPhone() + "</strong> để xác nhận lịch khởi hành, các dịch vụ đi kèm và hướng dẫn hoàn tất thanh toán."
                    + "</p>"
                    + "<p style='margin-top: 24px;'>Trân trọng,<br><strong>Đội ngũ Du Lịch Việt</strong><br>Hotline: 1900 1234 | Email: hotro@dulichviet.vn</p>"
                    + "</div>"
                    + "</div>";

            if (mailSender != null && fromEmail != null && !fromEmail.isBlank()) {
                MimeMessage message = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
                helper.setFrom(fromEmail);
                helper.setTo(recipient);
                helper.setSubject("Du Lịch Việt - Xác nhận yêu cầu đặt tour #" + order.getId());
                helper.setText(content, true);
                mailSender.send(message);
                log.info("Order confirmation email successfully sent to {}", recipient);
            } else {
                log.info("[SIMULATED EMAIL] Order confirmation sent to {}. Order #{}", recipient, order.getId());
            }
        } catch (Exception e) {
            log.warn("Failed to send order confirmation email to {}: {}", recipient, e.getMessage());
        }
    }

    /**
     * Gửi email chào mừng khi khách hàng đăng ký tài khoản thành công
     */
    @Async
    public void sendWelcomeEmail(String toEmail, String fullName) {
        if (toEmail == null || toEmail.isBlank()) return;

        try {
            String name = (fullName != null && !fullName.isBlank()) ? fullName : "Quý khách";
            String content = "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;'>"
                    + "<div style='background: #0284c7; color: #fff; padding: 24px; text-align: center;'>"
                    + "<h1 style='margin: 0; font-size: 24px;'>DU LỊCH VIỆT</h1>"
                    + "<p style='margin: 6px 0 0; font-size: 15px;'>Chào Mừng Thành Viên Mới</p>"
                    + "</div>"
                    + "<div style='padding: 24px; color: #334155; line-height: 1.6;'>"
                    + "<p>Xin chào <strong>" + name + "</strong>,</p>"
                    + "<p>Chúc mừng bạn đã đăng ký tài khoản thành công tại <strong>Du Lịch Việt</strong>!</p>"
                    + "<p>Bây giờ bạn có thể:</p>"
                    + "<ul>"
                    + "<li>Khám phá hàng trăm tour du lịch hấp dẫn trong và ngoài nước.</li>"
                    + "<li>Đăng ký và giữ chỗ tour trực tuyến nhanh chóng.</li>"
                    + "<li>Theo dõi lịch sử và trạng thái đơn đặt tour 24/7.</li>"
                    + "<li>Lưu các tour yêu thích vào danh sách quan tâm.</li>"
                    + "</ul>"
                    + "<p style='margin-top: 24px;'>Chúc bạn có những chuyến đi tuyệt vời và tràn đầy niềm vui!<br><br>Trân trọng,<br><strong>Du Lịch Việt</strong></p>"
                    + "</div>"
                    + "</div>";

            if (mailSender != null && fromEmail != null && !fromEmail.isBlank()) {
                MimeMessage message = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
                helper.setFrom(fromEmail);
                helper.setTo(toEmail);
                helper.setSubject("Chào mừng bạn gia nhập Du Lịch Việt!");
                helper.setText(content, true);
                mailSender.send(message);
                log.info("Welcome email successfully sent to {}", toEmail);
            } else {
                log.info("[SIMULATED EMAIL] Welcome email sent to {}", toEmail);
            }
        } catch (Exception e) {
            log.warn("Failed to send welcome email to {}: {}", toEmail, e.getMessage());
        }
    }
}
