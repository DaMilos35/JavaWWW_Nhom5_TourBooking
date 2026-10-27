package vn.dulichviet.tourbooking.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import vn.dulichviet.tourbooking.entity.Company;
import java.util.List;
import java.util.Optional;

public interface CompanyRepository extends JpaRepository<Company, Long> {
    Optional<Company> findByTaxCode(String taxCode);
    Optional<Company> findByEmailDomain(String emailDomain);
    boolean existsByTaxCode(String taxCode);
    List<Company> findByKybStatus(String kybStatus);
    List<Company> findByIsActiveTrue();
}
