package com.rexhotel.booking.room.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record RoomTypeRequest(
    @NotBlank @Size(max = 80) String name,
    @NotNull @DecimalMin("1") BigDecimal basePrice,
    @NotNull @Min(1) Integer maxGuests,
    @Size(max = 300) String description
) {
}
