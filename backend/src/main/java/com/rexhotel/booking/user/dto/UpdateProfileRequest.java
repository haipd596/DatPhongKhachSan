package com.rexhotel.booking.user.dto;

import java.time.LocalDate;

public record UpdateProfileRequest(
    String fullName,
    String phone,
    String gender,
    LocalDate dateOfBirth,
    String avatarUrl
) {}
