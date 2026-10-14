package vn.dulichviet.tourbooking.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * Entity lưu vết lịch sử hoạt động của người dùng (Customer hoặc Guest qua Session)
 * phục vụ cho việc phân tích sở thích và cá nhân hóa gợi ý tour (Personalized Recommendation).
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "user_activity_history", indexes = {
        @Index(name = "idx_activity_user", columnList = "user_id"),
        @Index(name = "idx_activity_session", columnList = "session_id"),
        @Index(name = "idx_activity_tour", columnList = "tour_id"),
        @Index(name = "idx_activity_created", columnList = "created_at")
})
public class UserActivityHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Người dùng đã đăng nhập (null nếu là khách vãng lai - Guest) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    /** Mã phiên của Guest (Session ID từ HttpSession hoặc Client Cookie) */
    @Column(name = "session_id", length = 100)
    private String sessionId;

    /** Tour mà người dùng vừa tương tác */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tour_id", nullable = false)
    private Tour tour;

    /** Loại hành vi: VIEW (Xem chi tiết), ADD_TO_CART (Thêm giỏ hàng), BOOK (Đặt chỗ) */
    @Column(name = "activity_type", length = 50, nullable = false)
    private String activityType;

    /** Trọng số điểm hành vi: VIEW = 1, ADD_TO_CART = 3, BOOK = 5 */
    @Column(name = "score", nullable = false)
    private Integer score = 1;

    /** Thời điểm ghi nhận */
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public UserActivityHistory(User user, String sessionId, Tour tour, String activityType, Integer score) {
        this.user = user;
        this.sessionId = sessionId;
        this.tour = tour;
        this.activityType = activityType;
        this.score = score;
        this.createdAt = LocalDateTime.now();
    }
}
