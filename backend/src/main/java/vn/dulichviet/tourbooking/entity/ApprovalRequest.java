package vn.dulichviet.tourbooking.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
@Entity @Table(name = "approval_requests")
public class ApprovalRequest {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "approval_id")
    private Long id;

    @Column(name = "approval_code", nullable = false, unique = true, length = 30)
    private String approvalCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false)
    private CorporateBooking booking;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requester_corp_user_id", nullable = false)
    private CorporateUser requester;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approver_corp_user_id")
    private CorporateUser approver;

    @Column(name = "booking_amount", precision = 18, scale = 2)
    private BigDecimal bookingAmount;

    @Column(name = "policy_max_amount", precision = 18, scale = 2)
    private BigDecimal policyMaxAmount;

    @Column(name = "exceeded_amount", precision = 18, scale = 2)
    private BigDecimal exceededAmount;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "policy_id", nullable = false)
    private TravelPolicy policy;

    @Column(name = "approval_token", nullable = false, unique = true, length = 500)
    private String approvalToken;

    @Column(name = "token_expires_at", nullable = false)
    private LocalDateTime tokenExpiresAt;

    @Column(name = "status", length = 20)
    private String status = "PENDING";

    @Column(name = "approver_note", length = 500)
    private String approverNote;

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}
