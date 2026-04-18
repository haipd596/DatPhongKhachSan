package com.rexhotel.booking.booking.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record ManagerBookingResponse(
    Long id,
    String customerName,
    String customerEmail,
    String vipLevel,
    String roomCode,
    String roomTypeName,
    LocalDate checkInDate,
    LocalDate checkOutDate,
    String status,
    BigDecimal totalAmount,
    BigDecimal refundAmount,
    LocalDateTime createdAt
) {}
