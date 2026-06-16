package com.rexhotel.booking.dashboard;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Set;

import org.springframework.stereotype.Service;

import com.rexhotel.booking.booking.BookingRepository;
import com.rexhotel.booking.booking.BookingStatus;
import com.rexhotel.booking.review.ReviewRepository;
import com.rexhotel.booking.user.UserRepository;
import com.rexhotel.booking.user.UserRole;

@Service
public class ReportService {

    private static final Set<BookingStatus> REVENUE_STATUSES = Set.of(
        BookingStatus.CONFIRMED, BookingStatus.CHECKED_IN, BookingStatus.CHECKED_OUT
    );

    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;
    private final ReviewRepository reviewRepository;

    public ReportService(UserRepository userRepository,
                         BookingRepository bookingRepository,
                         ReviewRepository reviewRepository) {
        this.userRepository = userRepository;
        this.bookingRepository = bookingRepository;
        this.reviewRepository = reviewRepository;
    }

    public ReportSummaryResponse getReportSummary(LocalDate startDate, LocalDate endDate) {
        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(LocalTime.MAX);

        long newCustomers = userRepository.countByRoleAndCreatedAtBetween(UserRole.CUSTOMER, start, end);
        long bookingsCount = bookingRepository.countByCreatedAtBetween(start, end);
        long cancelledBookingsCount = bookingRepository.countByStatusAndCreatedAtBetween(BookingStatus.CANCELLED, start, end);
        BigDecimal revenue = bookingRepository.sumTotalAmountByStatusInAndCreatedAtBetween(REVENUE_STATUSES, start, end);
        long newReviews = reviewRepository.countByCreatedAtBetween(start, end);

        return new ReportSummaryResponse(
            startDate,
            endDate,
            newCustomers,
            bookingsCount,
            cancelledBookingsCount,
            revenue,
            newReviews
        );
    }
}
