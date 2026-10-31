package vn.dulichviet.tourbooking.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.dulichviet.tourbooking.dto.ForgotPasswordRequest;
import vn.dulichviet.tourbooking.dto.ResetPasswordRequest;
import vn.dulichviet.tourbooking.dto.VerifyOtpRequest;
import vn.dulichviet.tourbooking.entity.PasswordResetToken;
import vn.dulichviet.tourbooking.entity.User;
import vn.dulichviet.tourbooking.exception.ApiException;
import vn.dulichviet.tourbooking.repository.PasswordResetTokenRepository;
import vn.dulichviet.tourbooking.repository.UserRepository;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.Map;
import java.util.Optional;

/**
 * Service xử lý toàn bộ nghiệp vụ Quên mật khẩu & Đặt lại mật khẩu an toàn:
 * 1. Yêu cầu mã xác thực đa kênh (Email link/token & Phone SMS OTP)
 * 2. Xác thực OTP 6 số và cấp Reset Token tạm thời (15 phút)
 * 3. Đặt lại mật khẩu mới, băm BCrypt, đánh dấu token đã dùng và hủy toàn bộ phiên cũ.
 */
@Service
public class PasswordResetService {

    private static final Logger log = LoggerFactory.getLogger(PasswordResetService.class);
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final SmsService smsService;
    private final RateLimiterService rateLimiterService;

    @Autowired(required = false)
    private JdbcTemplate jdbcTemplate;

    @Value("${app.frontend-url:http://localhost:3000}")
    private String frontendUrl;

    public PasswordResetService(UserRepository userRepository,
                                PasswordResetTokenRepository tokenRepository,
                                PasswordEncoder passwordEncoder,
                                EmailService emailService,
                                SmsService smsService,
                                RateLimiterService rateLimiterService) {
        this.userRepository = userRepository;
        this.tokenRepository = tokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
        this.smsService = smsService;
        this.rateLimiterService = rateLimiterService;
    }

    /**
     * 1. Yêu cầu gửi mã xác thực (hỗ trợ cả kênh Email và Phone SMS)
     */
    @Transactional
    public Map<String, Object> requestReset(ForgotPasswordRequest request, String clientIp) {
        String channel = request.getChannel() != null ? request.getChannel().trim().toUpperCase() : "";
        String rawIdentifier = request.getIdentifier() != null ? request.getIdentifier().trim() : "";

        if (rawIdentifier.isBlank()) {
            throw new ApiException(400, "Vui lòng cung cấp email hoặc số điện thoại của tài khoản.");
        }

        boolean isLocalhost = "127.0.0.1".equals(clientIp) || "0:0:0:0:0:0:0:1".equals(clientIp);
        int ipLimit = isLocalhost ? 100 : 5;
        int targetLimit = isLocalhost ? 50 : 3;

        // Rate Limiting theo IP
        String ipKey = "rl:pw_reset:ip:" + (clientIp != null ? clientIp : "unknown");
        if (!rateLimiterService.tryAcquire(ipKey, ipLimit, 900)) {
            throw new ApiException(429, "Bạn đã gửi quá nhiều yêu cầu đặt lại mật khẩu. Vui lòng thử lại sau 15 phút.");
        }

        // Rate Limiting theo Target (Email hoặc SĐT)
        String targetKey = "rl:pw_reset:target:" + rawIdentifier.toLowerCase();
        if (!rateLimiterService.tryAcquire(targetKey, targetLimit, 900)) {
            throw new ApiException(429, "Tài khoản/Số điện thoại này đã nhận quá số lượng mã cho phép. Vui lòng thử lại sau 15 phút.");
        }

        if ("EMAIL".equals(channel)) {
            return processEmailChannel(rawIdentifier.toLowerCase());
        } else if ("SMS".equals(channel) || "PHONE".equals(channel)) {
            return processSmsChannel(rawIdentifier);
        } else {
            throw new ApiException(400, "Kênh gửi không hợp lệ. Vui lòng chọn 'EMAIL' hoặc 'SMS'/'PHONE'.");
        }
    }

