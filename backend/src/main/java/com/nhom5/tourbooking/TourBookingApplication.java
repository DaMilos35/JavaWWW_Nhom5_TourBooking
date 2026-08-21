package com.nhom5.tourbooking;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.web.servlet.support.SpringBootServletInitializer;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableAsync;

/**
 * Main Application - Hỗ trợ cả 2 chế độ:
 *   1. Chạy trực tiếp trong IntelliJ (embedded Tomcat) → main()
 *   2. Deploy WAR lên Tomcat 10.1.57 ngoài      → SpringBootServletInitializer
 *
 * Tomcat 10.1.x = Jakarta EE 10 → tương thích Spring Boot 3.x ✅
 */
@SpringBootApplication
@EnableJpaAuditing
@EnableAsync
public class TourBookingApplication extends SpringBootServletInitializer {

    /**
     * Dùng khi deploy WAR lên Tomcat ngoài.
     * Tomcat gọi method này thay vì main().
     */
    @Override
    protected SpringApplicationBuilder configure(SpringApplicationBuilder application) {
        return application.sources(TourBookingApplication.class);
    }

    /**
     * Dùng khi chạy trực tiếp trong IntelliJ (embedded Tomcat).
     */
    public static void main(String[] args) {
        SpringApplication.run(TourBookingApplication.class, args);
    }
}
