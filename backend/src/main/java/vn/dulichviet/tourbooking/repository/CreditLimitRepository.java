package vn.dulichviet.tourbooking.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.dulichviet.tourbooking.entity.CreditLimit;
import java.util.Optional;
import java.util.List;

public interface CreditLimitRepository extends JpaRepository<CreditLimit, Long> {
    Optional<CreditLimit> findByCompanyId(Long companyId);
    List<CreditLimit> findByAccountStatusIn(List<String> statuses);
}
