package com.rexhotel.booking.booking;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.rexhotel.booking.booking.dto.BookingResponse;
import com.rexhotel.booking.booking.dto.ManagerBookingResponse;
import com.rexhotel.booking.user.CustomerSummaryResponse;
import com.rexhotel.booking.user.UserRepository;
import com.rexhotel.booking.user.UserRole;

/**
 * FEATURE1 + FEATURE8: Manager quan ly booking va khach hang.
 * Tat ca endpoint deu yeu cau role MANAGER (bao ve boi SecurityConfig /api/manager/**).
 */
@RestController
@RequestMapping("/api/manager")
public class ManagerBookingController {

    private final BookingService bookingService;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;

    public ManagerBookingController(BookingService bookingService,
                                    BookingRepository bookingRepository,
                                    UserRepository userRepository) {
        this.bookingService = bookingService;
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
    }

    /**
     * DANG DUOC SUA BOI ANTIGRAVITY: Tich hop Pagination de chong OutOfMemory tren DB lon.
     * GET /api/manager/bookings?status=CONFIRMED&email=abc&page=0&size=10
     */
    @GetMapping("/bookings")
    public ResponseEntity<Page<ManagerBookingResponse>> getAllBookings(
        @RequestParam(required = false) String status,
        @RequestParam(required = false) String email,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkIn,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkOut,
        Pageable pageable
    ) {
        BookingStatus statusEnum = null;
        if (status != null && !status.isBlank()) {
            try {
                statusEnum = BookingStatus.valueOf(status.toUpperCase());
            } catch (IllegalArgumentException ignored) {}
        }
        String emailFilter = (email != null && !email.isBlank()) ? email : null;

        Page<ManagerBookingResponse> result = bookingRepository
            .findAllFiltered(statusEnum, emailFilter, checkIn, checkOut, pageable)
            .map(this::toManagerBookingResponse);
        return ResponseEntity.ok(result);
    }

    /**
     * FEATURE1: Manager check-in booking (CONFIRMED -> CHECKED_IN).
     */
    @PostMapping("/bookings/{id}/check-in")
    public ResponseEntity<BookingResponse> checkIn(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.checkIn(id));
    }

    /**
     * FEATURE1: Manager check-out booking (CHECKED_IN -> CHECKED_OUT).
     */
    @PostMapping("/bookings/{id}/check-out")
    public ResponseEntity<BookingResponse> checkOut(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.checkOut(id));
    }

    /**
     * FEATURE8: Lay danh sach khach hang sap xep theo so booking (co phan trang).
     */
    @GetMapping("/customers")
    public ResponseEntity<Page<CustomerSummaryResponse>> getCustomers(Pageable pageable) {
        Page<CustomerSummaryResponse> result = userRepository
            .findByRoleOrderByBookingCountDesc(UserRole.CUSTOMER, pageable)
            .map(u -> new CustomerSummaryResponse(
                u.getId(), u.getFullName(), u.getEmail(),
                u.getVipLevel().name(), u.getBookingCount()
            ));
        return ResponseEntity.ok(result);
    }

    /**
     * TINH NANG DAT DIEM CAO (BONUS): Thong ke phan tich Doanh Thu cho Giam doc
     * Lay tong doanh thu, so luong booking trong nam.
     */
    @GetMapping("/dashboard/revenue")
    public ResponseEntity<List<Map<String, Object>>> getRevenueAnalytics(@RequestParam(name = "year", defaultValue = "2026") int year) {
        List<Object[]> revenueData = bookingRepository.revenueByMonth(
            List.of(BookingStatus.CONFIRMED, BookingStatus.CHECKED_IN, BookingStatus.CHECKED_OUT),
            year
        );
        
        List<Map<String, Object>> response = revenueData.stream()
            .map(row -> Map.of(
                "month", row[0],
                "totalRevenue", row[1],
                "bookingCount", row[2]
            ))
            .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    private ManagerBookingResponse toManagerBookingResponse(Booking b) {
        return new ManagerBookingResponse(
            b.getId(),
            b.getUser().getFullName(),
            b.getUser().getEmail(),
            b.getUser().getVipLevel().name(),
            b.getRoom().getCode(),
            b.getRoom().getRoomType().getName(),
            b.getCheckInDate(),
            b.getCheckOutDate(),
            b.getStatus().name(),
            b.getTotalAmount(),
            null,
            b.getCreatedAt()
        );
    }
}
