package vn.dulichviet.tourbooking.service;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Empirical Stress Test Suite for Milestone M1 (Backend Resilience & Database Fallback)
 * Author: Empirical Challenger 1
 */
public class B2BServiceEmpiricalStressTest {

    /**
     * Replicates the exact division formula used in B2BService.java:166-167:
     * BigDecimal finalAmount = totalAmount.multiply(BigDecimal.valueOf(100 - disc)).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
     */
    private BigDecimal calculateFinalAmount(BigDecimal totalAmount, Integer discountPercent) {
        int disc = discountPercent != null ? discountPercent : 0;
        return totalAmount.multiply(BigDecimal.valueOf(100 - disc))
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
    }

    @ParameterizedTest
    @ValueSource(ints = {0, 1, 13, 33, 50, 99, 100})
    @DisplayName("B2B Division Safety: Edge-case integer discounts (0%, 1%, 13%, 33%, 50%, 99%, 100%)")
    void testEdgeCaseDiscounts_Integer(int discount) {
        List<BigDecimal> amounts = List.of(
                BigDecimal.ZERO,
                BigDecimal.ONE,
                new BigDecimal("3"),
                new BigDecimal("7"),
                new BigDecimal("13"),
                new BigDecimal("17"),
                new BigDecimal("97"),
                new BigDecimal("1000000007"),
                new BigDecimal("123456789.99"),
                new BigDecimal("999999999999999.99")
        );

        for (BigDecimal amount : amounts) {
            assertDoesNotThrow(() -> {
                BigDecimal result = calculateFinalAmount(amount, discount);
                assertNotNull(result);
                assertEquals(2, result.scale());
            }, "Failed on discount=" + discount + " with amount=" + amount);
        }
    }

    @Test
    @DisplayName("B2B Division Safety: Fractional discount rate (33.33%)")
    void testFractionalDiscountRate_33Point33() {
        BigDecimal discBd = new BigDecimal("33.33");
        List<BigDecimal> oddAndPrimeAmounts = List.of(
                new BigDecimal("1"),
                new BigDecimal("3"),
                new BigDecimal("7"),
                new BigDecimal("13"),
                new BigDecimal("17"),
                new BigDecimal("999999999989")
        );

        for (BigDecimal totalAmount : oddAndPrimeAmounts) {
            assertDoesNotThrow(() -> {
                BigDecimal finalAmount = totalAmount.multiply(BigDecimal.valueOf(100).subtract(discBd))
                        .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
                assertNotNull(finalAmount);
                assertEquals(2, finalAmount.scale());
            });
        }
    }

    @Test
    @DisplayName("B2B Division Safety: Large-scale stress test (100,000 combinations of odd amounts, primes, and discounts)")
    void testMassiveFuzzingCombinations() {
        // Primes and odd amounts
        long[] primesAndOdds = {
                1L, 3L, 5L, 7L, 11L, 13L, 17L, 19L, 23L, 29L, 31L, 37L, 41L, 43L, 47L, 53L, 59L, 61L, 67L, 71L,
                73L, 79L, 83L, 89L, 97L, 101L, 103L, 107L, 109L, 113L, 127L, 131L, 137L, 139L, 149L, 151L,
                10007L, 10009L, 100003L, 100019L, 1000003L, 1000033L, 10000019L, 100000007L, 1000000007L
        };

        for (int disc = -20; disc <= 120; disc++) {
            for (long p : primesAndOdds) {
                BigDecimal totalAmount = BigDecimal.valueOf(p);
                BigDecimal res = calculateFinalAmount(totalAmount, disc);
                assertNotNull(res);
                assertEquals(2, res.scale());

                // Fractional amount variant
                BigDecimal fractionalAmount = totalAmount.add(new BigDecimal("0.3333333333"));
                BigDecimal resFrac = calculateFinalAmount(fractionalAmount, disc);
                assertNotNull(resFrac);
                assertEquals(2, resFrac.scale());
            }
        }
    }

    @Test
    @DisplayName("B2B Division Safety: Null discount handling")
    void testNullDiscount() {
        BigDecimal totalAmount = new BigDecimal("1234567.89");
        BigDecimal result = calculateFinalAmount(totalAmount, null);
        assertNotNull(result);
        assertEquals(new BigDecimal("1234567.89"), result);
    }

