package vn.dulichviet.tourbooking.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import vn.dulichviet.tourbooking.entity.Category;

public interface CategoryRepository extends JpaRepository<Category, Integer> {
    @Query("SELECT COUNT(t) FROM Tour t WHERE t.category.id = :categoryId")
    long countToursByCategoryId(@Param("categoryId") Integer categoryId);
}
