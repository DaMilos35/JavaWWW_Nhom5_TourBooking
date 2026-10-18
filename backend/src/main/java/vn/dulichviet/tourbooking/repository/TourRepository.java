package vn.dulichviet.tourbooking.repository;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import vn.dulichviet.tourbooking.entity.Tour;

import java.util.List;
import java.util.Optional;

public interface TourRepository extends JpaRepository<Tour, Integer>, JpaSpecificationExecutor<Tour> {
    List<Tour> findByStatus(String status);
    List<Tour> findByCategoryId(Integer categoryId);
    List<Tour> findByCategoryIdAndStatus(Integer categoryId, String status);
    List<Tour> findByNameContainingIgnoreCase(String keyword);
    List<Tour> findByNameContainingIgnoreCaseAndStatus(String keyword, String status);
    long countByCategoryId(Integer categoryId);
    long countByCategoryIdAndStatus(Integer categoryId, String status);
    long countByProviderId(Integer providerId);

    @Query("SELECT t.category.id, COUNT(t) FROM Tour t GROUP BY t.category.id")
    List<Object[]> countToursGroupedByCategory();

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT t FROM Tour t WHERE t.id = :id")
    Optional<Tour> findByIdForUpdate(@Param("id") Integer id);
}
