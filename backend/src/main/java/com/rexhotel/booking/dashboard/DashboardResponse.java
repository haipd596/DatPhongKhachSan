package com.rexhotel.booking.dashboard;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public record DashboardResponse(
    long totalRooms,
    long availableRooms,
    long confirmedBookings,
    BigDecimal totalRevenue,
    double avgRating,
    // FEATURE4: Thong ke bo sung
    List<MonthlyRevenueResponse> revenueByMonth,
    Map<String, Long> bookingsByStatus
) {}