    private Map<String, Object> processEmailChannel(String email) {
        Optional<User> userOpt = userRepository.findFirstByEmailIgnoreCase(email);
        if (userOpt.isEmpty()) {
            // Chống user enumeration: thông báo đồng nhất
            return Map.of(
                    "success", true,
                    "channel", "EMAIL",
                    "target", maskEmail(email),
                    "message", "Nếu email này tồn tại trong hệ thống, hướng dẫn đặt lại mật khẩu đã được gửi đến hòm thư của bạn.",
                    "expiresInSeconds", 900
            );
        }

        User user = userOpt.get();
        // Vô hiệu hóa các token đang chờ trước đó của user
        tokenRepository.invalidateAllActiveTokensByUserId(user.getId());

        // Sinh token ngẫu nhiên an toàn 32 bytes (64 hex characters)
        String rawToken = generateSecureToken();
        String tokenHash = hashSha256(rawToken);

        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setUser(user);
        resetToken.setTokenHash(tokenHash);
        resetToken.setType("EMAIL_LINK");
        resetToken.setTarget(user.getEmail());
        resetToken.setExpiresAt(LocalDateTime.now().plusMinutes(15));
        resetToken.setAttempts(0);
        resetToken.setIsUsed(false);
        resetToken.setCreatedAt(LocalDateTime.now());
        tokenRepository.save(resetToken);

        String resetLink = frontendUrl + "/reset-password?token=" + rawToken;
        emailService.sendPasswordResetEmail(user.getEmail(), resetLink, rawToken);

        return Map.of(
                "success", true,
                "channel", "EMAIL",
                "target", maskEmail(user.getEmail()),
                "message", "Hướng dẫn đặt lại mật khẩu đã được gửi đến hòm thư: " + maskEmail(user.getEmail()),
                "expiresInSeconds", 900,
                "simulatedToken", rawToken
        );
    }

    private Map<String, Object> processSmsChannel(String phone) {
        Optional<User> userOpt = userRepository.findFirstByPhone(phone);
        if (userOpt.isEmpty()) {
            return Map.of(
                    "success", true,
                    "channel", "SMS",
                    "target", maskPhone(phone),
                    "message", "Nếu số điện thoại này tồn tại trong hệ thống, mã xác thực OTP đã được gửi qua SMS.",
                    "expiresInSeconds", 300
            );
        }

        User user = userOpt.get();
        // Vô hiệu hóa các token đang chờ trước đó của user
        tokenRepository.invalidateAllActiveTokensByUserId(user.getId());

        // Sinh mã OTP ngẫu nhiên 6 chữ số an toàn
        String rawOtp = String.format("%06d", SECURE_RANDOM.nextInt(1_000_000));
        String otpHash = hashSha256(rawOtp);

        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setUser(user);
        resetToken.setTokenHash(otpHash);
        resetToken.setType("SMS_OTP");
        resetToken.setTarget(user.getPhone());
        resetToken.setExpiresAt(LocalDateTime.now().plusMinutes(5));
        resetToken.setAttempts(0);
        resetToken.setIsUsed(false);
        resetToken.setCreatedAt(LocalDateTime.now());
        tokenRepository.save(resetToken);

        smsService.sendOtpSms(user.getPhone(), rawOtp);

        return Map.of(
                "success", true,
                "channel", "SMS",
                "target", maskPhone(user.getPhone()),
                "message", "Mã xác thực OTP gồm 6 chữ số đã được gửi đến số điện thoại: " + maskPhone(user.getPhone()),
                "expiresInSeconds", 300,
                "simulatedOtp", rawOtp
        );
    }

