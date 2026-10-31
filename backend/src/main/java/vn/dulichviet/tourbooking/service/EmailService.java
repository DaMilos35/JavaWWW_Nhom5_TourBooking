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

import java.math.BigDecimal;
import java.text.NumberFormat;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

/**
 * Service xử lý gửi email thông báo bất đồng bộ (@Async)
 * Hỗ trợ: Mã xác thực OTP qua Gmail, Xác nhận Đặt trước tour (Pre-order/Deposit),
 * Email Chào mừng thành viên mới và Thông báo Hủy tour/Hoàn tiền minh bạch.
 */
@Service
public class EmailService {
    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String fromEmail;

    /**
     * Gửi mã xác thực OTP đăng ký tài khoản qua Gmail
     */
    @Async
    public void sendRegistrationOtp(String toEmail, String otpCode) {
        if (toEmail == null || toEmail.isBlank()) return;

        try {
            String sender = (fromEmail != null && !fromEmail.isBlank()) ? fromEmail : "hotro@dulichviet.vn";
            String content = "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.06);'>"
                    + "<div style='background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); color: #fff; padding: 28px; text-align: center;'>"
                    + "<h1 style='margin: 0; font-size: 26px; letter-spacing: 1px;'>DU LỊCH VIỆT</h1>"
                    + "<p style='margin: 8px 0 0; font-size: 15px; opacity: 0.95;'>Xác Thực Tài Khoản Người Dùng Mới</p>"
                    + "</div>"
                    + "<div style='padding: 28px; color: #334155; line-height: 1.6; background: #ffffff;'>"
                    + "<p>Xin chào quý khách,</p>"
                    + "<p>Bạn vừa yêu cầu đăng ký tài khoản tại nền tảng <strong>Du Lịch Việt</strong>. Dưới đây là mã xác thực OTP của bạn:</p>"
                    + "<div style='text-align: center; margin: 28px 0;'>"
                    + "<div style='display: inline-block; background: #f0f9ff; border: 2px dashed #0284c7; border-radius: 12px; padding: 16px 36px; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #0284c7; font-family: monospace;'>"
                    + otpCode
                    + "</div>"
                    + "<p style='font-size: 13px; color: #64748b; margin-top: 10px;'>Mã xác thực có hiệu lực trong vòng <strong>5 phút</strong>.</p>"
                    + "</div>"
                    + "<div style='background: #fffbeb; border-left: 4px solid #f59e0b; padding: 12px 16px; border-radius: 6px; font-size: 13px; color: #92400e;'>"
                    + "<strong>Lưu ý bảo mật:</strong> Tuyệt đối không chia sẻ mã này cho bất kỳ ai. Nhân viên Du Lịch Việt không bao giờ yêu cầu cung cấp mã OTP của bạn."
                    + "</div>"
                    + "<p style='margin-top: 28px; font-size: 13px; color: #64748b; border-top: 1px solid #f1f5f9; padding-top: 16px;'>"
                    + "Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email hoặc liên hệ tổng đài: <strong>1900 1234</strong>.<br><br>"
                    + "Trân trọng,<br><strong>Đội ngũ Du Lịch Việt 2026</strong>"
                    + "</p>"
                    + "</div>"
                    + "</div>";

            if (mailSender != null && fromEmail != null && !fromEmail.isBlank()) {
                MimeMessage message = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
                helper.setFrom(sender);
                helper.setTo(toEmail);
                helper.setSubject("[Du Lịch Việt] Mã xác thực OTP đăng ký tài khoản: " + otpCode);
                helper.setText(content, true);
                mailSender.send(message);
                log.info("Registration OTP email successfully dispatched to {}", toEmail);
            } else {
                log.info("[SIMULATED EMAIL] Registration OTP for {}: [{}]", toEmail, otpCode);
            }
        } catch (Exception e) {
            log.warn("Failed to send registration OTP email to {}: {}", toEmail, e.getMessage());
        }
    }

