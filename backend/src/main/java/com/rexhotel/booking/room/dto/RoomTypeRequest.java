package com.rexhotel.booking.room.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record RoomTypeRequest(
    @NotBlank(message = "Ten loai phong khong duoc de trong")
    String name,

    @NotNull(message = "Gia co ban khong duoc de trong")
    @Positive(message = "Gia co ban phai lon hon 0")
    BigDecimal basePrice,

    @NotNull(message = "So khach toi da khong duoc de trong")
    @Min(value = 1, message = "So khach toi da phai it nhat 1")
    Integer maxGuests,

    String description,

    // FEATURE6: imageUrl tuy chon
    String imageUrl
) {}