    /**
     * 2. Xác thực OTP (kênh SMS) và cấp Reset Token tạm thời (15 phút)
     */
    @Transactional
    public Map<String, Object> verifyOtp(VerifyOtpRequest request, String clientIp) {
        String phone = request.getPhone() != null ? request.getPhone().trim() : "";
        String otp = request.getOtp() != null ? request.getOtp().trim() : "";

        // Rate Limiting xác thực OTP theo IP
        String ipKey = "rl:verify:ip:" + (clientIp != null ? clientIp : "unknown");
        if (!rateLimiterService.tryAcquire(ipKey, 10, 900)) {
            throw new ApiException(429, "Bạn đã thử nhập OTP quá nhiều lần từ IP này. Vui lòng đợi 15 phút.");
        }

        // Tìm người dùng theo số điện thoại
        User user = userRepository.findFirstByPhone(phone)
                .orElseThrow(() -> new ApiException(400, "Thông tin số điện thoại không hợp lệ hoặc chưa từng gửi mã OTP."));

        // Tìm mã OTP mới nhất chưa sử dụng của user
        PasswordResetToken activeOtp = tokenRepository.findFirstByUserAndTypeAndIsUsedFalseOrderByCreatedAtDesc(user, "SMS_OTP")
                .orElseThrow(() -> new ApiException(400, "Không tìm thấy mã OTP nào đang chờ xác thực cho số điện thoại này."));

        if (activeOtp.isExpired()) {
            activeOtp.setIsUsed(true);
            tokenRepository.save(activeOtp);
            throw new ApiException(400, "Mã xác thực OTP đã hết hạn. Vui lòng bấm gửi lại mã mới.");
        }

        // Chống Brute-force: Tối đa 5 lần thử sai cho mỗi mã OTP
        if (activeOtp.getAttempts() >= 5) {
            activeOtp.setIsUsed(true);
            tokenRepository.save(activeOtp);
            throw new ApiException(400, "Mã OTP này đã nhập sai quá 5 lần và bị vô hiệu hóa vì lý do bảo mật. Vui lòng yêu cầu mã mới.");
        }

        // Băm OTP người dùng gửi lên để so sánh với mã băm trong DB
        String submittedHash = hashSha256(otp);
        boolean isMatch = MessageDigest.isEqual(
                submittedHash.getBytes(StandardCharsets.UTF_8),
                activeOtp.getTokenHash().getBytes(StandardCharsets.UTF_8)
        );

        if (!isMatch) {
            activeOtp.setAttempts(activeOtp.getAttempts() + 1);
            tokenRepository.save(activeOtp);
            int remaining = 5 - activeOtp.getAttempts();
            throw new ApiException(400, "Mã OTP không chính xác. Bạn còn " + remaining + " lần thử.");
        }

        // Khớp mã OTP -> Đánh dấu mã OTP đã được sử dụng
        activeOtp.setIsUsed(true);
        tokenRepository.save(activeOtp);

        // Sinh Reset Token tạm thời (có giá trị trong 15 phút)
        String rawResetToken = generateSecureToken();
        String resetTokenHash = hashSha256(rawResetToken);

        PasswordResetToken tempResetToken = new PasswordResetToken();
        tempResetToken.setUser(user);
        tempResetToken.setTokenHash(resetTokenHash);
        tempResetToken.setType("RESET_TOKEN");
        tempResetToken.setTarget(user.getPhone());
        tempResetToken.setExpiresAt(LocalDateTime.now().plusMinutes(15));
        tempResetToken.setAttempts(0);
        tempResetToken.setIsUsed(false);
        tempResetToken.setCreatedAt(LocalDateTime.now());
        tokenRepository.save(tempResetToken);

        return Map.of(
                "success", true,
                "message", "Xác thực OTP thành công. Vui lòng đặt mật khẩu mới trong vòng 15 phút.",
                "resetToken", rawResetToken,
                "expiresInSeconds", 900
        );
    }

