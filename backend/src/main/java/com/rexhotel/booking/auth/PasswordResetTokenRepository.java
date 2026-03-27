package com.rexhotel.booking.auth;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {
    Optional<PasswordResetToken> findTopByCodeAndUsedFalseOrderByIdDesc(String code);
}
