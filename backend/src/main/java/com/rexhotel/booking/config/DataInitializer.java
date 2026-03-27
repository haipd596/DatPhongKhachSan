package com.rexhotel.booking.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.rexhotel.booking.user.User;
import com.rexhotel.booking.user.UserRepository;
import com.rexhotel.booking.user.UserRole;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
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
    }
}
