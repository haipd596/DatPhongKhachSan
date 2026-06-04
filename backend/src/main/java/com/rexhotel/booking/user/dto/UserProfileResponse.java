package com.rexhotel.booking.user.dto;

import java.time.LocalDate;

public record UserProfileResponse(
    Long id,
    String email,
    String fullName,
    String phone,
    String gender,
    LocalDate dateOfBirth,
    String avatarUrl,
    String vipLevel,
    Integer bookingCount
) {}