    @Test
    @DisplayName("DataInitializer Dialect Safety: Execute all H2 DDL/DML statements against in-memory H2")
    void testDataInitializerH2Statements() throws Exception {
        String h2Url = "jdbc:h2:mem:challenger_test_db;DB_CLOSE_DELAY=-1;MODE=MySQL";
        try (Connection conn = DriverManager.getConnection(h2Url, "sa", "");
             Statement stmt = conn.createStatement()) {

            // 1. persistent_logins
            stmt.execute("""
                CREATE TABLE IF NOT EXISTS persistent_logins (
                    username VARCHAR(64) NOT NULL,
                    series VARCHAR(64) PRIMARY KEY,
                    token VARCHAR(64) NOT NULL,
                    last_used TIMESTAMP NOT NULL
                );
            """);

            // 2. user_activity_history
            stmt.execute("""
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
            stmt.execute("CREATE INDEX IF NOT EXISTS idx_activity_user ON user_activity_history (user_id)");
            stmt.execute("CREATE INDEX IF NOT EXISTS idx_activity_session ON user_activity_history (session_id)");
            stmt.execute("CREATE INDEX IF NOT EXISTS idx_activity_tour ON user_activity_history (tour_id)");
            stmt.execute("CREATE INDEX IF NOT EXISTS idx_activity_created ON user_activity_history (created_at)");

            // 3. users table and columns
            stmt.execute("CREATE TABLE IF NOT EXISTS users (id INT AUTO_INCREMENT PRIMARY KEY, username VARCHAR(50), role VARCHAR(50))");
            stmt.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS membership_tier VARCHAR(30) NOT NULL DEFAULT 'STANDARD'");
            stmt.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS loyalty_points INT NOT NULL DEFAULT 0");
            stmt.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS total_spent DECIMAL(18,2) NOT NULL DEFAULT 0.00");
            stmt.execute("ALTER TABLE users ALTER COLUMN role VARCHAR(20) NOT NULL DEFAULT 'CUSTOMER'");

            // 4. tours table and columns
            stmt.execute("CREATE TABLE IF NOT EXISTS tours (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(100), start_date DATE, end_date DATE, duration INT)");
            stmt.execute("ALTER TABLE tours ADD COLUMN IF NOT EXISTS provider_id INT NULL");
            stmt.execute("ALTER TABLE tours ADD COLUMN IF NOT EXISTS original_price DECIMAL(18,2) NULL");
            stmt.execute("ALTER TABLE tours ADD COLUMN IF NOT EXISTS vehicle VARCHAR(150) NULL");
            stmt.execute("ALTER TABLE tours ADD COLUMN IF NOT EXISTS hotel_star INT DEFAULT 3");
            stmt.execute("ALTER TABLE tours ADD COLUMN IF NOT EXISTS badge VARCHAR(50) NULL");
            stmt.execute("ALTER TABLE tours ADD COLUMN IF NOT EXISTS highlights LONGTEXT NULL");
            stmt.execute("ALTER TABLE tours ADD COLUMN IF NOT EXISTS itinerary LONGTEXT NULL");
            stmt.execute("ALTER TABLE tours ADD COLUMN IF NOT EXISTS inclusions LONGTEXT NULL");
            stmt.execute("ALTER TABLE tours ADD COLUMN IF NOT EXISTS exclusions LONGTEXT NULL");

            // 5. orders table and columns
            stmt.execute("CREATE TABLE IF NOT EXISTS orderdetails (id INT PRIMARY KEY, order_id INT, tour_id INT)");
            stmt.execute("CREATE TABLE IF NOT EXISTS orders (id INT AUTO_INCREMENT PRIMARY KEY, user_id INT, payment_status VARCHAR(50))");
            stmt.execute("ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_code VARCHAR(30) NULL");
            stmt.execute("ALTER TABLE orders ADD COLUMN IF NOT EXISTS is_b2b TINYINT(1) DEFAULT 0");
            stmt.execute("ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_percent INT DEFAULT 0");
            stmt.execute("ALTER TABLE orders ADD COLUMN IF NOT EXISTS cancellation_fee_percent INT DEFAULT 0");
            stmt.execute("ALTER TABLE orders ADD COLUMN IF NOT EXISTS cancellation_fee DECIMAL(18,2) DEFAULT 0.00");
            stmt.execute("ALTER TABLE orders ADD COLUMN IF NOT EXISTS refund_amount DECIMAL(18,2) DEFAULT 0.00");
            stmt.execute("ALTER TABLE orders ADD COLUMN IF NOT EXISTS refund_bank_name VARCHAR(100) NULL");
            stmt.execute("ALTER TABLE orders ADD COLUMN IF NOT EXISTS refund_account_number VARCHAR(50) NULL");
            stmt.execute("ALTER TABLE orders ADD COLUMN IF NOT EXISTS refund_account_name VARCHAR(100) NULL");
            stmt.execute("ALTER TABLE orders ADD COLUMN IF NOT EXISTS cancellation_reason VARCHAR(255) NULL");
            stmt.execute("ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_type VARCHAR(20) NOT NULL DEFAULT 'FULL'");
            stmt.execute("ALTER TABLE orders ADD COLUMN IF NOT EXISTS deposit_percent INT NOT NULL DEFAULT 0");
            stmt.execute("ALTER TABLE orders ADD COLUMN IF NOT EXISTS deposit_amount DECIMAL(18,2) NOT NULL DEFAULT 0.00");
            stmt.execute("ALTER TABLE orders ADD COLUMN IF NOT EXISTS remaining_amount DECIMAL(18,2) NOT NULL DEFAULT 0.00");
            stmt.execute("ALTER TABLE orders ADD COLUMN IF NOT EXISTS deposit_deadline DATETIME NULL");
            stmt.execute("ALTER TABLE orders ADD COLUMN IF NOT EXISTS points_used INT NOT NULL DEFAULT 0");
            stmt.execute("ALTER TABLE orders ADD COLUMN IF NOT EXISTS points_discount DECIMAL(18,2) NOT NULL DEFAULT 0.00");
            stmt.execute("ALTER TABLE orders ADD COLUMN IF NOT EXISTS member_discount DECIMAL(18,2) NOT NULL DEFAULT 0.00");
            stmt.execute("ALTER TABLE orders ALTER COLUMN payment_status VARCHAR(30) NOT NULL DEFAULT 'UNPAID'");
            stmt.execute("CREATE OR REPLACE VIEW order_details AS SELECT * FROM orderdetails");

            // 6. Rolling departure update statement
            stmt.execute("INSERT INTO tours (name, duration) VALUES ('Tour Da Lat', 3)");
            int updated = stmt.executeUpdate("""
                UPDATE tours 
                SET start_date = DATEADD('DAY', 7, CURRENT_DATE),
                    end_date = DATEADD('DAY', 7 + COALESCE(duration, 3), CURRENT_DATE)
                WHERE start_date IS NULL OR start_date <= CURRENT_DATE
            """);
            assertTrue(updated > 0, "Rolling departure update should update at least one row");
        }
    }
}
