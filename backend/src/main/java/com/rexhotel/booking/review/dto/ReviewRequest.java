package com.rexhotel.booking.review.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ReviewRequest(
    @NotNull(message = "Số sao không được để trống")
    @Min(value = 1, message = "Số sao tối thiểu là 1")
    @Max(value = 5, message = "Số sao tối đa là 5")
    Integer rating,

    @NotBlank(message = "Nội dung đánh giá không được để trống")
    @Size(max = 500, message = "Nội dung đánh giá tối đa 500 ký tự")
    String comment
) {
}