    /**
     * Gửi email xác nhận đặt tour / đặt trước (Pre-order/Deposit) thành công
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

            boolean isDeposit = "DEPOSIT".equalsIgnoreCase(order.getPaymentType());
            String depositText = isDeposit
                    ? "<span style='display:inline-block; background:#fef3c7; color:#b45309; padding:3px 10px; border-radius:6px; font-weight:bold; font-size:12px;'>ĐẶT CỌC TRƯỚC 30%</span>"
                    : "<span style='display:inline-block; background:#dcfce7; color:#15803d; padding:3px 10px; border-radius:6px; font-weight:bold; font-size:12px;'>THANH TOÁN 100%</span>";

            StringBuilder itemsHtml = new StringBuilder();
            for (OrderDetail d : order.getDetails()) {
                String tourName = d.getTour() != null ? d.getTour().getName() : "Tour Du Lịch";
                String unitPrice = currencyFormat.format(d.getUnitPrice());
                String lineTotal = currencyFormat.format(d.getUnitPrice().multiply(java.math.BigDecimal.valueOf(d.getQuantity())));
                String depInfo = (d.getTour() != null && d.getTour().getStartDate() != null)
                        ? " (Khởi hành: " + d.getTour().getStartDate().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")) + ")"
                        : "";

                itemsHtml.append(String.format(
                        "<tr>" +
                        "<td style='padding:12px; border-bottom:1px solid #e2e8f0;'><strong>%s</strong><br><small style='color:#64748b;'>%s</small></td>" +
                        "<td style='padding:12px; border-bottom:1px solid #e2e8f0; text-align:center;'>%d vé</td>" +
                        "<td style='padding:12px; border-bottom:1px solid #e2e8f0; text-align:right;'>%s</td>" +
                        "<td style='padding:12px; border-bottom:1px solid #e2e8f0; text-align:right; font-weight:bold; color:#0284c7;'>%s</td>" +
                        "</tr>",
                        tourName, depInfo, d.getQuantity(), unitPrice, lineTotal
                ));
            }

            StringBuilder paymentSummary = new StringBuilder();
            if (isDeposit) {
                paymentSummary.append("<div style='background:#fffbeb; border:1px solid #fef3c7; border-radius:8px; padding:14px; margin-bottom:16px;'>")
                        .append("<div style='display:flex; justify-content:space-between; margin-bottom:6px;'>")
                        .append("<span>Số tiền đặt cọc đợt 1 (30%):</span>")
                        .append("<strong style='color:#b45309; font-size:16px;'>").append(currencyFormat.format(order.getDepositAmount())).append("</strong>")
                        .append("</div>")
                        .append("<div style='display:flex; justify-content:space-between;'>")
                        .append("<span>Số tiền còn lại đợt 2 (70%):</span>")
                        .append("<strong style='color:#334155;'>").append(currencyFormat.format(order.getRemainingAmount())).append("</strong>")
                        .append("</div>")
                        .append("<p style='margin:8px 0 0; font-size:12px; color:#92400e;'>* Quý khách vui lòng hoàn tất đợt 2 trước ngày khởi hành tối thiểu 7 ngày.</p>")
                        .append("</div>");
            }

            String content = "<div style='font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow:0 4px 12px rgba(0,0,0,0.06);'>"
                    + "<div style='background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); color: #fff; padding: 26px; text-align: center;'>"
                    + "<h1 style='margin: 0; font-size: 26px; letter-spacing: 1px;'>DU LỊCH VIỆT</h1>"
                    + "<p style='margin: 6px 0 0; font-size: 15px; opacity:0.95;'>Xác Nhận Đặt Chỗ Tour Trực Tuyến & E-Ticket</p>"
                    + "</div>"
                    + "<div style='padding: 26px; color: #334155; line-height: 1.6; background:#ffffff;'>"
                    + "<p>Kính gửi <strong>" + order.getContactName() + "</strong>,</p>"
                    + "<p>Yêu cầu đặt tour của Quý khách đã được xác nhận thành công trên hệ thống Du Lịch Việt. Thông tin chi tiết vé điện tử:</p>"
                    + "<div style='background: #f8fafc; border-left: 4px solid #0284c7; padding: 14px 18px; margin: 18px 0; border-radius:4px;'>"
                    + "<p style='margin: 3px 0;'><strong>Mã đơn hàng:</strong> <span style='color:#0284c7; font-weight:bold;'>" + (order.getOrderCode() != null ? order.getOrderCode() : "#" + order.getId()) + "</span></p>"
                    + "<p style='margin: 3px 0;'><strong>Ngày đặt tour:</strong> " + formattedDate + "</p>"
                    + "<p style='margin: 3px 0;'><strong>Hình thức đặt:</strong> " + depositText + "</p>"
                    + "<p style='margin: 3px 0;'><strong>Phương thức thanh toán:</strong> " + order.getPaymentMethod() + "</p>"
                    + "</div>"
                    + "<h3 style='margin: 20px 0 10px; color: #0f172a;'>Danh Sách Hành Trình:</h3>"
                    + "<table style='width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;'>"
                    + "<thead>"
                    + "<tr style='background: #f1f5f9; color: #475569;'>"
                    + "<th style='padding:12px; text-align:left;'>Tour</th>"
                    + "<th style='padding:12px; text-align:center;'>Số vé</th>"
                    + "<th style='padding:12px; text-align:right;'>Đơn giá</th>"
                    + "<th style='padding:12px; text-align:right;'>Thành tiền</th>"
                    + "</tr>"
                    + "</thead>"
                    + "<tbody>" + itemsHtml + "</tbody>"
                    + "</table>"
                    + paymentSummary
                    + "<div style='text-align: right; margin-bottom: 24px; padding-top: 10px; border-top: 2px dashed #e2e8f0;'>"
                    + "<span style='font-size: 15px; color:#64748b;'>Tổng giá trị đơn hàng: </span>"
                    + "<span style='font-size: 22px; font-weight: bold; color: #e8400c; margin-left: 8px;'>" + currencyFormat.format(order.getTotalAmount()) + "</span>"
                    + "</div>"
                    + "<div style='background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 14px; font-size: 13px; color: #166534; margin-bottom: 20px;'>"
                    + "<strong>Quyền lợi bảo hiểm:</strong> Mọi khách hàng đều được bảo hiểm du lịch toàn cầu với mức bồi thường tối đa 120.000.000 VNĐ/người/vụ."
                    + "</div>"
                    + "<p style='font-size: 13px; color: #64748b; line-height: 1.6;'>"
                    + "<strong>Hướng dẫn chuẩn bị:</strong> Quý khách vui lòng mang theo CCCD/Hộ chiếu bản gốc và có mặt tại điểm đón trước 30 phút so với giờ khởi hành.<br>"
                    + "Chuyên viên tư vấn hành trình sẽ liên hệ trước ngày đi để cập nhật số xe và danh bạ hướng dẫn viên dẫn đoàn."
                    + "</p>"
                    + "<p style='margin-top: 24px; font-size: 13px; color: #64748b; border-top: 1px solid #f1f5f9; padding-top: 16px;'>"
                    + "Cần hỗ trợ? Gọi hotline 24/7: <strong>1900 1234</strong> | Email: <strong>hotro@dulichviet.vn</strong><br><br>"
                    + "Trân trọng cảm ơn Quý khách,<br><strong>Công Ty Cổ Phần Lữ Hành Du Lịch Việt</strong>"
                    + "</p>"
                    + "</div>"
                    + "</div>";

            String sender = (fromEmail != null && !fromEmail.isBlank()) ? fromEmail : "hotro@dulichviet.vn";
            if (mailSender != null && fromEmail != null && !fromEmail.isBlank()) {
                MimeMessage message = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
                helper.setFrom(sender);
                helper.setTo(recipient);
                helper.setSubject("Du Lịch Việt - Xác nhận yêu cầu đặt tour #" + order.getId() + (isDeposit ? " (Đặt cọc 30%)" : ""));
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
            String sender = (fromEmail != null && !fromEmail.isBlank()) ? fromEmail : "hotro@dulichviet.vn";
            String content = "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;'>"
                    + "<div style='background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); color: #fff; padding: 26px; text-align: center;'>"
                    + "<h1 style='margin: 0; font-size: 24px;'>DU LỊCH VIỆT</h1>"
                    + "<p style='margin: 6px 0 0; font-size: 15px;'>Chào Mừng Thành Viên Mới</p>"
                    + "</div>"
                    + "<div style='padding: 24px; color: #334155; line-height: 1.6;'>"
                    + "<p>Xin chào <strong>" + name + "</strong>,</p>"
                    + "<p>Chúc mừng bạn đã tạo tài khoản thành công tại <strong>Du Lịch Việt</strong>!</p>"
                    + "<p>Đặc quyền thành viên của bạn:</p>"
                    + "<ul>"
                    + "<li>Tích lũy điểm thưởng khi đặt mọi tour (1 điểm = 1.000 VNĐ).</li>"
                    + "<li>Thăng hạng hội viên nhận chiết khấu trực tiếp lên đến 8%.</li>"
                    + "<li>Ưu tiên giữ chỗ các tour dịp Lễ, Tết và Flash Deal giới hạn.</li>"
                    + "<li>Quản lý vé điện tử E-ticket và lịch sử chuyến đi 24/7.</li>"
                    + "</ul>"
                    + "<p style='margin-top: 24px;'>Chúc bạn có những chuyến đi tuyệt vời và tràn đầy trải nghiệm đáng nhớ!<br><br>Trân trọng,<br><strong>Đội ngũ Du Lịch Việt</strong></p>"
                    + "</div>"
                    + "</div>";

            if (mailSender != null && fromEmail != null && !fromEmail.isBlank()) {
                MimeMessage message = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
                helper.setFrom(sender);
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

    /**
     * Gửi email thông báo hủy tour và xác nhận hoàn tiền minh bạch
     */
    @Async
    public void sendCancellationNotification(TourOrder order, BigDecimal refundAmount, String reason) {
        String recipient = order.getContactEmail();
        if (recipient == null || recipient.isBlank()) return;

        try {
            NumberFormat currencyFormat = NumberFormat.getCurrencyInstance(new Locale("vi", "VN"));
            String sender = (fromEmail != null && !fromEmail.isBlank()) ? fromEmail : "hotro@dulichviet.vn";
            String content = "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #fee2e2; border-radius: 12px; overflow: hidden;'>"
                    + "<div style='background: #dc2626; color: #fff; padding: 24px; text-align: center;'>"
                    + "<h1 style='margin: 0; font-size: 24px;'>DU LỊCH VIỆT</h1>"
                    + "<p style='margin: 6px 0 0; font-size: 15px;'>Thông Báo Xác Nhận Hủy Đơn Đặt Tour</p>"
                    + "</div>"
                    + "<div style='padding: 24px; color: #334155; line-height: 1.6;'>"
                    + "<p>Xin chào <strong>" + order.getContactName() + "</strong>,</p>"
                    + "<p>Chúng tôi xác nhận yêu cầu hủy tour cho đơn hàng <strong>#" + order.getId() + "</strong> của bạn đã được xử lý.</p>"
                    + "<div style='background: #f8fafc; border-left: 4px solid #dc2626; padding: 12px 16px; margin: 16px 0;'>"
                    + "<p style='margin: 4px 0;'><strong>Mã đơn hàng:</strong> #" + order.getId() + "</p>"
                    + "<p style='margin: 4px 0;'><strong>Số tiền hoàn trả:</strong> <strong style='color:#16a34a;'>" + currencyFormat.format(refundAmount) + "</strong></p>"
                    + "<p style='margin: 4px 0;'><strong>Lý do hủy:</strong> " + (reason != null ? reason : "Khách hàng yêu cầu hủy") + "</p>"
                    + "</div>"
                    + "<p>Nếu đơn hàng đã thanh toán, khoản tiền hoàn lại sẽ được chuyển về tài khoản của bạn trong vòng 1-3 ngày làm việc.</p>"
                    + "<p style='margin-top: 24px;'>Trân trọng,<br><strong>Du Lịch Việt</strong><br>Hotline: 1900 1234</p>"
                    + "</div>"
                    + "</div>";

            if (mailSender != null && fromEmail != null && !fromEmail.isBlank()) {
                MimeMessage message = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
                helper.setFrom(sender);
                helper.setTo(recipient);
                helper.setSubject("Du Lịch Việt - Xác nhận hủy đơn đặt tour #" + order.getId());
                helper.setText(content, true);
                mailSender.send(message);
                log.info("Cancellation email sent to {}", recipient);
            } else {
                log.info("[SIMULATED EMAIL] Cancellation notification sent to {}", recipient);
            }
        } catch (Exception e) {
            log.warn("Failed to send cancellation email to {}: {}", recipient, e.getMessage());
        }
    }

