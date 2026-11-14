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
        boolean h2 = isH2();
        log.info("Khởi chạy DataInitializer trên nền tảng CSDL: {}", h2 ? "H2 In-Memory" : "MariaDB/MySQL");

        // 1. Tự động tạo bảng remember-me persistent_logins (bảo vệ chống crash khi chọn Remember Me)
        try {
            if (h2) {
                jdbcTemplate.execute("""
                    CREATE TABLE IF NOT EXISTS persistent_logins (
                        username VARCHAR(64) NOT NULL,
                        series VARCHAR(64) PRIMARY KEY,
                        token VARCHAR(64) NOT NULL,
                        last_used TIMESTAMP NOT NULL
                    );
                """);
            } else {
                jdbcTemplate.execute("""
                    CREATE TABLE IF NOT EXISTS persistent_logins (
                        username VARCHAR(64) NOT NULL,
                        series VARCHAR(64) PRIMARY KEY,
                        token VARCHAR(64) NOT NULL,
                        last_used TIMESTAMP NOT NULL
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
                """);
            }
            log.info("Bảng persistent_logins đã sẵn sàng.");
        } catch (Exception e) {
            log.debug("persistent_logins: {}", e.getMessage());
        }

        // 2. Tự động tạo bảng user_activity_history nếu chưa có trong DB
        try {
            if (h2) {
                jdbcTemplate.execute("""
                    CREATE TABLE IF NOT EXISTS user_activity_history (
                        id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                        user_id INT NULL,
                        session_id VARCHAR(100) NULL,
                        tour_id INT NOT NULL,
                        activity_type VARCHAR(50) NOT NULL,
                        score INT NOT NULL DEFAULT 1,
                        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
                    );
                """);
                jdbcTemplate.execute("CREATE INDEX IF NOT EXISTS idx_activity_user ON user_activity_history (user_id)");
                jdbcTemplate.execute("CREATE INDEX IF NOT EXISTS idx_activity_session ON user_activity_history (session_id)");
                jdbcTemplate.execute("CREATE INDEX IF NOT EXISTS idx_activity_tour ON user_activity_history (tour_id)");
                jdbcTemplate.execute("CREATE INDEX IF NOT EXISTS idx_activity_created ON user_activity_history (created_at)");
            } else {
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
            }
        } catch (Exception e) {
            log.debug("Bảng user_activity_history đã sẵn sàng: {}", e.getMessage());
        }

        // 3. Đảm bảo các cột bảng users (hội viên, điểm thưởng, chi tiêu) tồn tại
        try {
            jdbcTemplate.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS membership_tier VARCHAR(30) NOT NULL DEFAULT 'STANDARD'");
            jdbcTemplate.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS loyalty_points INT NOT NULL DEFAULT 0");
            jdbcTemplate.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS total_spent DECIMAL(18,2) NOT NULL DEFAULT 0.00");
            if (h2) {
                jdbcTemplate.execute("ALTER TABLE users ALTER COLUMN role VARCHAR(20) NOT NULL DEFAULT 'CUSTOMER'");
            } else {
                jdbcTemplate.execute("ALTER TABLE users MODIFY COLUMN role VARCHAR(20) NOT NULL DEFAULT 'CUSTOMER' CHECK (role IN ('ADMIN', 'CUSTOMER', 'PROVIDER'))");
            }
        } catch (Exception e) {
            log.debug("Các cột bảng users đã sẵn sàng: {}", e.getMessage());
        }

        // 4. Đảm bảo các cột bảng tours tồn tại
        try {
            jdbcTemplate.execute("ALTER TABLE tours ADD COLUMN IF NOT EXISTS provider_id INT NULL");
            jdbcTemplate.execute("ALTER TABLE tours ADD COLUMN IF NOT EXISTS original_price DECIMAL(18,2) NULL");
            jdbcTemplate.execute("ALTER TABLE tours ADD COLUMN IF NOT EXISTS vehicle VARCHAR(150) NULL");
            jdbcTemplate.execute("ALTER TABLE tours ADD COLUMN IF NOT EXISTS hotel_star INT DEFAULT 3");
            jdbcTemplate.execute("ALTER TABLE tours ADD COLUMN IF NOT EXISTS badge VARCHAR(50) NULL");
            jdbcTemplate.execute("ALTER TABLE tours ADD COLUMN IF NOT EXISTS highlights LONGTEXT NULL");
            jdbcTemplate.execute("ALTER TABLE tours ADD COLUMN IF NOT EXISTS itinerary LONGTEXT NULL");
            jdbcTemplate.execute("ALTER TABLE tours ADD COLUMN IF NOT EXISTS inclusions LONGTEXT NULL");
            jdbcTemplate.execute("ALTER TABLE tours ADD COLUMN IF NOT EXISTS exclusions LONGTEXT NULL");
        } catch (Exception e) {
            log.debug("Các cột bảng tours đã sẵn sàng: {}", e.getMessage());
        }

        // 5. Đảm bảo các cột nghiệp vụ bảng orders tồn tại
        try {
            jdbcTemplate.execute("ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_code VARCHAR(30) NULL");
            jdbcTemplate.execute("ALTER TABLE orders ADD COLUMN IF NOT EXISTS is_b2b TINYINT(1) DEFAULT 0");
            jdbcTemplate.execute("ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_percent INT DEFAULT 0");
            jdbcTemplate.execute("ALTER TABLE orders ADD COLUMN IF NOT EXISTS cancellation_fee_percent INT DEFAULT 0");
            jdbcTemplate.execute("ALTER TABLE orders ADD COLUMN IF NOT EXISTS cancellation_fee DECIMAL(18,2) DEFAULT 0.00");
            jdbcTemplate.execute("ALTER TABLE orders ADD COLUMN IF NOT EXISTS refund_amount DECIMAL(18,2) DEFAULT 0.00");
            jdbcTemplate.execute("ALTER TABLE orders ADD COLUMN IF NOT EXISTS refund_bank_name VARCHAR(100) NULL");
            jdbcTemplate.execute("ALTER TABLE orders ADD COLUMN IF NOT EXISTS refund_account_number VARCHAR(50) NULL");
            jdbcTemplate.execute("ALTER TABLE orders ADD COLUMN IF NOT EXISTS refund_account_name VARCHAR(100) NULL");
            jdbcTemplate.execute("ALTER TABLE orders ADD COLUMN IF NOT EXISTS cancellation_reason VARCHAR(255) NULL");
            jdbcTemplate.execute("ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_type VARCHAR(20) NOT NULL DEFAULT 'FULL'");
            jdbcTemplate.execute("ALTER TABLE orders ADD COLUMN IF NOT EXISTS deposit_percent INT NOT NULL DEFAULT 0");
            jdbcTemplate.execute("ALTER TABLE orders ADD COLUMN IF NOT EXISTS deposit_amount DECIMAL(18,2) NOT NULL DEFAULT 0.00");
            jdbcTemplate.execute("ALTER TABLE orders ADD COLUMN IF NOT EXISTS remaining_amount DECIMAL(18,2) NOT NULL DEFAULT 0.00");
            jdbcTemplate.execute("ALTER TABLE orders ADD COLUMN IF NOT EXISTS deposit_deadline DATETIME NULL");
            jdbcTemplate.execute("ALTER TABLE orders ADD COLUMN IF NOT EXISTS points_used INT NOT NULL DEFAULT 0");
            jdbcTemplate.execute("ALTER TABLE orders ADD COLUMN IF NOT EXISTS points_discount DECIMAL(18,2) NOT NULL DEFAULT 0.00");
            jdbcTemplate.execute("ALTER TABLE orders ADD COLUMN IF NOT EXISTS member_discount DECIMAL(18,2) NOT NULL DEFAULT 0.00");
            if (h2) {
                jdbcTemplate.execute("ALTER TABLE orders ALTER COLUMN payment_status VARCHAR(30) NOT NULL DEFAULT 'UNPAID'");
            } else {
                jdbcTemplate.execute("ALTER TABLE orders MODIFY COLUMN payment_status VARCHAR(30) NOT NULL DEFAULT 'UNPAID' CHECK (payment_status IN ('UNPAID','PENDING_PAYMENT','PAID','REFUND_PENDING','REFUNDED','FAILED'))");
            }
            jdbcTemplate.execute("CREATE OR REPLACE VIEW order_details AS SELECT * FROM orderdetails");
        } catch (Exception e) {
            log.debug("Các cột nghiệp vụ orders đã sẵn sàng: {}", e.getMessage());
        }

        // 6. Tự động cuộn lịch khởi hành cho các tour sang tương lai (Rolling Departure Schedule)
        try {
            if (h2) {
                jdbcTemplate.execute("""
                    UPDATE tours 
                    SET start_date = DATEADD('DAY', 7, CURRENT_DATE),
                        end_date = DATEADD('DAY', 7 + COALESCE(duration, 3), CURRENT_DATE)
                    WHERE start_date IS NULL OR start_date <= CURRENT_DATE
                """);
            } else {
                jdbcTemplate.execute("""
                    UPDATE tours 
                    SET start_date = DATE_ADD(CURRENT_DATE, INTERVAL 7 DAY),
                        end_date = DATE_ADD(CURRENT_DATE, INTERVAL (7 + IFNULL(duration, 3)) DAY)
                    WHERE start_date IS NULL OR start_date <= CURRENT_DATE
                """);
            }
            log.info("Đã đồng bộ ngày khởi hành các tour sang ngày tương lai thành công.");
        } catch (Exception e) {
            log.debug("Cập nhật ngày khởi hành tours: {}", e.getMessage());
        }

        // 7. Khởi tạo & Đồng bộ tài khoản demo chuẩn theo Bảng 5.3 trong Báo cáo (Mật khẩu đồng nhất: 123456)
        try {
            syncDemoUser("admin", "admin@tourbooking.com", "123456", "Quản Trị Viên Hệ Thống", "ADMIN", "0909999999");
            syncDemoUser("saigontourist", "saigontourist@tourbooking.com", "123456", "Saigontourist Travel", "PROVIDER", "19001808");
            syncDemoUser("vietravel", "vietravel@tourbooking.com", "123456", "Vietravel Corporation", "PROVIDER", "19001839");
            syncDemoUser("fpt_corp", "fpt_corp@fpt.com", "123456", "Tập đoàn FPT Software", "CUSTOMER", "0987654321");
            syncDemoUser("customer", "customer@tourbooking.com", "123456", "Khách Hàng Cá Nhân", "CUSTOMER", "0919999999");
            syncDemoUser("nguyenvanan", "nguyenvanan@gmail.com", "123456", "Nguyễn Văn An (Khách hàng có đơn)", "CUSTOMER", "0912345678");
        } catch (Exception e) {
            log.warn("Lỗi khi đồng bộ tài khoản demo: {}", e.getMessage());
        }
    }

    /**
     * Đồng bộ tài khoản demo: Tạo mới nếu chưa có, hoặc kích hoạt lại và đảm bảo mật khẩu khớp 123456
     */
    private void syncDemoUser(String username, String email, String rawPassword, String fullName, String role, String phone) {
        try {
            var opt = userRepository.findByUsername(username);
            if (opt.isEmpty()) {
                User user = new User();
                user.setUsername(username);
                user.setPassword(passwordEncoder.encode(rawPassword));
                user.setEmail(email);
                user.setFullName(fullName);
                user.setRole(role);
                user.setPhone(phone);
                user.setActive(true);
                user.setMembershipTier(role.equals("ADMIN") ? "DIAMOND" : "STANDARD");
                user.setLoyaltyPoints(500);
                user.setTotalSpent(java.math.BigDecimal.ZERO);
                user.setCreatedAt(LocalDateTime.now());
                userRepository.save(user);
                log.info("Tạo mới tài khoản demo: {} / {} ({})", username, rawPassword, role);
            } else {
                User user = opt.get();
                boolean changed = false;
                if (!Boolean.TRUE.equals(user.getActive())) {
                    user.setActive(true);
                    changed = true;
                }
                // Nếu mật khẩu trong DB chưa khớp với rawPassword chuẩn, cập nhật lại mã hóa
                if (!passwordEncoder.matches(rawPassword, user.getPassword())) {
                    user.setPassword(passwordEncoder.encode(rawPassword));
                    changed = true;
                    log.info("Cập nhật lại mật khẩu mã hóa cho demo user '{}'", username);
                }
                if (user.getRole() == null || !user.getRole().equalsIgnoreCase(role)) {
                    user.setRole(role);
                    changed = true;
                }
                if (changed) {
                    userRepository.save(user);
                }
            }
        } catch (Exception e) {
            log.warn("Không thể đồng bộ demo user {}: {}", username, e.getMessage());
        }
    }

    /**
     * Kiểm tra dialect CSDL hiện tại có phải là H2 hay không.
     */
    private boolean isH2() {
        try {
            if (jdbcTemplate.getDataSource() != null) {
                try (java.sql.Connection conn = jdbcTemplate.getDataSource().getConnection()) {
                    String productName = conn.getMetaData().getDatabaseProductName();
                    return productName != null && productName.toLowerCase().contains("h2");
                }
            }
        } catch (Exception e) {
            log.debug("Không thể xác định loại database qua metadata, mặc định MariaDB/MySQL: {}", e.getMessage());
        }
        return false;
    }
}
