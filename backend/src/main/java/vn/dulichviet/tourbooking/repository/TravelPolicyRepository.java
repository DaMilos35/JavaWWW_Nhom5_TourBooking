package vn.dulichviet.tourbooking.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.dulichviet.tourbooking.entity.TravelPolicy;
import java.util.List;
import java.util.Optional;

public interface TravelPolicyRepository extends JpaRepository<TravelPolicy, Long> {
    List<TravelPolicy> findByCompanyId(Long companyId);
    Optional<TravelPolicy> findByCompanyIdAndIsDefaultTrue(Long companyId);
}
