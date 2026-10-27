package vn.dulichviet.tourbooking.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
@Entity @Table(name = "travel_policies")
public class TravelPolicy {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "policy_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    @Column(name = "policy_name", nullable = false, length = 150)
    private String policyName;

    @Column(name = "description", length = 500)
    private String description;

    @Column(name = "is_default")
    private Boolean isDefault = false;

    @Column(name = "applicable_grades", columnDefinition = "JSON")
    private String applicableGrades;

    @Column(name = "max_amount_per_trip", precision = 18, scale = 2)
    private BigDecimal maxAmountPerTrip = new BigDecimal("5000000");

    @Column(name = "max_amount_per_year", precision = 18, scale = 2)
    private BigDecimal maxAmountPerYear;

    @Column(name = "advance_booking_days_min")
    private Integer advanceBookingDaysMin = 3;

    @Column(name = "advance_booking_days_max")
    private Integer advanceBookingDaysMax = 365;

    @Column(name = "allowed_tour_category_ids", columnDefinition = "JSON")
    private String allowedTourCategoryIds;

    @Column(name = "max_hotel_star")
    private Integer maxHotelStar = 4;

    @Column(name = "allowed_vehicle_types", columnDefinition = "JSON")
    private String allowedVehicleTypes;

    @Column(name = "require_approval_above", precision = 18, scale = 2)
    private BigDecimal requireApprovalAbove;

    @Column(name = "created_by", nullable = false)
    private Long createdBy;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @Column(name = "version")
    private Integer version = 1;

    @PreUpdate
    public void preUpdate() { this.updatedAt = LocalDateTime.now(); this.version++; }
}
