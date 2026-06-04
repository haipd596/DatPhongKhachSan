package com.rexhotel.booking.booking.dto;

import java.time.LocalDate;

import org.springframework.format.annotation.DateTimeFormat;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record HoldBookingRequest(
    @NotNull Long roomId,
    @NotNull @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkInDate,
    @NotNull @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkOutDate,
    @Min(value = 1, message = "Số khách phải lớn hơn hoặc bằng 1") Integer guests,
    Boolean hasBreakfast,   // Buffet sáng +150,000đ/đêm
    Boolean hasTransfer,    // Xe đưa đón +300,000đ (1 lần)
    Boolean hasPetCare      // Chăm sóc thú cưng +100,000đ/đêm
) {}
