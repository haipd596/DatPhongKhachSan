package com.rexhotel.booking.booking;

import java.time.LocalDate;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

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
     * FEATURE8: Lay danh sach tat ca booking voi filter.
     * GET /api/manager/bookings?status=CONFIRMED&email=abc&checkIn=2026-04-01&checkOut=2026-04-30
     */
    @GetMapping("/bookings")
    public ResponseEntity<List<ManagerBookingResponse>> getAllBookings(
        @RequestParam(required = false) String status,
        @RequestParam(required = false) String email,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkIn,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkOut
    ) {
        BookingStatus statusEnum = null;
        if (status != null && !status.isBlank()) {
            try {
                statusEnum = BookingStatus.valueOf(status.toUpperCase());
            } catch (IllegalArgumentException ignored) {}
        }
        String emailFilter = (email != null && !email.isBlank()) ? email : null;

        List<ManagerBookingResponse> result = bookingRepository
            .findAllFiltered(statusEnum, emailFilter, checkIn, checkOut)
            .stream()
            .map(this::toManagerBookingResponse)
            .toList();
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
     * FEATURE8: Lay danh sach khach hang sap xep theo so booking.
     */
    @GetMapping("/customers")
    public ResponseEntity<List<CustomerSummaryResponse>> getCustomers() {
        List<CustomerSummaryResponse> result = userRepository
            .findByRoleOrderByBookingCountDesc(UserRole.CUSTOMER)
            .stream()
            .map(u -> new CustomerSummaryResponse(
                u.getId(), u.getFullName(), u.getEmail(),
                u.getVipLevel().name(), u.getBookingCount()
            ))
            .toList();
        return ResponseEntity.ok(result);
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