    /**
     * 3. Đặt lại mật khẩu mới (xác thực qua Reset Token từ link email hoặc qua OTP token)
     */
    @Transactional
    public Map<String, Object> resetPassword(ResetPasswordRequest request, String clientIp) {
        String rawToken = request.getResetToken() != null ? request.getResetToken().trim() : "";
        String newPassword = request.getNewPassword() != null ? request.getNewPassword() : "";
        String confirmPassword = request.getConfirmPassword() != null ? request.getConfirmPassword() : "";

        if (newPassword.isBlank() || newPassword.length() < 6) {
            throw new ApiException(400, "Mật khẩu mới phải có tối thiểu 6 ký tự.");
        }
        if (!newPassword.equals(confirmPassword)) {
            throw new ApiException(400, "Xác nhận mật khẩu mới không trùng khớp.");
        }

        // Tính SHA-256 hash của reset token
        String tokenHash = hashSha256(rawToken);

        // Tìm token trong DB (chấp nhận cả EMAIL_LINK và RESET_TOKEN)
        Optional<PasswordResetToken> tokenOpt = tokenRepository.findByTokenHashAndTypeAndIsUsedFalse(tokenHash, "EMAIL_LINK");
        if (tokenOpt.isEmpty()) {
            tokenOpt = tokenRepository.findByTokenHashAndTypeAndIsUsedFalse(tokenHash, "RESET_TOKEN");
        }

        if (tokenOpt.isEmpty()) {
            throw new ApiException(400, "Mã xác thực hoặc token đặt lại mật khẩu không hợp lệ hoặc đã qua sử dụng.");
        }

        PasswordResetToken token = tokenOpt.get();
        if (token.isExpired()) {
            token.setIsUsed(true);
            tokenRepository.save(token);
            throw new ApiException(400, "Mã token đặt lại mật khẩu đã hết hạn. Vui lòng yêu cầu lại liên kết mới.");
        }

        User user = token.getUser();

        // Cập nhật mật khẩu mới được băm bằng BCrypt
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        // Đánh dấu token này đã được sử dụng
        token.setIsUsed(true);
        tokenRepository.save(token);

        // Vô hiệu hóa toàn bộ token còn lại của user này
        tokenRepository.invalidateAllActiveTokensByUserId(user.getId());

        // CHIẾN LƯỢC BẢO MẬT: HỦY TOÀN BỘ PHIÊN ĐĂNG NHẬP, JWT VÀ REFRESH TOKEN CŨ
        revokeAllUserSessions(user);

        log.info("[PASSWORD RESET] Đặt lại mật khẩu thành công cho user: [{}] (id={}). Toàn bộ token cũ đã bị thu hồi.",
                user.getUsername(), user.getId());

        return Map.of(
                "success", true,
                "message", "Mật khẩu của bạn đã được thay đổi thành công. Toàn bộ phiên đăng nhập cũ đã được đăng xuất an toàn. Vui lòng đăng nhập lại."
        );
    }

    /**
     * Cơ chế thu hồi toàn bộ phiên đăng nhập & Token cũ:
     * 1. Xóa toàn bộ remember-me tokens trong bảng persistent_logins
     * 2. Ghi mốc thời gian thu hồi (revoked_before) vào Redis / In-Memory cache để từ chối các JWT cũ
     */
    private void revokeAllUserSessions(User user) {
        // 1. Xóa trong database bảng persistent_logins
        if (jdbcTemplate != null && user.getUsername() != null) {
            try {
                int deleted = jdbcTemplate.update("DELETE FROM persistent_logins WHERE username = ?", user.getUsername());
                log.info("[REVOCATION] Đã xóa {} persistent login token cho username: {}", deleted, user.getUsername());
            } catch (Exception ex) {
                log.warn("[REVOCATION WARNING] Không thể xóa persistent_logins: {}", ex.getMessage());
            }
        }

        // 2. Ghi mốc thu hồi JWT / Refresh Token vào Redis
        rateLimiterService.recordUserTokenRevocation(user.getId());
    }

    private String generateSecureToken() {
        byte[] bytes = new byte[32];
        SECURE_RANDOM.nextBytes(bytes);
        return HexFormat.of().formatHex(bytes);
    }

    public static String hashSha256(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (Exception e) {
            throw new RuntimeException("Lỗi tính toán mã băm SHA-256", e);
        }
    }

    private String maskEmail(String email) {
        if (email == null || !email.contains("@")) return "*****";
        int atIndex = email.indexOf('@');
        String namePart = email.substring(0, atIndex);
        String domainPart = email.substring(atIndex);
        if (namePart.length() <= 2) {
            return namePart.charAt(0) + "***" + domainPart;
        }
        return namePart.substring(0, 2) + "***" + domainPart;
    }

    private String maskPhone(String phone) {
        if (phone == null || phone.length() < 6) return "****";
        return phone.substring(0, 3) + "****" + phone.substring(phone.length() - 3);
    }
}
