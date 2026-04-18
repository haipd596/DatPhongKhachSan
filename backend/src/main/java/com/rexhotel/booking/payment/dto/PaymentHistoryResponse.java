package com.rexhotel.booking.payment.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record PaymentHistoryResponse(
    Long id,
    Long bookingId,
    String roomCode,
    String roomTypeName,
    BigDecimal amount,
    String status,
    String transactionCode,
    LocalDateTime createdAt
) {}
