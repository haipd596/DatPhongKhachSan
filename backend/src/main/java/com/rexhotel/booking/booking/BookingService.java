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
import com.rexhotel.booking.notification.BookingNotificationService;
import com.rexhotel.booking.payment.PaymentStatus;
import com.rexhotel.booking.payment.PaymentTransaction;
import com.rexhotel.booking.payment.PaymentTransactionRepository;
import com.rexhotel.booking.room.Room;
import com.rexhotel.booking.room.RoomRepository;
import com.rexhotel.booking.room.RoomStatus;
import com.rexhotel.booking.user.User;
import com.rexhotel.booking.user.UserRepository;
import com.rexhotel.booking.user.VipPolicyService;

@Service
public class BookingService {

    private static final Set<BookingStatus> BLOCKING_STATUSES = Set.of(
        BookingStatus.HOLD, BookingStatus.CONFIRMED, BookingStatus.CHECKED_IN
    );

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final RoomRepository roomRepository;
    private final VipPolicyService vipPolicyService;
    private final BookingNotificationService bookingNotificationService;
    private final RefundPolicyService refundPolicyService;
    private final PaymentTransactionRepository paymentTransactionRepository;
    private final long holdMinutes;

    public BookingService(BookingRepository bookingRepository,
                          UserRepository userRepository,
                          RoomRepository roomRepository,
                          VipPolicyService vipPolicyService,
                          BookingNotificationService bookingNotificationService,
                          RefundPolicyService refundPolicyService,
                          PaymentTransactionRepository paymentTransactionRepository,
                          @Value("${app.booking.hold-minutes:10}") long holdMinutes) {
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
        this.roomRepository = roomRepository;
        this.vipPolicyService = vipPolicyService;
        this.bookingNotificationService = bookingNotificationService;
        this.refundPolicyService = refundPolicyService;
        this.paymentTransactionRepository = paymentTransactionRepository;
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

        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new ApiException("Khong tim thay user"));
            
        // BÀI TOÁN 4: Chống Race Condition Double Booking bằng Pessimistic Write Lock
        // Dùng locking trực tiếp tại CSDL để ngăn chặn 2 thread đọc/ghi cùng lúc vào 1 phòng
        Room room = roomRepository.findByIdForUpdate(request.roomId())
            .orElseThrow(() -> new ApiException("Khong tim thay phong"));
            
        if (room.getStatus() != RoomStatus.AVAILABLE) {
            throw new ApiException("Phong dang bao tri hoac khong kha dung");
        }
        
        // BÀI TOÁN 6: Kiểm tra sức chứa tối đa của phòng
        if (request.guests() > room.getRoomType().getMaxGuests()) {
            throw new ApiException("So khach (" + request.guests() + ") vuot qua suc chua toi da cua phong (" + room.getRoomType().getMaxGuests() + ")");
        }

        long overlapping = bookingRepository.countOverlapping(room.getId(), BLOCKING_STATUSES, checkIn, checkOut);
        if (overlapping > 0) {
            throw new ApiException("Phong da duoc dat hoac dang giu o khung thoi gian nay");
        }

        long nights = ChronoUnit.DAYS.between(checkIn, checkOut);
        BigDecimal basePrice = room.getRoomType().getBasePrice().multiply(BigDecimal.valueOf(nights));
        
        // BÀI TOÁN C: Tính thuế VAT và Phí
        BigDecimal discountedPrice = vipPolicyService.applyDiscount(basePrice, user.getVipLevel());
        BigDecimal vatAmount = discountedPrice.multiply(new BigDecimal("0.10")); // 10% VAT
        BigDecimal total = discountedPrice.add(vatAmount);

