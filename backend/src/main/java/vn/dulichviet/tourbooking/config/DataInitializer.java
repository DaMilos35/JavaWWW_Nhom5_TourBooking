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
            // Đảm bảo các cột order_code, is_b2b, discount_percent tồn tại trong bảng orders
            jdbcTemplate.execute("ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_code VARCHAR(30) NULL");
            jdbcTemplate.execute("ALTER TABLE orders ADD COLUMN IF NOT EXISTS is_b2b TINYINT(1) DEFAULT 0");
            jdbcTemplate.execute("ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_percent INT DEFAULT 0");
        } catch (Exception e) {
            log.debug("Các cột nghiệp vụ orders đã sẵn sàng: {}", e.getMessage());
        }

        try {
            // Mở rộng các trường đặc tả phong phú chuẩn Traveloka / OTA
            jdbcTemplate.execute("ALTER TABLE tours ADD COLUMN IF NOT EXISTS original_price DECIMAL(12,2) NULL");
            jdbcTemplate.execute("ALTER TABLE tours ADD COLUMN IF NOT EXISTS vehicle VARCHAR(150) NULL");
            jdbcTemplate.execute("ALTER TABLE tours ADD COLUMN IF NOT EXISTS hotel_star INT DEFAULT 3");
            jdbcTemplate.execute("ALTER TABLE tours ADD COLUMN IF NOT EXISTS badge VARCHAR(50) NULL");
            jdbcTemplate.execute("ALTER TABLE tours ADD COLUMN IF NOT EXISTS highlights LONGTEXT NULL");
            jdbcTemplate.execute("ALTER TABLE tours ADD COLUMN IF NOT EXISTS itinerary LONGTEXT NULL");
            jdbcTemplate.execute("ALTER TABLE tours ADD COLUMN IF NOT EXISTS inclusions LONGTEXT NULL");
            jdbcTemplate.execute("ALTER TABLE tours ADD COLUMN IF NOT EXISTS exclusions LONGTEXT NULL");
        } catch (Exception e) {
            log.debug("Các cột thông tin phong phú Tours đã sẵn sàng: {}", e.getMessage());
        }

        try {
            // Nới lỏng CHECK constraint role trong bảng users nếu cần
            jdbcTemplate.execute("ALTER TABLE users MODIFY COLUMN role VARCHAR(20) NOT NULL DEFAULT 'CUSTOMER' CHECK (role IN ('ADMIN', 'CUSTOMER', 'PROVIDER'))");
        } catch (Exception e) {
            log.debug("Cột role đã hỗ trợ PROVIDER: {}", e.getMessage());
        }

        try {
            // Khởi tạo các tài khoản demo chuẩn theo Bảng 5.3 trong Báo cáo (Mật khẩu đồng nhất: 123456)
            seedUserIfNotExists("admin", "admin@tourbooking.com", "123456", "Quản Trị Viên Hệ Thống", "ADMIN", "0909999999");
            seedUserIfNotExists("saigontourist", "saigontourist@tourbooking.com", "123456", "Saigontourist Travel", "PROVIDER", "19001808");
            seedUserIfNotExists("vietravel", "vietravel@tourbooking.com", "123456", "Vietravel Corporation", "PROVIDER", "19001839");
            seedUserIfNotExists("fpt_corp", "fpt_corp@fpt.com", "123456", "Tập đoàn FPT Software", "CUSTOMER", "0987654321");
            seedUserIfNotExists("customer", "customer@tourbooking.com", "123456", "Khách Hàng Cá Nhân", "CUSTOMER", "0919999999");
            seedUserIfNotExists("nguyenvanan", "nguyenvanan@gmail.com", "123456", "Nguyễn Văn An (Khách hàng có đơn)", "CUSTOMER", "0912345678");
        } catch (Exception e) {
            log.warn("Bỏ qua khởi tạo tài khoản demo (đã có dữ liệu hoặc DB chưa sẵn sàng): {}", e.getMessage());
        }
    }

    private void seedUserIfNotExists(String username, String email, String rawPassword, String fullName, String role, String phone) {
        if (!userRepository.existsByUsername(username)) {
            User user = new User();
            user.setUsername(username);
            user.setPassword(passwordEncoder.encode(rawPassword));
            user.setEmail(email);
            user.setFullName(fullName);
            user.setRole(role);
            user.setPhone(phone);
            user.setActive(true);
            user.setCreatedAt(LocalDateTime.now());
            userRepository.save(user);
            log.info("Tạo tài khoản demo thành công: {} / {} ({})", username, rawPassword, role);
        }
    }
}
