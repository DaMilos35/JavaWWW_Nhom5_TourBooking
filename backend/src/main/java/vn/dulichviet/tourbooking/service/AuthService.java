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

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       EmailService emailService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
    }

    @Transactional
    public Map<String, String> register(RegisterRequest request) {
        String username = request.username() == null ? "" : request.username().trim();
        String email = request.email() == null ? "" : request.email().trim();
        String password = request.password() == null ? "" : request.password();
        if (username.isBlank() || email.isBlank() || password.length() < 6) {
            throw new ApiException(400, "Vui lòng nhập tên đăng nhập, email và mật khẩu tối thiểu 6 ký tự.");
        }
        if (userRepository.existsByUsernameOrEmailIgnoreCase(username, email)) {
            throw new ApiException(400, "Tên đăng nhập hoặc email đã tồn tại.");
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
