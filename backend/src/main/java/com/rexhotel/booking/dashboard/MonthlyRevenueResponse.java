package com.rexhotel.booking.dashboard;

import java.math.BigDecimal;

public record MonthlyRevenueResponse(
    int month,
    String monthName,
    BigDecimal revenue,
    long bookingCount
) {}
