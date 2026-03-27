package com.rexhotel.booking.dashboard;

import java.math.BigDecimal;

public record DashboardResponse(
    long totalRooms,
    long availableRooms,
    long confirmedBookings,
    BigDecimal revenue,
    double avgRating
) {
}
