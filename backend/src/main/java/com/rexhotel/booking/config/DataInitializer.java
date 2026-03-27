package com.rexhotel.booking.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.rexhotel.booking.room.Room;
import com.rexhotel.booking.room.RoomRepository;
import com.rexhotel.booking.room.RoomType;
import com.rexhotel.booking.room.RoomTypeRepository;
import com.rexhotel.booking.user.User;
import com.rexhotel.booking.user.UserRepository;
import com.rexhotel.booking.user.UserRole;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final RoomTypeRepository roomTypeRepository;
    private final RoomRepository roomRepository;

    public DataInitializer(UserRepository userRepository,
                           PasswordEncoder passwordEncoder,
                           RoomTypeRepository roomTypeRepository,
                           RoomRepository roomRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.roomTypeRepository = roomTypeRepository;
        this.roomRepository = roomRepository;
    }

    @Override
    public void run(String... args) {
        if (userRepository.findByEmail("manager@rex.local").isEmpty()) {
            User manager = new User(
                "manager@rex.local",
                passwordEncoder.encode("Manager@123"),
                "Rex Manager",
                UserRole.MANAGER
            );
            userRepository.save(manager);
        }
        seedRooms();
    }

    private void seedRooms() {
        if (roomTypeRepository.count() > 0 || roomRepository.count() > 0) {
            return;
        }
        RoomType deluxe = roomTypeRepository.save(new RoomType("Deluxe", java.math.BigDecimal.valueOf(1500000), 2, "Phong cao cap cho 2 khach"));
        RoomType suite = roomTypeRepository.save(new RoomType("Suite", java.math.BigDecimal.valueOf(2500000), 3, "Phong suite rong voi view dep"));
        roomRepository.save(new Room("D101", 1, deluxe));
        roomRepository.save(new Room("D102", 1, deluxe));
        roomRepository.save(new Room("D201", 2, deluxe));
        roomRepository.save(new Room("S301", 3, suite));
        roomRepository.save(new Room("S302", 3, suite));
    }
}