    /**
     * Gửi liên kết và mã xác thực đặt lại mật khẩu an toàn qua Email
     */
    @Async
    public void sendPasswordResetEmail(String toEmail, String resetLink, String rawToken) {
        if (toEmail == null || toEmail.isBlank()) return;

        try {
            String sender = (fromEmail != null && !fromEmail.isBlank()) ? fromEmail : "hotro@dulichviet.vn";
            String content = "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.06);'>"
                    + "<div style='background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); color: #fff; padding: 28px; text-align: center;'>"
                    + "<h1 style='margin: 0; font-size: 26px; letter-spacing: 1px;'>DU LỊCH VIỆT</h1>"
                    + "<p style='margin: 8px 0 0; font-size: 15px; opacity: 0.95;'>Yêu Cầu Đặt Lại Mật Khẩu</p>"
                    + "</div>"
                    + "<div style='padding: 28px; color: #334155; line-height: 1.6; background: #ffffff;'>"
                    + "<p>Xin chào quý khách,</p>"
                    + "<p>Hệ thống nhận được yêu cầu đặt lại mật khẩu cho tài khoản liên kết với địa chỉ email này. Để tiến hành đặt mật khẩu mới, bạn vui lòng nhấn vào nút bên dưới:</p>"
                    + "<div style='text-align: center; margin: 28px 0;'>"
                    + "<a href='" + resetLink + "' style='display: inline-block; background: #0284c7; color: #ffffff; text-decoration: none; font-weight: bold; padding: 14px 32px; border-radius: 8px; font-size: 16px; box-shadow: 0 2px 6px rgba(2,132,199,0.3);'>Đặt Lại Mật Khẩu Ngay</a>"
                    + "<p style='font-size: 13px; color: #64748b; margin-top: 14px;'>Hoặc sử dụng mã Reset Token này: <strong style='font-family:monospace; color:#0284c7;'>" + rawToken + "</strong></p>"
                    + "<p style='font-size: 13px; color: #64748b; margin-top: 6px;'>Liên kết có hiệu lực trong vòng <strong>15 phút</strong> và chỉ sử dụng được 01 lần duy nhất.</p>"
                    + "</div>"
                    + "<div style='background: #fffbeb; border-left: 4px solid #f59e0b; padding: 12px 16px; border-radius: 6px; font-size: 13px; color: #92400e;'>"
                    + "<strong>Cảnh báo bảo mật:</strong> Nếu bạn không yêu cầu đổi mật khẩu, vui lòng bỏ qua email này hoặc liên hệ hotline 1900 1234 ngay lập tức để bảo vệ tài khoản."
                    + "</div>"
                    + "<p style='margin-top: 28px; font-size: 13px; color: #64748b; border-top: 1px solid #f1f5f9; padding-top: 16px;'>"
                    + "Trân trọng,<br><strong>Đội ngũ Du Lịch Việt Security Team</strong>"
                    + "</p>"
                    + "</div>"
                    + "</div>";

            if (mailSender != null && fromEmail != null && !fromEmail.isBlank()) {
                MimeMessage message = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
                helper.setFrom(sender);
                helper.setTo(toEmail);
                helper.setSubject("[Du Lịch Việt] Hướng dẫn đặt lại mật khẩu tài khoản");
                helper.setText(content, true);
                mailSender.send(message);
                log.info("Password reset email sent to {}", toEmail);
            } else {
                log.info("[SIMULATED EMAIL] Password reset email for {}: Link = [{}], Token = [{}]", toEmail, resetLink, rawToken);
            }
        } catch (Exception e) {
            log.warn("Failed to send password reset email to {}: {}", toEmail, e.getMessage());
        }
    }
}
