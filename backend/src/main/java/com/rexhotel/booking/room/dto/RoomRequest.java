package com.rexhotel.booking.room.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public record RoomRequest(
    @NotBlank(message = "Mã phòng không được để trống")
    @Pattern(regexp = "^[A-Za-z0-9-]{2,10}$", message = "Mã phòng chỉ gồm chữ, số, dấu gạch ngang và dài 2-10 ký tự")
    String code,

    @NotNull(message = "Tầng không được để trống")
    @Min(value = 1, message = "Tầng phải lớn hơn hoặc bằng 1")
    Integer floorNumber,

    @NotNull(message = "Loại phòng không được để trống")
    Long roomTypeId,

    @NotBlank(message = "Trạng thái phòng không được để trống")
    String status
) {
}
