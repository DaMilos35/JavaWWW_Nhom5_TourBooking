package vn.dulichviet.tourbooking.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import vn.dulichviet.tourbooking.entity.ApprovalRequest;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface ApprovalRequestRepository extends JpaRepository<ApprovalRequest, Long> {
    Optional<ApprovalRequest> findByApprovalCode(String approvalCode);
    Optional<ApprovalRequest> findByApprovalToken(String token);
    Page<ApprovalRequest> findByCompanyIdAndStatus(Long companyId, String status, Pageable pageable);
    Page<ApprovalRequest> findByCompanyId(Long companyId, Pageable pageable);

    @Query("SELECT ar FROM ApprovalRequest ar WHERE ar.status = 'PENDING' AND ar.tokenExpiresAt < :now")
    List<ApprovalRequest> findExpiredPendingRequests(@Param("now") LocalDateTime now);

    @Query("SELECT ar FROM ApprovalRequest ar WHERE ar.requester.id = :corpUserId ORDER BY ar.createdAt DESC")
    Page<ApprovalRequest> findByRequesterId(@Param("corpUserId") Long corpUserId, Pageable pageable);
}
