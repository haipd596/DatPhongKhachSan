package com.rexhotel.booking.payment;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.rexhotel.booking.booking.Booking;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "payment_transactions")
public class PaymentTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PaymentStatus status;

    @Column(nullable = false, length = 40)
    private String transactionCode;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    public PaymentTransaction() {
    }

    public PaymentTransaction(Booking booking, BigDecimal amount, PaymentStatus status, String transactionCode) {
        this.booking = booking;
        this.amount = amount;
        this.status = status;
        this.transactionCode = transactionCode;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }
}
