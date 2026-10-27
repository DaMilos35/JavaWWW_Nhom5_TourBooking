package vn.dulichviet.tourbooking.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
@Entity @Table(name = "corporate_users")
public class CorporateUser {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "corp_user_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    @Column(name = "corp_role", nullable = false, length = 20)
    private String corpRole = "EMPLOYEE";

    @Column(name = "employee_grade", length = 50)
    private String employeeGrade;

    @Column(name = "department", length = 100)
    private String department;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "manager_corp_user_id")
    private CorporateUser manager;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "joined_at")
    private LocalDateTime joinedAt = LocalDateTime.now();
}
