package vn.dulichviet.tourbooking.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import vn.dulichviet.tourbooking.entity.PasswordResetToken;
import vn.dulichviet.tourbooking.entity.User;

import java.util.Optional;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {

    Optional<PasswordResetToken> findByTokenHashAndTypeAndIsUsedFalse(String tokenHash, String type);

    Optional<PasswordResetToken> findFirstByTargetAndTypeAndIsUsedFalseOrderByCreatedAtDesc(String target, String type);

    Optional<PasswordResetToken> findFirstByUserAndTypeAndIsUsedFalseOrderByCreatedAtDesc(User user, String type);

    @Modifying
    @Query("UPDATE PasswordResetToken t SET t.isUsed = true WHERE t.user.id = :userId AND t.isUsed = false")
    void invalidateAllActiveTokensByUserId(@Param("userId") Integer userId);
}

