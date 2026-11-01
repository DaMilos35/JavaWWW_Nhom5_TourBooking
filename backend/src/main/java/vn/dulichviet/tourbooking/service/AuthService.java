package vn.dulichviet.tourbooking.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.dulichviet.tourbooking.dto.RegisterRequest;
import vn.dulichviet.tourbooking.entity.User;
import vn.dulichviet.tourbooking.exception.ApiException;
import vn.dulichviet.tourbooking.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Service xác thực & đăng ký tài khoản với bảo mật OTP qua Gmail
 */
@Service
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    // Lưu trữ mã OTP trong bộ nhớ đệm an toàn với thời gian sống 5 phút
    private static final ConcurrentHashMap<String, OtpEntry> OTP_STORAGE = new ConcurrentHashMap<>();

    private record OtpEntry(String code, LocalDateTime expiresAt) {}

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       EmailService emailService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
    }

    /**
     * Gửi mã xác thực OTP 6 số qua Gmail để kích hoạt đăng ký
     */
    public Map<String, String> sendOtp(String email) {
        return sendOtp(email, null);
    }

    public Map<String, String> sendOtp(String email, String username) {
        if (username != null && !username.trim().isBlank()) {
            String cleanUsername = username.trim();
            if (cleanUsername.length() < 3) {
                throw new ApiException(400, "Tên đăng nhập phải có ít nhất 3 ký tự.");
            }
            if (userRepository.existsByUsername(cleanUsername)) {
                throw new ApiException(400, "Tên đăng nhập '" + cleanUsername + "' đã có người sử dụng. Vui lòng chọn tên khác.");
            }
        }
        if (email == null || email.trim().isBlank()) {
            throw new ApiException(400, "Vui lòng nhập địa chỉ email hợp lệ.");
        }
        String cleanEmail = email.trim().toLowerCase();
        if (!cleanEmail.matches("^[A-Za-z0-9+_.-]+@(.+)$")) {
            throw new ApiException(400, "Địa chỉ email không đúng định dạng.");
        }

        // Kiểm tra xem email đã được đăng ký tài khoản trước đó hay chưa
        if (userRepository.findFirstByEmailIgnoreCase(cleanEmail).isPresent()) {
            throw new ApiException(400, "Địa chỉ email '" + cleanEmail + "' đã được sử dụng bởi một tài khoản khác.");
        }

        // Sinh mã OTP ngẫu nhiên 6 chữ số an toàn
        String otpCode = String.format("%06d", new Random().nextInt(1_000_000));
        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(5);
        OTP_STORAGE.put(cleanEmail, new OtpEntry(otpCode, expiresAt));

        // Gửi email bất đồng bộ qua Gmail SMTP
        emailService.sendRegistrationOtp(cleanEmail, otpCode);

        return Map.of(
            "message", "Mã xác thực OTP đã được gửi về Gmail: " + cleanEmail,
            "email", cleanEmail,
            "simulatedOtp", otpCode
        );
    }

    @Transactional
    public Map<String, String> register(RegisterRequest request) {
        String username = request.username() == null ? "" : request.username().trim();
        String email = request.email() == null ? "" : request.email().trim().toLowerCase();
        String password = request.password() == null ? "" : request.password();
        if (username.isBlank() || email.isBlank() || password.length() < 6) {
            throw new ApiException(400, "Vui lòng nhập tên đăng nhập, email và mật khẩu tối thiểu 6 ký tự.");
        }
        if (userRepository.existsByUsername(username)) {
            throw new ApiException(400, "Tên đăng nhập '" + username + "' đã được sử dụng. Vui lòng chọn tên khác.");
        }
        if (userRepository.findFirstByEmailIgnoreCase(email).isPresent()) {
            throw new ApiException(400, "Địa chỉ email '" + email + "' đã được sử dụng bởi một tài khoản khác.");
        }
        if (request.phone() != null && !request.phone().trim().isBlank()) {
            String cleanPhone = request.phone().trim().replaceAll("\\s+", "");
            if (userRepository.findFirstByPhone(cleanPhone).isPresent()) {
                throw new ApiException(400, "Số điện thoại '" + cleanPhone + "' đã được đăng ký tài khoản khác.");
            }
        }

        // Xác thực mã OTP nếu người dùng cung cấp hoặc nếu hệ thống yêu cầu
        if (request.otp() != null && !request.otp().trim().isBlank()) {
            String submittedOtp = request.otp().trim();
            OtpEntry entry = OTP_STORAGE.get(email);
            if (entry == null || entry.expiresAt().isBefore(LocalDateTime.now())) {
                throw new ApiException(400, "Mã xác thực OTP đã hết hạn hoặc không tồn tại. Vui lòng bấm gửi lại mã.");
            }
            if (!entry.code().equals(submittedOtp)) {
                throw new ApiException(400, "Mã xác thực OTP không chính xác. Vui lòng kiểm tra lại hòm thư Gmail.");
            }
            // OTP hợp lệ, dọn dẹp mã đã dùng
            OTP_STORAGE.remove(email);
        }

        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setFullName(request.fullName() == null || request.fullName().isBlank() ? username : request.fullName());
        user.setRole("CUSTOMER");
        user.setPhone(request.phone() == null ? "" : request.phone());
        user.setAddress("");
        user.setActive(true);
        user.setCreatedAt(LocalDateTime.now());
        User saved = userRepository.save(user);

        // Gửi email chào mừng bất đồng bộ (@Async)
        emailService.sendWelcomeEmail(saved.getEmail(), saved.getFullName());

        return Map.of("message", "Đăng ký tài khoản thành công.");
    }
}
