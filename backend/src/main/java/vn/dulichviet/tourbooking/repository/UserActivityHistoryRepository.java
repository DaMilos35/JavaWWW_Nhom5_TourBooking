package vn.dulichviet.tourbooking.repository;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import vn.dulichviet.tourbooking.entity.UserActivityHistory;

import java.util.List;

@Repository
public interface UserActivityHistoryRepository extends JpaRepository<UserActivityHistory, Long> {

    /** Lấy lịch sử tương tác gần nhất của User */
    @Query("SELECT h FROM UserActivityHistory h JOIN FETCH h.tour t LEFT JOIN FETCH t.category WHERE h.user.id = :userId ORDER BY h.createdAt DESC")
    List<UserActivityHistory> findRecentByUserId(@Param("userId") Integer userId, Pageable pageable);

    /** Lấy lịch sử tương tác gần nhất của Guest theo SessionId */
    @Query("SELECT h FROM UserActivityHistory h JOIN FETCH h.tour t LEFT JOIN FETCH t.category WHERE h.sessionId = :sessionId ORDER BY h.createdAt DESC")
    List<UserActivityHistory> findRecentBySessionId(@Param("sessionId") String sessionId, Pageable pageable);

    /** Tìm danh mục mà User quan tâm nhiều nhất (tính theo tổng điểm hành vi VIEW=1, CART=3, BOOK=5) */
    @Query("SELECT h.tour.category.id FROM UserActivityHistory h WHERE h.user.id = :userId AND h.tour.category IS NOT NULL GROUP BY h.tour.category.id ORDER BY SUM(h.score) DESC")
    List<Integer> findTopCategoryIdsByUserId(@Param("userId") Integer userId, Pageable pageable);

    /** Tìm danh mục mà Guest quan tâm nhiều nhất theo SessionId */
    @Query("SELECT h.tour.category.id FROM UserActivityHistory h WHERE h.sessionId = :sessionId AND h.tour.category IS NOT NULL GROUP BY h.tour.category.id ORDER BY SUM(h.score) DESC")
    List<Integer> findTopCategoryIdsBySessionId(@Param("sessionId") String sessionId, Pageable pageable);

    /** Đếm tổng số đơn đã đặt của người dùng (phục vụ Safe Delete cho Admin: chỉ xóa nếu chưa đặt tour lần nào) */
    @Query("SELECT COUNT(h) FROM UserActivityHistory h WHERE h.user.id = :userId AND h.activityType = 'BOOK'")
    long countBookingsByUserId(@Param("userId") Integer userId);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    @Query("DELETE FROM UserActivityHistory h WHERE h.tour.id = :tourId")
    void deleteByTourId(@Param("tourId") Integer tourId);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    @Query("DELETE FROM UserActivityHistory h WHERE h.user.id = :userId")
    void deleteByUserId(@Param("userId") Integer userId);
}
