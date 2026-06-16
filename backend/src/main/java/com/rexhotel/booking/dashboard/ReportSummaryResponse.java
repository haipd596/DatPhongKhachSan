package com.rexhotel.booking.dashboard;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ReportSummaryResponse(
    LocalDate startDate,
    LocalDate endDate,
    long newCustomersCount,
    long bookingsCount,
    long cancelledBookingsCount,
    BigDecimal revenue,
    long newReviewsCount
) {}
