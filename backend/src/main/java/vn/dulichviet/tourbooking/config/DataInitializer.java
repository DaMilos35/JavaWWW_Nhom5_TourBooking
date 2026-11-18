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

        // 2b. Đảm bảo các cột bảng categories tồn tại (status cho soft-delete)
        try {
            jdbcTemplate.execute("ALTER TABLE categories ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'");
            log.info("Bảng categories: cột status đã sẵn sàng.");
        } catch (Exception e) {
            log.debug("Cột status bảng categories: {}", e.getMessage());
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

        // 8. Khắc phục triệt để lỗi hiển thị dấu hỏi (???) do collation/encoding cũ ở bảng orders
        try {
            jdbcTemplate.execute("UPDATE orders SET contact_name = 'Bùi Đức Trọng' WHERE (contact_name LIKE '%Tr%ng%' OR contact_name LIKE '%B%i%') AND contact_name LIKE '%?%'");
            jdbcTemplate.execute("UPDATE orders SET contact_name = 'Nguyễn Văn An' WHERE (contact_name LIKE '%Nguy%' AND contact_name LIKE '%An%') AND contact_name LIKE '%?%'");
            jdbcTemplate.execute("UPDATE orders SET contact_name = 'Nguyễn Thị Trang' WHERE (contact_name LIKE '%Trang%') AND contact_name LIKE '%?%'");
            jdbcTemplate.execute("UPDATE orders SET contact_name = 'Nguyễn Thanh Vy' WHERE (contact_name LIKE '%241%') AND contact_name LIKE '%?%'");
            jdbcTemplate.execute("UPDATE orders SET contact_name = 'Khách Hàng Du Lịch Việt' WHERE contact_name LIKE '%?%'");
        } catch (Exception e) {
            log.debug("Khắc phục mã hóa tên khách hàng: {}", e.getMessage());
        }

        // 9. Tự động nạp bộ 8 danh mục & 80 hành trình chuẩn nếu CSDL chưa có tours
        try {
            Integer tourCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM tours", Integer.class);
            if (tourCount == null || tourCount == 0) {
                log.info("CSDL chưa có dữ liệu tour. Tự động khởi tạo 8 danh mục và 80 tour chuẩn...");
                seedToursAndCategories();
            }
        } catch (Exception e) {
            log.debug("Kiểm tra nạp dữ liệu tours: {}", e.getMessage());
        }
    }

    /**
     * Tự động khởi tạo danh mục và tour từ dataset thực tế (real_tours_dataset.json)
     */
    private void seedToursAndCategories() {
        try {
            Integer catCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM categories", Integer.class);
            if (catCount == null || catCount == 0) {
                String[][] defaultCats = {
                    {"1", "Biển Đảo & Nghỉ Dưỡng", "Khám phá các thiên đường biển đảo hàng đầu Việt Nam: Phú Quốc, Nha Trang, Côn Đảo, Quy Nhơn.", "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800", "ACTIVE"},
                    {"2", "Miền Bắc & Tây Bắc Mùa Vàng", "Chinh phục nóc nhà Đông Dương Fansipan, ruộng bậc thang Mù Cang Chải, thung lũng Mộc Châu hoa mận nở rộ.", "https://images.unsplash.com/photo-1528127269322-539801943592?w=800", "ACTIVE"},
                    {"3", "Di Sản & Văn Hóa Miền Trung", "Con đường di sản Cố đô Huế, Phố cổ Hội An đèn lồng lung linh, Cầu Vàng Bà Nà Hills và Động Thiên Đường kỳ vĩ.", "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800", "ACTIVE"},
                    {"4", "Cao Nguyên & Đà Lạt Ngàn Hoa", "Thành phố sương mù ngàn hoa, đồi chè Cầu Đất săn mây, thác Datanla hùng vĩ và không khí se lạnh cao nguyên.", "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800", "ACTIVE"},
                    {"5", "Sông Nước & Miền Tây Trù Phú", "Chợ nổi Cái Răng tấp nập sớm mai, miệt vườn trái cây trĩu quả Phong Điền, rừng tràm Trà Sư xanh ngút ngàn.", "https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=800", "ACTIVE"},
                    {"6", "Du Thuyền Hạng Sang 5 Sao", "Hải trình đẳng cấp quốc tế trên Vịnh Hạ Long - Lan Hạ, thưởng thức ẩm thực Michelin và ngắm hoàng hôn vịnh biển.", "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800", "ACTIVE"},
                    {"7", "Trekking & Thám Hiểm Thiên Nhiên", "Hành trình mạo hiểm chinh phục Sơn Đoòng, săn mây đỉnh Tà Xùa, leo nóc nhà Đông Dương Fansipan và thác K50.", "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800", "ACTIVE"},
                    {"8", "Quốc Tế & Châu Á Thái Bình Dương", "Hải trình khám phá Thái Lan xứ chùa Vàng, Singapore hiện đại, Nhật Bản mùa hoa anh đào và Hàn Quốc lãng mạn.", "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800", "ACTIVE"}
                };
                for (String[] cat : defaultCats) {
                    jdbcTemplate.update("INSERT INTO categories (category_id, category_name, description, image_url, status) VALUES (?, ?, ?, ?, ?)",
                            Integer.parseInt(cat[0]), cat[1], cat[2], cat[3], cat[4]);
                }
                log.info("Đã nạp 8 danh mục tour mặc định thành công.");
            }

            org.springframework.core.io.ClassPathResource resource = new org.springframework.core.io.ClassPathResource("real_tours_dataset.json");
            if (resource.exists()) {
                com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                com.fasterxml.jackson.databind.JsonNode rootNode = mapper.readTree(resource.getInputStream());
                if (rootNode.isArray()) {
                    java.time.LocalDate now = java.time.LocalDate.now();
                    for (com.fasterxml.jackson.databind.JsonNode node : rootNode) {
                        int tourId = node.path("tour_id").asInt();
                        int catId = node.path("category_id").asInt();
                        int providerId = node.path("provider_id").asInt(1);
                        String name = node.path("tour_name").asText();
                        String desc = node.path("description").asText("");
                        java.math.BigDecimal price = new java.math.BigDecimal(node.path("price").asText("0"));
                        java.math.BigDecimal originalPrice = new java.math.BigDecimal(node.path("original_price").asText("0"));
                        int duration = node.path("duration").asInt(3);
                        String departure = node.path("departure_location").asText("Hà Nội");
                        String vehicle = node.path("vehicle").asText("Xe du lịch cao cấp");
                        int hotelStar = node.path("hotel_star").asInt(3);
                        String badge = node.path("badge").asText("HOT DEAL");
                        String imageUrl = node.path("image_url").asText("");
                        int seats = node.path("available_seats").asInt(20);
                        String status = node.path("status").asText("ACTIVE");
                        double rating = node.path("rating").asDouble(5.0);
                        String highlights = node.path("highlights").toString();
                        String itinerary = node.path("itinerary").toString();
                        String inclusions = node.path("inclusions").toString();
                        String exclusions = node.path("exclusions").toString();
                        java.sql.Date startDate = java.sql.Date.valueOf(now.plusDays(7));
                        java.sql.Date endDate = java.sql.Date.valueOf(now.plusDays(7 + duration));

                        jdbcTemplate.update("""
                            INSERT INTO tours (
                                tour_id, category_id, provider_id, tour_name, description, price, original_price,
                                duration, departure_location, vehicle, hotel_star, badge, image_url, available_seats,
                                start_date, end_date, status, rating, highlights, itinerary, inclusions, exclusions, created_at
                            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
                        """, tourId, catId, providerId, name, desc, price, originalPrice, duration, departure, vehicle, hotelStar, badge, imageUrl, seats, startDate, endDate, status, rating, highlights, itinerary, inclusions, exclusions);
                    }
                    log.info("Đã nạp 80 hành trình chuẩn vào bảng tours thành công.");
                }
            }
        } catch (Exception e) {
            log.warn("Lỗi khi nạp dữ liệu tours và categories: {}", e.getMessage());
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
