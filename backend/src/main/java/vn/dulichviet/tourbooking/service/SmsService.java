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

    public boolean isConfigured() {
        return false;
    }

    public boolean sendOtpSms(String phoneNumber, String otpCode) {
        log.warn("SMS OTP provider is not configured; no message was sent");
        return false;
    }
}

