package com.rexhotel.booking.user;

public record CustomerSummaryResponse(
    Long id,
    String fullName,
    String email,
    String vipLevel,
    int bookingCount
) {}
