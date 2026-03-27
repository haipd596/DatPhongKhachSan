package com.rexhotel.booking.review.dto;

import java.time.LocalDateTime;

public record ReviewResponse(
    Long id,
    String fullName,
    Integer rating,
    String comment,
    LocalDateTime createdAt
) {
}
