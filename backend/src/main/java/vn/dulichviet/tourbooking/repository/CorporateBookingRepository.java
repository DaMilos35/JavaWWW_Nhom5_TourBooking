package vn.dulichviet.tourbooking.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import vn.dulichviet.tourbooking.entity.CorporateBooking;
import java.util.List;
import java.util.Optional;

public interface CorporateBookingRepository extends JpaRepository<CorporateBooking, Long> {
    Optional<CorporateBooking> findByBookingCode(String bookingCode);
    Page<CorporateBooking> findByCompanyId(Long companyId, Pageable pageable);
    List<CorporateBooking> findByCompanyIdAndBookingStatus(Long companyId, String status);

    @Query("SELECT cb FROM CorporateBooking cb JOIN FETCH cb.tour JOIN FETCH cb.booker WHERE cb.company.id = :companyId ORDER BY cb.createdAt DESC")
    Page<CorporateBooking> findByCompanyIdWithDetails(@Param("companyId") Long companyId, Pageable pageable);
}
