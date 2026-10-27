package vn.dulichviet.tourbooking.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import vn.dulichviet.tourbooking.entity.CorporateUser;
import java.util.List;
import java.util.Optional;

public interface CorporateUserRepository extends JpaRepository<CorporateUser, Long> {
    Optional<CorporateUser> findByUserIdAndCompanyId(Integer userId, Long companyId);
    List<CorporateUser> findByCompanyIdAndCorpRole(Long companyId, String corpRole);
    List<CorporateUser> findByCompanyId(Long companyId);

    @Query("SELECT cu FROM CorporateUser cu WHERE cu.manager.id = :managerId AND cu.isActive = true")
    List<CorporateUser> findByManagerId(@Param("managerId") Long managerId);

    @Query("SELECT cu FROM CorporateUser cu JOIN FETCH cu.user WHERE cu.company.id = :companyId AND cu.corpRole IN ('MANAGER','COMPANY_ADMIN')")
    List<CorporateUser> findApproversByCompanyId(@Param("companyId") Long companyId);
}
