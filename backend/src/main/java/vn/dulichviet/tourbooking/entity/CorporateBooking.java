package vn.dulichviet.tourbooking.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
@Entity @Table(name = "corporate_bookings")
public class CorporateBooking {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "booking_id")
    private Long id;

    @Column(name = "booking_code", nullable = false, unique = true, length = 30)
    private String bookingCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booker_corp_user_id", nullable = false)
    private CorporateUser booker;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "traveler_corp_user_id", nullable = false)
    private CorporateUser traveler;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "policy_id", nullable = false)
    private TravelPolicy policy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tour_id", nullable = false)
    private Tour tour;

    @Column(name = "tour_name", nullable = false, length = 300)
    private String tourName;

    @Column(name = "tour_snapshot", columnDefinition = "JSON")
    private String tourSnapshot;

    @Column(name = "quantity")
    private Integer quantity = 1;

    @Column(name = "unit_price", precision = 18, scale = 2)
    private BigDecimal unitPrice;

    @Column(name = "total_amount", precision = 18, scale = 2)
    private BigDecimal totalAmount;

    @Column(name = "discount_percent")
    private Integer discountPercent = 0;

    @Column(name = "final_amount", precision = 18, scale = 2)
    private BigDecimal finalAmount;

    @Column(name = "booking_status", length = 20)
    private String bookingStatus = "PENDING_APPROVAL";

    @Column(name = "is_over_policy")
    private Boolean isOverPolicy = false;

    @Column(name = "payment_method", length = 20)
    private String paymentMethod = "CREDIT_LINE";

    @Column(name = "payment_status", length = 20)
    private String paymentStatus = "UNPAID";

    @Column(name = "contact_name", nullable = false, length = 150)
    private String contactName;

    @Column(name = "contact_phone", nullable = false, length = 15)
    private String contactPhone;

    @Column(name = "contact_email", nullable = false, length = 100)
    private String contactEmail;

    @Column(name = "notes", length = 500)
    private String notes;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @Column(name = "confirmed_at")
    private LocalDateTime confirmedAt;

    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt;

    @Column(name = "cancellation_reason", length = 255)
    private String cancellationReason;

    @PreUpdate
    public void preUpdate() { this.updatedAt = LocalDateTime.now(); }
}
