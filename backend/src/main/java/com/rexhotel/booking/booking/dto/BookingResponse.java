package com.rexhotel.booking.booking.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record BookingResponse(
    Long id,
    Long roomId,
    String roomCode,
    String roomTypeName,
    BigDecimal roomBasePrice,
    LocalDate checkInDate,
    LocalDate checkOutDate,
    String status,
    BigDecimal totalAmount,
    BigDecimal refundAmount,
    LocalDateTime holdExpiresAt,
    LocalDateTime createdAt,
    // Dịch vụ bổ sung
    boolean hasBreakfast,
    boolean hasTransfer,
    boolean hasPetCare,
    BigDecimal extraFee
) {}
