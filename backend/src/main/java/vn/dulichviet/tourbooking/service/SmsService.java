package vn.dulichviet.tourbooking.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

/**
 * Service tích hợp SMS Gateway gửi tin nhắn OTP qua mạng viễn thông.
 * Trong môi trường Dev / Demo, giả lập gửi SMS và ghi log an toàn.
 * Có thể mở rộng tích hợp API nhà cung cấp thực tế (eSMS, SpeedSMS, Twilio, AWS SNS).
 */
@Service
public class SmsService {
    private static final Logger log = LoggerFactory.getLogger(SmsService.class);

    public boolean sendOtpSms(String phoneNumber, String otpCode) {
        log.info("[SMS GATEWAY] Đang gửi mã OTP đến số điện thoại [{}]: Mã OTP = [{}] (Hiệu lực: 5 phút)", 
                maskPhoneNumber(phoneNumber), otpCode);

        // Mô phỏng kết nối SMS Gateway thành công
        // Nếu tích hợp thực tế: gọi HTTP REST API của eSMS / Twilio
        return true;
    }

    private String maskPhoneNumber(String phone) {
        if (phone == null || phone.length() < 6) return "****";
        return phone.substring(0, 3) + "****" + phone.substring(phone.length() - 3);
    }
}

