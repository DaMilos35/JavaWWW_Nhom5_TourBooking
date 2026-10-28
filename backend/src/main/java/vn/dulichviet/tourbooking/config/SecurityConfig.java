package vn.dulichviet.tourbooking.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.rememberme.JdbcTokenRepositoryImpl;
import org.springframework.security.web.authentication.rememberme.PersistentTokenRepository;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfFilter;
import org.springframework.security.web.session.HttpSessionEventPublisher;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import javax.sql.DataSource;
import java.util.List;
import java.util.Map;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {
    private static final ObjectMapper JSON = new ObjectMapper();

    @Value("${cors.allowed-origin}")
    private String allowedOrigin;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http, PersistentTokenRepository tokenRepository, CustomUserDetailsService userDetailsService) throws Exception {
        http
            .csrf(csrf -> csrf
                .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
                .ignoringRequestMatchers(
                    "/api/auth/**",
                    "/api/tours", "/api/tours/**",
                    "/api/categories", "/api/categories/**",
                    "/api/orders", "/api/orders/**",
                    "/api/payment", "/api/payment/**",
                    "/api/users", "/api/users/**",
                    "/api/admin", "/api/admin/**",
                    "/api/ai", "/api/ai/**",
                    "/api/activity", "/api/activity/**",
                    "/api/corporate", "/api/corporate/**"))
            .addFilterAfter(new CsrfCookieFilter(), CsrfFilter.class)
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers("/api/auth/**", "/api/ai", "/api/ai/**", "/api/activity", "/api/activity/**",
                        "/api/corporate/**").permitAll()
                .requestMatchers("/api/payment/vnpay/return").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/categories", "/api/categories/**", "/api/tours", "/api/tours/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/tours/*/activity", "/api/activity", "/api/activity/**").permitAll()
                .requestMatchers("/api/admin/users/**").hasRole("ADMIN")
                .requestMatchers("/api/admin/**").hasAnyRole("ADMIN", "PROVIDER")
                .requestMatchers("/api/payment/**").authenticated()
                .anyRequest().authenticated())
            .formLogin(form -> form
                .loginProcessingUrl("/api/auth/login")
                .successHandler((request, response, authentication) -> {
                    Object principal = authentication.getPrincipal();
                    CustomUserDetails details = (CustomUserDetails) principal;
                    var user = details.getUser();
                    response.setContentType("application/json;charset=UTF-8");
                    JSON.writeValue(response.getWriter(), Map.of(
                        "userId", user.getId(),
                        "username", user.getUsername(),
                        "email", user.getEmail(),
                        "role", user.getRole(),
                        "fullName", user.getFullName() != null ? user.getFullName() : user.getUsername(),
                        "phone", user.getPhone() != null ? user.getPhone() : "",
                        "address", user.getAddress() != null ? user.getAddress() : "",
                        "membershipTier", user.getMembershipTier() != null ? user.getMembershipTier() : "STANDARD",
                        "loyaltyPoints", user.getLoyaltyPoints() != null ? user.getLoyaltyPoints() : 0,
                        "totalSpent", user.getTotalSpent() != null ? user.getTotalSpent() : java.math.BigDecimal.ZERO
                    ));
                })
                .failureHandler((request, response, exception) -> {
                    String message = exception instanceof org.springframework.security.authentication.DisabledException
                        ? "Tài khoản đã bị khóa."
                        : "Tên đăng nhập hoặc mật khẩu không chính xác.";
                    writeError(response, HttpServletResponse.SC_UNAUTHORIZED, message);
                })
                .permitAll())
            .logout(logout -> logout
                .logoutUrl("/api/auth/logout")
                .logoutSuccessHandler((request, response, authentication) -> {
                    response.setStatus(HttpServletResponse.SC_OK);
                    response.setContentType("application/json;charset=UTF-8");
                    JSON.writeValue(response.getWriter(), Map.of("message", "Đã đăng xuất"));
                })
                .permitAll())
            .rememberMe(remember -> remember
                .tokenRepository(tokenRepository)
                .userDetailsService(userDetailsService)
                .tokenValiditySeconds(7 * 24 * 60 * 60)
                .key("tourbooking-remember-me-key"))
            .sessionManagement(session -> session
                .maximumSessions(1)
                .maxSessionsPreventsLogin(false))
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint((request, response, authException) ->
                    writeError(response, HttpServletResponse.SC_UNAUTHORIZED, "Vui lòng đăng nhập để tiếp tục."))
                .accessDeniedHandler((request, response, accessDeniedException) ->
                    writeError(response, HttpServletResponse.SC_FORBIDDEN, "Bạn không có quyền truy cập.")));
        return http.build();
    }

    @Bean
    public PersistentTokenRepository persistentTokenRepository(DataSource dataSource) {
        JdbcTokenRepositoryImpl repo = new JdbcTokenRepositoryImpl();
        repo.setDataSource(dataSource);
        return repo;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public HttpSessionEventPublisher httpSessionEventPublisher() {
        return new HttpSessionEventPublisher();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOriginPatterns(List.of(
                "http://localhost:*",
                "http://127.0.0.1:*",
                allowedOrigin
        ));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    private static void writeError(HttpServletResponse response, int status, String message) throws java.io.IOException {
        response.setStatus(status);
        response.setContentType("application/json;charset=UTF-8");
        JSON.writeValue(response.getWriter(), Map.of("message", message));
    }
}
