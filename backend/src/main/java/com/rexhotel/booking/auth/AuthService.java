package com.rexhotel.booking.auth;

import java.time.LocalDateTime;
import java.util.Random;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.rexhotel.booking.auth.dto.AuthResponse;
import com.rexhotel.booking.auth.dto.ForgotPasswordRequest;
import com.rexhotel.booking.auth.dto.LoginRequest;
import com.rexhotel.booking.auth.dto.RegisterRequest;
import com.rexhotel.booking.auth.dto.ResetPasswordRequest;
import com.rexhotel.booking.common.ApiException;
import com.rexhotel.booking.config.JwtService;
import com.rexhotel.booking.user.User;
import com.rexhotel.booking.user.UserRepository;
import com.rexhotel.booking.user.UserRole;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final Random random = new Random();

    public AuthService(UserRepository userRepository,
                       PasswordResetTokenRepository tokenRepository,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager,
                       JwtService jwtService) {
        this.userRepository = userRepository;
        this.tokenRepository = tokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = request.email().toLowerCase().trim();
        if (userRepository.findByEmail(email).isPresent()) {
            throw new ApiException("Email da ton tai");
        }
        User user = new User(
            email,
            passwordEncoder.encode(request.password()),
            request.fullName().trim(),
            UserRole.CUSTOMER
        );
        userRepository.save(user);
        return toAuthResponse(user);
    }

    public AuthResponse login(LoginRequest request) {
        String email = request.email().toLowerCase().trim();
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(email, request.password()));
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new ApiException("Sai thong tin dang nhap"));
        return toAuthResponse(user);
    }

    @Transactional
    public String forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.email().toLowerCase().trim())
            .orElseThrow(() -> new ApiException("Email khong ton tai"));
        String code = String.valueOf(100000 + random.nextInt(900000));
        PasswordResetToken token = new PasswordResetToken(code, user, LocalDateTime.now().plusMinutes(15));
        tokenRepository.save(token);
        return code;
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        PasswordResetToken token = tokenRepository.findTopByCodeAndUsedFalseOrderByIdDesc(request.code())
            .orElseThrow(() -> new ApiException("Ma reset khong hop le"));
        if (token.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new ApiException("Ma reset da het han");
        }
        User user = token.getUser();
        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        token.setUsed(true);
        userRepository.save(user);
        tokenRepository.save(token);
    }

    public AuthResponse me(String email) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new ApiException("Khong tim thay nguoi dung"));
        return toAuthResponse(user);
    }

    private AuthResponse toAuthResponse(User user) {
        return new AuthResponse(
            jwtService.generateToken(user),
            user.getEmail(),
            user.getFullName(),
            user.getRole().name(),
            user.getVipLevel().name()
        );
    }
}
