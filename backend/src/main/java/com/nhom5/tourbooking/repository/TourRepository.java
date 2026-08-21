package com.nhom5.tourbooking.repository;

import com.nhom5.tourbooking.entity.Tour;
import com.nhom5.tourbooking.entity.TourStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface TourRepository extends JpaRepository<Tour, Integer> {
    List<Tour> findByCategoryCategoryId(Integer categoryId);

    @Query("SELECT t FROM Tour t WHERE t.tourName LIKE %:keyword% OR t.departureLocation LIKE %:keyword%")
    List<Tour> searchByKeyword(@Param("keyword") String keyword);

    @Query("SELECT t FROM Tour t WHERE (:categoryId IS NULL OR t.category.categoryId = :categoryId) AND (:minPrice IS NULL OR t.price >= :minPrice) AND (:maxPrice IS NULL OR t.price <= :maxPrice)")
    List<Tour> filterTours(@Param("categoryId") Integer categoryId, @Param("minPrice") BigDecimal minPrice, @Param("maxPrice") BigDecimal maxPrice);

    List<Tour> findByStatus(TourStatus status);

    @Query("SELECT t FROM Tour t WHERE t.price BETWEEN :minPrice AND :maxPrice AND t.status = 'ACTIVE'")
    List<Tour> findByPriceBetweenAndStatusActive(@Param("minPrice") BigDecimal minPrice, @Param("maxPrice") BigDecimal maxPrice);
}
