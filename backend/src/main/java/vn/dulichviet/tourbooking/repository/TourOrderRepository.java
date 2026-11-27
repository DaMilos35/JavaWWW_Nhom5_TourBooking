package vn.dulichviet.tourbooking.repository;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.Lock;
import jakarta.persistence.LockModeType;
import vn.dulichviet.tourbooking.entity.TourOrder;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.time.LocalDateTime;

public interface TourOrderRepository extends JpaRepository<TourOrder, Integer> {
    @EntityGraph(attributePaths = {"user", "details", "details.tour", "passengers"})
    @Query("SELECT o FROM TourOrder o WHERE o.user.id = :userId ORDER BY o.orderDate DESC")
    List<TourOrder> findByUserIdWithDetails(Integer userId);

    @EntityGraph(attributePaths = {"user", "details", "details.tour", "passengers"})
    @Query("SELECT o FROM TourOrder o ORDER BY o.orderDate DESC")
    List<TourOrder> findAllWithDetails();

    @EntityGraph(attributePaths = {"user", "details", "details.tour", "passengers"})
    @Query("SELECT o FROM TourOrder o WHERE o.id = :id")
    Optional<TourOrder> findByIdWithDetails(Integer id);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @EntityGraph(attributePaths = {"user", "details", "details.tour", "passengers"})
    @Query("SELECT o FROM TourOrder o WHERE o.id = :id")
    Optional<TourOrder> findByIdForUpdateWithDetails(Integer id);

    @Query("SELECT COUNT(o) FROM TourOrder o")
    long countOrders();

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM TourOrder o WHERE o.status IN ('CONFIRMED', 'COMPLETED', 'PAID')")
    BigDecimal sumRevenue();

    Optional<TourOrder> findByOrderCode(String orderCode);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT o FROM TourOrder o WHERE o.orderCode = :orderCode")
    Optional<TourOrder> findByOrderCodeForUpdate(String orderCode);
    boolean existsByPaymentTransactionIdAndIdNot(String paymentTransactionId, Integer id);

    @Query("SELECT o.id FROM TourOrder o WHERE o.status = 'PENDING' AND o.orderDate < :cutoff AND " +
            "(o.paymentStatus = 'UNPAID' OR (o.paymentStatus = 'PENDING_PAYMENT' AND o.paymentMethod = 'VNPAY'))")
    List<Integer> findExpiredUnpaidOrderIds(LocalDateTime cutoff);

    @Query("SELECT CASE WHEN COUNT(o) > 0 THEN true ELSE false END FROM TourOrder o JOIN o.details d " +
            "WHERE o.user.id = :userId AND d.tour.id = :tourId AND UPPER(o.status) = 'COMPLETED'")
    boolean hasCompletedTourForUser(Integer userId, Integer tourId);
}
