package vn.dulichviet.tourbooking.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import vn.dulichviet.tourbooking.entity.User;
import vn.dulichviet.tourbooking.repository.UserRepository;

import java.time.LocalDateTime;

@Component
public class DataInitializer implements CommandLineRunner {
    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

    public DataInitializer(UserRepository userRepository,
                           PasswordEncoder passwordEncoder,
                           org.springframework.jdbc.core.JdbcTemplate jdbcTemplate) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) {
        try {
            // Tự động tạo bảng user_activity_history nếu chưa có trong DB
            jdbcTemplate.execute("""
                CREATE TABLE IF NOT EXISTS user_activity_history (
                    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                    user_id INT NULL,
                    session_id VARCHAR(100) NULL,
                    tour_id INT NOT NULL,
                    activity_type VARCHAR(50) NOT NULL,
                    score INT NOT NULL DEFAULT 1,
                    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    INDEX idx_activity_user (user_id),
                    INDEX idx_activity_session (session_id),
                    INDEX idx_activity_tour (tour_id),
                    INDEX idx_activity_created (created_at)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            """);
        } catch (Exception e) {
            log.debug("Bảng user_activity_history đã sẵn sàng hoặc tạo tự động: {}", e.getMessage());
        }

        try {
            // Đảm bảo cột provider_id tồn tại trong bảng tours nếu nâng cấp từ schema cũ
            jdbcTemplate.execute("ALTER TABLE tours ADD COLUMN IF NOT EXISTS provider_id INT NULL");
        } catch (Exception e) {
            log.debug("Cột provider_id đã sẵn sàng: {}", e.getMessage());
        }

        try {
            if (userRepository.count() == 0) {
                User admin = new User();
                admin.setUsername("admin");
                admin.setPassword(passwordEncoder.encode("admin123"));
                admin.setEmail("admin@tourbooking.com");
                admin.setFullName("Quản trị viên");
                admin.setRole("ADMIN");
                admin.setActive(true);
                admin.setCreatedAt(LocalDateTime.now());
                userRepository.save(admin);
                log.info("Tạo tài khoản admin mặc định: admin / admin123");
            }
        } catch (Exception e) {
            log.warn("Bỏ qua khởi tạo dữ liệu mẫu (đã có dữ liệu hoặc DB chưa sẵn sàng): {}", e.getMessage());
        }
    }
}
