package vn.dulichviet.tourbooking.repository;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import vn.dulichviet.tourbooking.entity.TourReview;

import java.util.List;

public interface TourReviewRepository extends JpaRepository<TourReview, Integer> {
    @EntityGraph(attributePaths = "user")
    List<TourReview> findByTour_IdOrderByCreatedAtDesc(Integer tourId);

    boolean existsByTour_IdAndUser_Id(Integer tourId, Integer userId);
}
