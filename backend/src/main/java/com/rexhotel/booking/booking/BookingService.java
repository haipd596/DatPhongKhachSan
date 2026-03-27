package com.rexhotel.booking.booking;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Set;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.rexhotel.booking.booking.dto.BookingResponse;
import com.rexhotel.booking.booking.dto.HoldBookingRequest;
import com.rexhotel.booking.common.ApiException;
import com.rexhotel.booking.room.Room;
import com.rexhotel.booking.room.RoomRepository;
import com.rexhotel.booking.room.RoomStatus;
import com.rexhotel.booking.user.User;
import com.rexhotel.booking.user.UserRepository;

@Service
public class BookingService {

    private static final Set<BookingStatus> BLOCKING_STATUSES = Set.of(BookingStatus.HOLD, BookingStatus.CONFIRMED);

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final RoomRepository roomRepository;
    private final long holdMinutes;

    public BookingService(BookingRepository bookingRepository,
                          UserRepository userRepository,
                          RoomRepository roomRepository,
                          @Value("${app.booking.hold-minutes:10}") long holdMinutes) {
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
        this.roomRepository = roomRepository;
        this.holdMinutes = holdMinutes;
    }

    @Transactional
    public BookingResponse holdRoom(String email, HoldBookingRequest request) {
        LocalDate checkIn = request.checkInDate();
        LocalDate checkOut = request.checkOutDate();
        if (checkIn == null || checkOut == null || !checkIn.isBefore(checkOut)) {
            throw new ApiException("Ngay nhan/tra phong khong hop le");
        }
        if (checkIn.isBefore(LocalDate.now())) {
            throw new ApiException("Khong the dat phong trong qua khu");
        }

        User user = userRepository.findByEmail(email).orElseThrow(() -> new ApiException("Khong tim thay user"));
        Room room = roomRepository.findById(request.roomId()).orElseThrow(() -> new ApiException("Khong tim thay phong"));
        if (room.getStatus() != RoomStatus.AVAILABLE) {
            throw new ApiException("Phong hien khong kha dung");
        }

        long overlapping = bookingRepository.countOverlapping(room.getId(), BLOCKING_STATUSES, checkIn, checkOut);
        if (overlapping > 0) {
            throw new ApiException("Phong da duoc dat hoac dang giu o khung thoi gian nay");
        }

        long nights = ChronoUnit.DAYS.between(checkIn, checkOut);
        BigDecimal total = room.getRoomType().getBasePrice().multiply(BigDecimal.valueOf(nights));

        Booking booking = new Booking(user, room, checkIn, checkOut, BookingStatus.HOLD, total);
        booking.setHoldExpiresAt(LocalDateTime.now().plusMinutes(holdMinutes));
        bookingRepository.save(booking);
        return toResponse(booking);
    }

    public List<BookingResponse> myBookings(String email) {
        return bookingRepository.findByUserEmailOrderByCreatedAtDesc(email).stream().map(this::toResponse).toList();
    }

    @Transactional
    public BookingResponse cancel(Long bookingId, String email) {
        Booking booking = bookingRepository.findByIdAndUserEmail(bookingId, email)
            .orElseThrow(() -> new ApiException("Khong tim thay booking"));
        if (booking.getStatus() == BookingStatus.CANCELLED || booking.getStatus() == BookingStatus.EXPIRED) {
            throw new ApiException("Booking da o trang thai huy/het han");
        }
        booking.setStatus(BookingStatus.CANCELLED);
        booking.setHoldExpiresAt(null);
        bookingRepository.save(booking);
        return toResponse(booking);
    }

    @Transactional
    public Booking confirmPaymentSuccess(Long bookingId, String email) {
        Booking booking = bookingRepository.findByIdAndUserEmail(bookingId, email)
            .orElseThrow(() -> new ApiException("Khong tim thay booking"));
        if (booking.getStatus() != BookingStatus.HOLD) {
            throw new ApiException("Booking khong o trang thai cho thanh toan");
        }
        if (booking.getHoldExpiresAt() != null && booking.getHoldExpiresAt().isBefore(LocalDateTime.now())) {
            booking.setStatus(BookingStatus.EXPIRED);
            booking.setHoldExpiresAt(null);
            bookingRepository.save(booking);
            throw new ApiException("Booking da het thoi gian giu phong");
        }
        booking.setStatus(BookingStatus.CONFIRMED);
        booking.setHoldExpiresAt(null);
        bookingRepository.save(booking);
        return booking;
    }

    @Transactional
    public int expireOldHolds() {
        List<Booking> expired = bookingRepository.findByStatusAndHoldExpiresAtBefore(BookingStatus.HOLD, LocalDateTime.now());
        expired.forEach(booking -> {
            booking.setStatus(BookingStatus.EXPIRED);
            booking.setHoldExpiresAt(null);
        });
        bookingRepository.saveAll(expired);
        return expired.size();
    }

    public BookingResponse toResponse(Booking booking) {
        return new BookingResponse(
            booking.getId(),
            booking.getRoom().getCode(),
            booking.getRoom().getRoomType().getName(),
            booking.getCheckInDate(),
            booking.getCheckOutDate(),
            booking.getStatus().name(),
            booking.getTotalAmount(),
            booking.getHoldExpiresAt(),
            booking.getCreatedAt()
        );
    }
}
