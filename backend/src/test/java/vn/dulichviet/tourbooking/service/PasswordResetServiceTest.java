package vn.dulichviet.tourbooking.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import vn.dulichviet.tourbooking.dto.ForgotPasswordRequest;
import vn.dulichviet.tourbooking.dto.ResetPasswordRequest;
import vn.dulichviet.tourbooking.dto.VerifyOtpRequest;
import vn.dulichviet.tourbooking.entity.PasswordResetToken;
import vn.dulichviet.tourbooking.entity.User;
import vn.dulichviet.tourbooking.exception.ApiException;
import vn.dulichviet.tourbooking.repository.PasswordResetTokenRepository;
import vn.dulichviet.tourbooking.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PasswordResetServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordResetTokenRepository tokenRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private EmailService emailService;

    @Mock
    private SmsService smsService;

    @Mock
    private RateLimiterService rateLimiterService;

    @InjectMocks
    private PasswordResetService passwordResetService;

    private User sampleUser;

    @BeforeEach
    void setUp() {
        sampleUser = new User();
        sampleUser.setId(1);
        sampleUser.setUsername("testuser");
        sampleUser.setEmail("customer@dulichviet.vn");
        sampleUser.setPhone("0901234567");
        sampleUser.setPassword("$2a$10$oldPasswordHash");
    }

    @Test
    @DisplayName("1. Yêu cầu mã xác thực qua Email thành công")
    void testRequestReset_EmailSuccess() {
        when(rateLimiterService.tryAcquire(anyString(), anyInt(), anyLong())).thenReturn(true);
        when(userRepository.findFirstByEmailIgnoreCase("customer@dulichviet.vn")).thenReturn(Optional.of(sampleUser));

        ForgotPasswordRequest request = new ForgotPasswordRequest("EMAIL", "customer@dulichviet.vn");
        Map<String, Object> response = passwordResetService.requestReset(request, "127.0.0.1");

        assertNotNull(response);
        assertEquals(true, response.get("success"));
        assertEquals("EMAIL", response.get("channel"));
        assertNotNull(response.get("simulatedToken"));

        // Kiểm tra lưu token với SHA-256 hash
        ArgumentCaptor<PasswordResetToken> tokenCaptor = ArgumentCaptor.forClass(PasswordResetToken.class);
        verify(tokenRepository).save(tokenCaptor.capture());
        PasswordResetToken savedToken = tokenCaptor.getValue();

        assertEquals("EMAIL_LINK", savedToken.getType());
        assertEquals(sampleUser, savedToken.getUser());
        assertEquals(64, savedToken.getTokenHash().length()); // SHA-256 hex length
        assertFalse(savedToken.getIsUsed());
        assertTrue(savedToken.getExpiresAt().isAfter(LocalDateTime.now()));

        verify(emailService).sendPasswordResetEmail(eq("customer@dulichviet.vn"), anyString(), anyString());
    }

    @Test
    @DisplayName("2. Yêu cầu mã xác thực qua SMS OTP thành công")
    void testRequestReset_SmsSuccess() {
        when(rateLimiterService.tryAcquire(anyString(), anyInt(), anyLong())).thenReturn(true);
        when(userRepository.findFirstByPhone("0901234567")).thenReturn(Optional.of(sampleUser));

        ForgotPasswordRequest request = new ForgotPasswordRequest("SMS", "0901234567");
        Map<String, Object> response = passwordResetService.requestReset(request, "127.0.0.1");

        assertNotNull(response);
        assertEquals(true, response.get("success"));
        assertEquals("SMS", response.get("channel"));
        assertNotNull(response.get("simulatedOtp"));

        ArgumentCaptor<PasswordResetToken> tokenCaptor = ArgumentCaptor.forClass(PasswordResetToken.class);
        verify(tokenRepository).save(tokenCaptor.capture());
        PasswordResetToken savedToken = tokenCaptor.getValue();

        assertEquals("SMS_OTP", savedToken.getType());
        assertEquals(64, savedToken.getTokenHash().length());
        assertFalse(savedToken.getIsUsed());

        verify(smsService).sendOtpSms(eq("0901234567"), anyString());
    }

    @Test
    @DisplayName("3. Rate Limit vượt quá mức cho phép phải trả về lỗi 429")
    void testRequestReset_RateLimitExceeded() {
        when(rateLimiterService.tryAcquire(startsWith("rl:pw_reset:ip:"), anyInt(), anyLong())).thenReturn(false);

        ForgotPasswordRequest request = new ForgotPasswordRequest("EMAIL", "spammer@gmail.com");
        ApiException ex = assertThrows(ApiException.class, () ->
                passwordResetService.requestReset(request, "192.168.1.100")
        );

        assertEquals(429, ex.getStatus());
        assertTrue(ex.getMessage().contains("quá nhiều yêu cầu"));
    }

    @Test
    @DisplayName("4. Xác thực OTP thành công và cấp Reset Token tạm thời")
    void testVerifyOtp_Success() {
        when(rateLimiterService.tryAcquire(anyString(), anyInt(), anyLong())).thenReturn(true);
        when(userRepository.findFirstByPhone("0901234567")).thenReturn(Optional.of(sampleUser));

        String rawOtp = "123456";
        String otpHash = PasswordResetService.hashSha256(rawOtp);

        PasswordResetToken existingOtpToken = new PasswordResetToken();
        existingOtpToken.setId(10L);
        existingOtpToken.setUser(sampleUser);
        existingOtpToken.setTokenHash(otpHash);
        existingOtpToken.setType("SMS_OTP");
        existingOtpToken.setExpiresAt(LocalDateTime.now().plusMinutes(5));
        existingOtpToken.setAttempts(0);
        existingOtpToken.setIsUsed(false);

        when(tokenRepository.findFirstByUserAndTypeAndIsUsedFalseOrderByCreatedAtDesc(sampleUser, "SMS_OTP"))
                .thenReturn(Optional.of(existingOtpToken));

        VerifyOtpRequest request = new VerifyOtpRequest("0901234567", "123456");
        Map<String, Object> response = passwordResetService.verifyOtp(request, "127.0.0.1");

        assertNotNull(response);
        assertEquals(true, response.get("success"));
        assertNotNull(response.get("resetToken"));
        assertTrue(existingOtpToken.getIsUsed()); // Mã OTP đã bị đánh dấu sử dụng

        // Kiểm tra token reset tạm thời đã được tạo
        verify(tokenRepository, atLeastOnce()).save(any(PasswordResetToken.class));
    }

    @Test
    @DisplayName("5. Nhập sai OTP bị tăng số lần thử và báo lỗi")
    void testVerifyOtp_WrongOtp() {
        when(rateLimiterService.tryAcquire(anyString(), anyInt(), anyLong())).thenReturn(true);
        when(userRepository.findFirstByPhone("0901234567")).thenReturn(Optional.of(sampleUser));

        String validOtp = "123456";
        String otpHash = PasswordResetService.hashSha256(validOtp);

        PasswordResetToken existingOtpToken = new PasswordResetToken();
        existingOtpToken.setId(10L);
        existingOtpToken.setUser(sampleUser);
        existingOtpToken.setTokenHash(otpHash);
        existingOtpToken.setType("SMS_OTP");
        existingOtpToken.setExpiresAt(LocalDateTime.now().plusMinutes(5));
        existingOtpToken.setAttempts(0);
        existingOtpToken.setIsUsed(false);

        when(tokenRepository.findFirstByUserAndTypeAndIsUsedFalseOrderByCreatedAtDesc(sampleUser, "SMS_OTP"))
                .thenReturn(Optional.of(existingOtpToken));

        VerifyOtpRequest request = new VerifyOtpRequest("0901234567", "999999"); // Sai OTP
        ApiException ex = assertThrows(ApiException.class, () ->
                passwordResetService.verifyOtp(request, "127.0.0.1")
        );

        assertEquals(400, ex.getStatus());
        assertTrue(ex.getMessage().contains("không chính xác"));
        assertEquals(1, existingOtpToken.getAttempts());
    }

    @Test
    @DisplayName("6. Đặt lại mật khẩu thành công và hủy toàn bộ phiên cũ")
    void testResetPassword_Success() {
        String rawToken = "sample-reset-token-xyz-123456789";
        String tokenHash = PasswordResetService.hashSha256(rawToken);

        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setId(20L);
        resetToken.setUser(sampleUser);
        resetToken.setTokenHash(tokenHash);
        resetToken.setType("RESET_TOKEN");
        resetToken.setExpiresAt(LocalDateTime.now().plusMinutes(15));
        resetToken.setAttempts(0);
        resetToken.setIsUsed(false);

        when(tokenRepository.findByTokenHashAndTypeAndIsUsedFalse(tokenHash, "EMAIL_LINK"))
                .thenReturn(Optional.empty());
        when(tokenRepository.findByTokenHashAndTypeAndIsUsedFalse(tokenHash, "RESET_TOKEN"))
                .thenReturn(Optional.of(resetToken));
        when(passwordEncoder.encode("NewSecretPassword@2026")).thenReturn("$2a$10$newHashedPassword2026");

        ResetPasswordRequest request = new ResetPasswordRequest(rawToken, "NewSecretPassword@2026", "NewSecretPassword@2026");
        Map<String, Object> response = passwordResetService.resetPassword(request, "127.0.0.1");

        assertNotNull(response);
        assertEquals(true, response.get("success"));
        assertTrue(resetToken.getIsUsed());
        assertEquals("$2a$10$newHashedPassword2026", sampleUser.getPassword());

        // Kiểm tra cơ chế thu hồi phiên cũ
        verify(userRepository).save(sampleUser);
        verify(rateLimiterService).recordUserTokenRevocation(sampleUser.getId());
        verify(tokenRepository).invalidateAllActiveTokensByUserId(sampleUser.getId());
    }

    @Test
    @DisplayName("7. Sử dụng lại Token đã dùng phải bị từ chối")
    void testResetPassword_TokenAlreadyUsed() {
        String rawToken = "used-token-abc";
        String tokenHash = PasswordResetService.hashSha256(rawToken);

        when(tokenRepository.findByTokenHashAndTypeAndIsUsedFalse(tokenHash, "EMAIL_LINK"))
                .thenReturn(Optional.empty());
        when(tokenRepository.findByTokenHashAndTypeAndIsUsedFalse(tokenHash, "RESET_TOKEN"))
                .thenReturn(Optional.empty());

        ResetPasswordRequest request = new ResetPasswordRequest(rawToken, "NewPass123!", "NewPass123!");
        ApiException ex = assertThrows(ApiException.class, () ->
                passwordResetService.resetPassword(request, "127.0.0.1")
        );

        assertEquals(400, ex.getStatus());
        assertTrue(ex.getMessage().contains("không hợp lệ hoặc đã qua sử dụng"));
    }
}
