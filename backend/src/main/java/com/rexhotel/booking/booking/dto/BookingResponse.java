package com.rexhotel.booking.booking.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record BookingResponse(
    Long id,
    String roomCode,
    String roomTypeName,
    LocalDate checkInDate,
    LocalDate checkOutDate,
    String status,
    BigDecimal totalAmount,
    LocalDateTime holdExpiresAt,
    LocalDateTime createdAt
) {
}
