/**
 * ==============================================================================
 * DU LỊCH VIỆT - KÊNH CHUYỂN TIẾP EMAIL TRUNG GIAN (ZERO-PASSWORD EMAIL RELAY)
 * ==============================================================================
 * HƯỚNG DẪN TRIỂN KHAI TRONG 60 GIÂY (HOÀN TOÀN MIỄN PHÍ - KHÔNG CẦN PASSWORD EMAIL):
 *
 * 1. Truy cập https://script.google.com và đăng nhập bằng tài khoản Google của bạn.
 * 2. Nhấn "Dự án mới" (New project), xóa mã cũ và dán toàn bộ đoạn mã bên dưới vào.
 * 3. Nhấn "Triển khai" (Deploy) -> "Tùy chọn triển khai mới" (New deployment).
 * 4. Nhấn biểu tượng bánh răng ⚙️ bên cạnh "Chọn loại", chọn "Ứng dụng web" (Web app).
 * 5. Cấu hình triển khai:
 *    - Mô tả: Du Lich Viet Email Relay
 *    - Thực thi dưới dạng (Execute as): Tôi (tài khoản của bạn)
 *    - Ai có quyền truy cập (Who has access): Bất kỳ ai (Anyone)
 * 6. Nhấn "Triển khai" (Deploy), cấp quyền gửi thư (Authorize) cho dự án.
 * 7. Sao chép "URL ứng dụng web" (Web App URL) dạng:
 *    https://script.google.com/macros/s/AKfycb.../exec
 * 8. Dán URL này vào:
 *    - Hoặc biến môi trường backend: EMAIL_RELAY_URL=https://script.google.com/macros/s/.../exec
 *    - Hoặc file backend/src/main/resources/application.properties: app.email.relay-url=https://script.google.com/...
 *    - Hoặc dán trực tiếp trên giao diện trang Quên Mật Khẩu (Trình cấu hình Webhook Relay).
 * ==============================================================================
 */

function doPost(e) {
  try {
    var raw = e.postData ? e.postData.contents : "";
    var data = {};
    if (raw) {
      try {
        data = JSON.parse(raw);
      } catch (err) {
        data = e.parameter || {};
      }
    } else {
      data = e.parameter || {};
    }

    var to = data.to || data.email || data.recipient;
    var subject = data.subject || "[Du Lịch Việt] Thông Báo Hệ Thống";
    var htmlBody = data.htmlBody || data.html || data.message || "";
    var resetLink = data.resetLink || "";

    if (!to) {
      return ContentService.createTextOutput(JSON.stringify({
        status: "error",
        message: "Thiếu trường 'to' (địa chỉ email người nhận)"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // Nếu chỉ có resetLink mà chưa có htmlBody đầy đủ
    if (!htmlBody && resetLink) {
      htmlBody = "<div style='font-family: Arial, sans-serif; padding: 20px;'>"
        + "<h2>DU LỊCH VIỆT</h2>"
        + "<p>Yêu cầu đặt lại mật khẩu cho tài khoản của bạn:</p>"
        + "<p><a href='" + resetLink + "' style='background:#0284c7;color:#fff;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:bold;'>Đặt Lại Mật Khẩu Ngay</a></p>"
        + "</div>";
    }

    // Gửi email bằng MailApp của Google - HOÀN TOÀN KHÔNG CẦN PASSWORD!
    MailApp.sendEmail({
      to: to,
      subject: subject,
      htmlBody: htmlBody
    });

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      recipient: to,
      timestamp: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "online",
    service: "Du Lich Viet Email Relay",
    version: "2.0"
  })).setMimeType(ContentService.MimeType.JSON);
}

