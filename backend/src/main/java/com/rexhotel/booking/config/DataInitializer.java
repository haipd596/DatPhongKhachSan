package com.rexhotel.booking.config;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.rexhotel.booking.booking.Booking;
import com.rexhotel.booking.booking.BookingRepository;
import com.rexhotel.booking.booking.BookingStatus;
import com.rexhotel.booking.payment.PaymentStatus;
import com.rexhotel.booking.payment.PaymentTransaction;
import com.rexhotel.booking.payment.PaymentTransactionRepository;
import com.rexhotel.booking.review.Review;
import com.rexhotel.booking.review.ReviewRepository;
import com.rexhotel.booking.room.Room;
import com.rexhotel.booking.room.RoomRepository;
import com.rexhotel.booking.room.RoomType;
import com.rexhotel.booking.room.RoomTypeRepository;
import com.rexhotel.booking.user.User;
import com.rexhotel.booking.user.UserRepository;
import com.rexhotel.booking.user.UserRole;
import com.rexhotel.booking.user.VipPolicyService;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final RoomTypeRepository roomTypeRepository;
    private final RoomRepository roomRepository;
    private final BookingRepository bookingRepository;
    private final PaymentTransactionRepository paymentTransactionRepository;
    private final ReviewRepository reviewRepository;
    private final VipPolicyService vipPolicyService;

    public DataInitializer(UserRepository userRepository,
                           PasswordEncoder passwordEncoder,
                           RoomTypeRepository roomTypeRepository,
                           RoomRepository roomRepository,
                           BookingRepository bookingRepository,
                           PaymentTransactionRepository paymentTransactionRepository,
                           ReviewRepository reviewRepository,
                           VipPolicyService vipPolicyService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.roomTypeRepository = roomTypeRepository;
        this.roomRepository = roomRepository;
        this.bookingRepository = bookingRepository;
        this.paymentTransactionRepository = paymentTransactionRepository;
        this.reviewRepository = reviewRepository;
        this.vipPolicyService = vipPolicyService;
    }

    @Override
    public void run(String... args) {
        upsertManager();
        User customerA = upsertCustomer("customer1@rex.local", "Khach Demo A", 1);
        User customerB = upsertCustomer("customer2@rex.local", "Khach Demo B", 3);
        User customerC = upsertCustomer("customer3@rex.local", "Khach Demo C", 6);
        seedRooms();
        seedBookings(customerA, customerB, customerC);
        seedReviews(customerA, customerB, customerC);
    }

    private User upsertManager() {
        return userRepository.findByEmail("manager@rex.local").orElseGet(() -> {
            User manager = new User(
                "manager@rex.local",
                passwordEncoder.encode("Manager@123"),
                "Rex Manager",
                UserRole.MANAGER
            );
            return userRepository.save(manager);
        });
    }

    private User upsertCustomer(String email, String fullName, int bookingCount) {
        User user = userRepository.findByEmail(email).orElseGet(() -> {
            User created = new User(
                email,
                passwordEncoder.encode("Customer@123"),
                fullName,
                UserRole.CUSTOMER
            );
            return userRepository.save(created);
        });
        user.setBookingCount(bookingCount);
        user.setVipLevel(vipPolicyService.calculateLevel(bookingCount));
        return userRepository.save(user);
    }

    private void seedRooms() {
        RoomType standard = upsertRoomType("Standard", BigDecimal.valueOf(1100000), 2, "Phong tieu chuan, day du tien nghi");
        RoomType deluxe = upsertRoomType("Deluxe", BigDecimal.valueOf(1500000), 2, "Phong cao cap cho 2 khach");
        RoomType suite = upsertRoomType("Suite", BigDecimal.valueOf(2500000), 3, "Phong suite rong voi view dep");

        upsertRoom("S101", 1, standard);
        upsertRoom("S102", 1, standard);
        upsertRoom("D201", 2, deluxe);
        upsertRoom("D202", 2, deluxe);
        upsertRoom("D203", 2, deluxe);
        upsertRoom("S301", 3, suite);
        upsertRoom("S302", 3, suite);
    }

    private RoomType upsertRoomType(String name, BigDecimal basePrice, int maxGuests, String description) {
        return roomTypeRepository.findByNameIgnoreCase(name).orElseGet(() -> roomTypeRepository.save(
            new RoomType(name, basePrice, maxGuests, description)
        ));
    }

    private void upsertRoom(String code, int floor, RoomType roomType) {
        roomRepository.findByCode(code).orElseGet(() -> roomRepository.save(new Room(code, floor, roomType)));
    }

    private void seedBookings(User customerA, User customerB, User customerC) {
        if (bookingRepository.count() > 0) {
            return;
        }
        Room s101 = roomRepository.findByCode("S101").orElseThrow();
        Room d201 = roomRepository.findByCode("D201").orElseThrow();
        Room d202 = roomRepository.findByCode("D202").orElseThrow();
        Room s301 = roomRepository.findByCode("S301").orElseThrow();

        Booking confirmed1 = new Booking(
            customerA,
            s101,
            LocalDate.now().minusDays(10),
            LocalDate.now().minusDays(8),
            BookingStatus.CONFIRMED,
            BigDecimal.valueOf(2200000)
        );
        confirmed1.setCreatedAt(LocalDateTime.now().minusDays(11));
        bookingRepository.save(confirmed1);

        Booking confirmed2 = new Booking(
            customerB,
            d201,
            LocalDate.now().minusDays(5),
            LocalDate.now().minusDays(2),
            BookingStatus.CONFIRMED,
            BigDecimal.valueOf(4500000)
        );
        confirmed2.setCreatedAt(LocalDateTime.now().minusDays(6));
        bookingRepository.save(confirmed2);

        Booking cancelled = new Booking(
            customerA,
            d202,
            LocalDate.now().plusDays(3),
            LocalDate.now().plusDays(5),
            BookingStatus.CANCELLED,
            BigDecimal.valueOf(3000000)
        );
        cancelled.setCreatedAt(LocalDateTime.now().minusDays(1));
        bookingRepository.save(cancelled);

        Booking hold = new Booking(
            customerC,
            s301,
            LocalDate.now().plusDays(7),
            LocalDate.now().plusDays(9),
            BookingStatus.HOLD,
            BigDecimal.valueOf(5000000)
        );
        hold.setHoldExpiresAt(LocalDateTime.now().plusMinutes(8));
        hold.setCreatedAt(LocalDateTime.now().minusMinutes(2));
        bookingRepository.save(hold);

        Booking expired = new Booking(
            customerA,
            s101,
            LocalDate.now().plusDays(12),
            LocalDate.now().plusDays(13),
            BookingStatus.EXPIRED,
            BigDecimal.valueOf(1100000)
        );
        expired.setCreatedAt(LocalDateTime.now().minusDays(2));
        bookingRepository.save(expired);

        paymentTransactionRepository.save(
            new PaymentTransaction(confirmed1, confirmed1.getTotalAmount(), PaymentStatus.SUCCESS, "DEMO-TX-1001")
        );
        paymentTransactionRepository.save(
            new PaymentTransaction(confirmed2, confirmed2.getTotalAmount(), PaymentStatus.SUCCESS, "DEMO-TX-1002")
        );
    }

    private void seedReviews(User customerA, User customerB, User customerC) {
        if (reviewRepository.count() > 0) {
            return;
        }
        reviewRepository.save(new Review(customerA, 5, "Phong sach dep, vi tri trung tam, dich vu rat tot."));
        reviewRepository.save(new Review(customerB, 4, "Nhan vien nhiet tinh, buffet sang on."));
        reviewRepository.save(new Review(customerC, 5, "Dat phong nhanh, check-in gon, hai long."));
    }
}
