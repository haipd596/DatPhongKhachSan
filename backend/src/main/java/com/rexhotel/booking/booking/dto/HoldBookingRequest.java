package com.rexhotel.booking.booking.dto;

import java.time.LocalDate;

import org.springframework.format.annotation.DateTimeFormat;

import jakarta.validation.constraints.NotNull;

public record HoldBookingRequest(
    @NotNull Long roomId,
    @NotNull @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkInDate,
    @NotNull @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkOutDate
) {
}
