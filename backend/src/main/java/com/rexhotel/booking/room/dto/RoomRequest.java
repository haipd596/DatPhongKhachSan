package com.rexhotel.booking.room.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public record RoomRequest(
    @NotBlank @Pattern(regexp = "^[A-Za-z0-9-]{2,10}$") String code,
    @NotNull @Min(1) Integer floorNumber,
    @NotNull Long roomTypeId,
    @NotBlank String status
) {
}
