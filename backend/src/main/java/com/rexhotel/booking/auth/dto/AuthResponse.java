package com.rexhotel.booking.auth.dto;

public record AuthResponse(
    String accessToken,
    String refreshToken,
    String email,
    String fullName,
    String role,
    String vipLevel
) {}
