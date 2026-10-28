package vn.dulichviet.tourbooking.entity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Entity
@Table(name = "Orders")
public class TourOrder {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "order_id")
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "order_date", nullable = false)
    private LocalDateTime orderDate;

    @Column(name = "total_amount", nullable = false)
    private BigDecimal totalAmount;

    @Column(name = "status", nullable = false)
    private String status;

    @Column(name = "contact_name", nullable = false)
    private String contactName;

    @Column(name = "contact_phone", nullable = false)
    private String contactPhone;

    @Column(name = "contact_email", nullable = false)
    private String contactEmail;

    @Column(name = "order_code", length = 30)
    private String orderCode;

    @Column(name = "is_b2b")
    private Boolean isB2b = false;

    @Column(name = "discount_percent")
    private Integer discountPercent = 0;

    @Column(name = "payment_method", length = 50)
    private String paymentMethod = "CASH";

    @Column(name = "payment_status", length = 30)
    private String paymentStatus = "UNPAID";

    @Column(name = "payment_transaction_id", length = 100)
    private String paymentTransactionId;

    @Column(name = "cancellation_fee_percent")
    private Integer cancellationFeePercent = 0;

    @Column(name = "cancellation_fee")
    private BigDecimal cancellationFee = BigDecimal.ZERO;

    @Column(name = "refund_amount")
    private BigDecimal refundAmount = BigDecimal.ZERO;

    @Column(name = "refund_bank_name", length = 100)
    private String refundBankName;

    @Column(name = "refund_account_number", length = 50)
    private String refundAccountNumber;

    @Column(name = "refund_account_name", length = 100)
    private String refundAccountName;

    @Column(name = "cancellation_reason", length = 255)
    private String cancellationReason;

    @Column(name = "payment_type", length = 20)
    private String paymentType = "FULL";

    @Column(name = "deposit_percent")
    private Integer depositPercent = 0;

    @Column(name = "deposit_amount")
    private BigDecimal depositAmount = BigDecimal.ZERO;

    @Column(name = "remaining_amount")
    private BigDecimal remainingAmount = BigDecimal.ZERO;

    @Column(name = "deposit_deadline")
    private LocalDateTime depositDeadline;

    @Column(name = "points_used")
    private Integer pointsUsed = 0;

    @Column(name = "points_discount")
    private BigDecimal pointsDiscount = BigDecimal.ZERO;

    @Column(name = "member_discount")
    private BigDecimal memberDiscount = BigDecimal.ZERO;

    @Column(name = "notes")
    private String notes;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderDetail> details = new ArrayList<>();
}
