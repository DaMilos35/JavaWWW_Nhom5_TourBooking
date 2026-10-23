package vn.dulichviet.tourbooking.repository;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import vn.dulichviet.tourbooking.entity.TourOrder;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface TourOrderRepository extends JpaRepository<TourOrder, Integer> {
    @EntityGraph(attributePaths = {"details", "details.tour"})
    @Query("SELECT o FROM TourOrder o WHERE o.user.id = :userId ORDER BY o.orderDate DESC")
    List<TourOrder> findByUserIdWithDetails(Integer userId);

    @EntityGraph(attributePaths = {"user", "details", "details.tour"})
    @Query("SELECT o FROM TourOrder o ORDER BY o.orderDate DESC")
    List<TourOrder> findAllWithDetails();

    @EntityGraph(attributePaths = {"user", "details", "details.tour"})
    @Query("SELECT o FROM TourOrder o WHERE o.id = :id")
    Optional<TourOrder> findByIdWithDetails(Integer id);

    @Query("SELECT COUNT(o) FROM TourOrder o")
    long countOrders();

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM TourOrder o WHERE o.status IN ('CONFIRMED', 'COMPLETED', 'PAID')")
    BigDecimal sumRevenue();

    Optional<TourOrder> findByOrderCode(String orderCode);
}
