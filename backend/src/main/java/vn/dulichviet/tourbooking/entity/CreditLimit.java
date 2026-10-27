package vn.dulichviet.tourbooking.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
@Entity @Table(name = "credit_limits")
public class CreditLimit {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "credit_id")
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false, unique = true)
    private Company company;

    @Column(name = "credit_limit", precision = 18, scale = 2)
    private BigDecimal creditLimit = BigDecimal.ZERO;

    @Column(name = "used_credit", precision = 18, scale = 2)
    private BigDecimal usedCredit = BigDecimal.ZERO;

    @Column(name = "reserved_credit", precision = 18, scale = 2)
    private BigDecimal reservedCredit = BigDecimal.ZERO;

    @Column(name = "overdue_amount", precision = 18, scale = 2)
    private BigDecimal overdueAmount = BigDecimal.ZERO;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Column(name = "last_payment_at")
    private LocalDateTime lastPaymentAt;

    @Column(name = "last_payment_amount", precision = 18, scale = 2)
    private BigDecimal lastPaymentAmount;

    @Column(name = "account_status", length = 20)
    private String accountStatus = "ACTIVE";

    @Column(name = "warning_threshold_pct")
    private Integer warningThresholdPct = 80;

    @Column(name = "blocked_threshold_pct")
    private Integer blockedThresholdPct = 100;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    public void preUpdate() { this.updatedAt = LocalDateTime.now(); }

    /** Tính % đã sử dụng */
    public double getUsagePercent() {
        if (creditLimit == null || creditLimit.compareTo(BigDecimal.ZERO) == 0) return 0.0;
        return usedCredit.divide(creditLimit, 4, java.math.RoundingMode.HALF_UP)
                .multiply(new BigDecimal("100")).doubleValue();
    }

    /** Tính số dư còn lại */
    public BigDecimal getAvailableCredit() {
        return creditLimit.subtract(usedCredit).subtract(reservedCredit);
    }

    /** Cập nhật trạng thái dựa trên % sử dụng */
    public void refreshStatus() {
        double pct = getUsagePercent();
        if (overdueAmount != null && overdueAmount.compareTo(BigDecimal.ZERO) > 0) {
            this.accountStatus = "RESTRICTED";
        } else if (pct >= blockedThresholdPct) {
            this.accountStatus = "BLOCKED";
        } else if (pct >= warningThresholdPct) {
            this.accountStatus = "WARNING";
        } else {
            this.accountStatus = "ACTIVE";
        }
    }
}