        Booking booking = new Booking(user, room, checkIn, checkOut, BookingStatus.HOLD, total);
        booking.setHoldExpiresAt(LocalDateTime.now().plusMinutes(holdMinutes));
        bookingRepository.save(booking);
        bookingNotificationService.sendHoldConfirmation(booking);
        return toResponse(booking);
    }

    public List<BookingResponse> myBookings(String email) {
        return bookingRepository.findByUserEmailOrderByCreatedAtDesc(email)
            .stream().map(this::toResponse).toList();
    }

    public Booking getOwnedBooking(Long bookingId, String email) {
        return bookingRepository.findByIdAndUserEmail(bookingId, email)
            .orElseThrow(() -> new ApiException("Khong tim thay booking"));
    }

    public Booking getBookingById(Long bookingId) {
        return bookingRepository.findById(bookingId)
            .orElseThrow(() -> new ApiException("Khong tim thay booking"));
    }

    @Transactional
    public BookingResponse cancel(Long bookingId, String email) {
        Booking booking = bookingRepository.findByIdAndUserEmail(bookingId, email)
            .orElseThrow(() -> new ApiException("Khong tim thay booking"));

        BookingStatus status = booking.getStatus();
        if (status == BookingStatus.CANCELLED || status == BookingStatus.EXPIRED) {
            throw new ApiException("Booking da o trang thai huy/het han");
        }
        if (status == BookingStatus.CHECKED_IN || status == BookingStatus.CHECKED_OUT) {
            throw new ApiException("Khong the huy booking khi khach da check-in");
        }

        // FEATURE3 + BUG4: Neu da CONFIRMED thi tinh hoan tien + giam bookingCount
        BigDecimal refundAmount = BigDecimal.ZERO;
        if (status == BookingStatus.CONFIRMED) {
            // FEATURE3: Tinh so tien hoan tra theo chinh sach
            refundAmount = refundPolicyService.calculateRefund(booking.getTotalAmount(), booking.getCheckInDate());
            if (refundAmount.compareTo(BigDecimal.ZERO) > 0) {
                String txCode = "REFUND-" + bookingId + "-" + System.currentTimeMillis();
                PaymentTransaction refundTx = new PaymentTransaction(booking, refundAmount, PaymentStatus.REFUNDED, txCode);
                paymentTransactionRepository.save(refundTx);
            }
            // BUG4: Giam bookingCount khi huy booking da confirmed
            User user = booking.getUser();
            int newCount = Math.max(0, user.getBookingCount() - 1);
            user.setBookingCount(newCount);
            user.setVipLevel(vipPolicyService.calculateLevel(newCount));
            userRepository.save(user);
        }

        booking.setStatus(BookingStatus.CANCELLED);
        booking.setHoldExpiresAt(null);
        bookingRepository.save(booking);
        bookingNotificationService.sendBookingCancelled(booking);
        return toResponseWithRefund(booking, refundAmount);
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
        User user = booking.getUser();
        int newCount = user.getBookingCount() + 1;
        user.setBookingCount(newCount);
        user.setVipLevel(vipPolicyService.calculateLevel(newCount));
        userRepository.save(user);
        bookingRepository.save(booking);
        bookingNotificationService.sendBookingConfirmed(booking);
        return booking;
    }

    // FEATURE1: Manager check-in (CONFIRMED -> CHECKED_IN)
    @Transactional
    public BookingResponse checkIn(Long bookingId) {
        Booking booking = getBookingById(bookingId);
        if (booking.getStatus() != BookingStatus.CONFIRMED) {
            throw new ApiException("Chi co the check-in booking o trang thai CONFIRMED (hien tai: " + booking.getStatus() + ")");
        }
        if (booking.getCheckInDate().isAfter(LocalDate.now())) {
            throw new ApiException("Chua den ngay check-in (" + booking.getCheckInDate() + ")");
        }
        booking.setStatus(BookingStatus.CHECKED_IN);
        bookingRepository.save(booking);
        return toResponse(booking);
    }

    // FEATURE1: Manager check-out (CHECKED_IN -> CHECKED_OUT)
    @Transactional
    public BookingResponse checkOut(Long bookingId) {
        Booking booking = getBookingById(bookingId);
        if (booking.getStatus() != BookingStatus.CHECKED_IN) {
            throw new ApiException("Chi co the check-out booking o trang thai CHECKED_IN (hien tai: " + booking.getStatus() + ")");
        }
        booking.setStatus(BookingStatus.CHECKED_OUT);
        bookingRepository.save(booking);
        return toResponse(booking);
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
        return toResponseWithRefund(booking, null);
    }

    public BookingResponse toResponseWithRefund(Booking booking, BigDecimal refundAmount) {
        return new BookingResponse(
            booking.getId(),
            booking.getRoom().getCode(),
            booking.getRoom().getRoomType().getName(),
            booking.getCheckInDate(),
            booking.getCheckOutDate(),
            booking.getStatus().name(),
            booking.getTotalAmount(),
            refundAmount,
            booking.getHoldExpiresAt(),
            booking.getCreatedAt()
        );
    }
}
