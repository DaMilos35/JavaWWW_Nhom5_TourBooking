package vn.dulichviet.tourbooking.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
@Entity @Table(name = "companies")
public class Company {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "company_id")
    private Long id;

    @Column(name = "company_name", nullable = false, length = 255)
    private String companyName;

    @Column(name = "tax_code", nullable = false, unique = true, length = 20)
    private String taxCode;

    @Column(name = "email_domain", nullable = false, length = 100)
    private String emailDomain;

    @Column(name = "registered_address", length = 500)
    private String registeredAddress;

    @Column(name = "industry", length = 100)
    private String industry;

    @Column(name = "company_size", length = 20)
    private String companySize = "SME";

    @Column(name = "kyb_status", length = 30)
    private String kybStatus = "PENDING_VERIFICATION";

    @Column(name = "kyb_verified_at")
    private LocalDateTime kybVerifiedAt;

    @Column(name = "kyb_doc_url", length = 500)
    private String kybDocUrl;

    @Column(name = "payment_method", length = 20)
    private String paymentMethod = "PAY_AS_YOU_GO";

    @Column(name = "billing_email", nullable = false, length = 150)
    private String billingEmail;

    @Column(name = "billing_cycle", length = 20)
    private String billingCycle = "MONTHLY";

    @Column(name = "vat_name", length = 300)
    private String vatName;

    @Column(name = "vat_address", length = 500)
    private String vatAddress;

    @Column(name = "is_active")
    private Boolean isActive = false;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    public void preUpdate() { this.updatedAt = LocalDateTime.now(); }
}
