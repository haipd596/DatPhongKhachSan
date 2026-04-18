package com.rexhotel.booking.dashboard;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.Month;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.rexhotel.booking.booking.BookingRepository;
import com.rexhotel.booking.booking.BookingStatus;
import com.rexhotel.booking.review.ReviewService;
import com.rexhotel.booking.room.RoomRepository;
import com.rexhotel.booking.room.RoomStatus;

@Service
public class DashboardService {

    private static final Set<BookingStatus> REVENUE_STATUSES = Set.of(
        BookingStatus.CONFIRMED, BookingStatus.CHECKED_IN, BookingStatus.CHECKED_OUT
    );
    private static final String[] MONTH_NAMES = {
        "", "Thang 1", "Thang 2", "Thang 3", "Thang 4", "Thang 5", "Thang 6",
        "Thang 7", "Thang 8", "Thang 9", "Thang 10", "Thang 11", "Thang 12"
    };

    private final RoomRepository roomRepository;
    private final BookingRepository bookingRepository;
    private final ReviewService reviewService;

    public DashboardService(RoomRepository roomRepository, BookingRepository bookingRepository, ReviewService reviewService) {
        this.roomRepository = roomRepository;
        this.bookingRepository = bookingRepository;
        this.reviewService = reviewService;
    }

    public DashboardResponse getManagerDashboard() {
        long totalRooms = roomRepository.count();
        // BUG5: Dung countByStatus thay vi findByStatus().size()
        long availableRooms = roomRepository.countByStatus(RoomStatus.AVAILABLE);
        long confirmedBookings = bookingRepository.countByStatus(BookingStatus.CONFIRMED);
        BigDecimal totalRevenue = bookingRepository.sumTotalByStatus(BookingStatus.CONFIRMED);

        // FEATURE4: Doanh thu theo thang trong nam hien tai
        int currentYear = LocalDate.now().getYear();
        List<Object[]> rawRevenue = bookingRepository.revenueByMonth(REVENUE_STATUSES, currentYear);
        List<MonthlyRevenueResponse> revenueByMonth = buildMonthlyRevenue(rawRevenue);

        // FEATURE4: Dem booking theo tung status
        Map<String, Long> bookingsByStatus = buildBookingsByStatus();

        return new DashboardResponse(
            totalRooms,
            availableRooms,
            confirmedBookings,
            totalRevenue,
            reviewService.avgRating(),
            revenueByMonth,
            bookingsByStatus
        );
    }

    private List<MonthlyRevenueResponse> buildMonthlyRevenue(List<Object[]> raw) {
        // Map month -> data
        Map<Integer, Object[]> byMonth = raw.stream()
            .collect(Collectors.toMap(row -> ((Number) row[0]).intValue(), row -> row));

        return Arrays.stream(new int[]{1,2,3,4,5,6,7,8,9,10,11,12})
            .mapToObj(m -> {
                Object[] row = byMonth.get(m);
                BigDecimal revenue = row != null ? (BigDecimal) row[1] : BigDecimal.ZERO;
                long count = row != null ? ((Number) row[2]).longValue() : 0L;
                return new MonthlyRevenueResponse(m, MONTH_NAMES[m], revenue, count);
            })
            .toList();
    }

    private Map<String, Long> buildBookingsByStatus() {
        List<Object[]> raw = bookingRepository.countGroupByStatus();
        Map<String, Long> result = new LinkedHashMap<>();
        // Init tat ca status = 0
        for (BookingStatus s : BookingStatus.values()) {
            result.put(s.name(), 0L);
        }
        for (Object[] row : raw) {
            String status = row[0].toString();
            long count = ((Number) row[1]).longValue();
            result.put(status, count);
        }
        return result;
    }
}
