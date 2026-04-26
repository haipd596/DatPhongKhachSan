package com.rexhotel.booking.room.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record RoomTypeRequest(
    @NotBlank(message = "Tên loại phòng không được để trống")
    String name,

    @NotNull(message = "Giá cơ bản không được để trống")
    @Positive(message = "Giá cơ bản phải lớn hơn 0")
    BigDecimal basePrice,

    @NotNull(message = "Số khách tối đa không được để trống")
    @Min(value = 1, message = "Số khách tối đa phải ít nhất 1")
    Integer maxGuests,

    String description,

    // FEATURE6: imageUrl tuy chon
    String imageUrl
) {}
