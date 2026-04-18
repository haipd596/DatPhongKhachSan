package com.rexhotel.booking.payment;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentTransactionRepository extends JpaRepository<PaymentTransaction, Long> {

    // FEATURE7: Lich su thanh toan cua user
    List<PaymentTransaction> findByBookingUserEmailOrderByCreatedAtDesc(String email);

    Optional<PaymentTransaction> findByTransactionCode(String transactionCode);
}
