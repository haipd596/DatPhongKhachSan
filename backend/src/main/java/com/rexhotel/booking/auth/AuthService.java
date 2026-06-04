package com.rexhotel.booking.auth;

import java.security.SecureRandom;
import java.time.LocalDateTime;

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
import com.rexhotel.booking.config.RateLimitService;
import com.rexhotel.booking.notification.BookingNotificationService;
import com.rexhotel.booking.user.User;
import com.rexhotel.booking.user.UserRepository;
import com.rexhotel.booking.user.UserRole;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final BookingNotificationService bookingNotificationService;
    private final RateLimitService rateLimitService;
    private final SecureRandom secureRandom = new SecureRandom();

    public AuthService(UserRepository userRepository,
                       PasswordResetTokenRepository tokenRepository,
                       RefreshTokenRepository refreshTokenRepository,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager,
                       JwtService jwtService,
                       BookingNotificationService bookingNotificationService,
                       RateLimitService rateLimitService) {
        this.userRepository = userRepository;
        this.tokenRepository = tokenRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.bookingNotificationService = bookingNotificationService;
        this.rateLimitService = rateLimitService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = request.email().toLowerCase().trim();
        if (userRepository.findByEmail(email).isPresent()) {
            throw new ApiException("Email đã tồn tại");
        }
        User user = new User(
            email,
            passwordEncoder.encode(request.password()),
            request.fullName().trim(),
            UserRole.CUSTOMER
        );
        userRepository.save(user);
        return toAuthResponse(user, null);
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        String email = request.email().toLowerCase().trim();
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(email, request.password()));
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new ApiException("Sai thông tin đăng nhập"));
        // Xoa cac refresh token cu cua user
        refreshTokenRepository.revokeAllByUser(user);
        RefreshToken refreshToken = new RefreshToken(user);
        refreshTokenRepository.save(refreshToken);
        return toAuthResponse(user, refreshToken.getToken());
    }

    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        String email = request.email().toLowerCase().trim();
        // BUG7: Rate limit - max 3 lan/phut per email
        if (!rateLimitService.tryAcquire("forgot:" + email, 3, 60)) {
            throw new ApiException("Quá nhiều yêu cầu. Vui lòng thử lại sau 1 phút.");
        }
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new ApiException("Email không tồn tại"));
        // BUG1: Dung SecureRandom thay Random
        String code = String.valueOf(100000 + secureRandom.nextInt(900000));
        PasswordResetToken token = new PasswordResetToken(code, user, LocalDateTime.now().plusMinutes(15));
        tokenRepository.save(token);
        bookingNotificationService.sendPasswordResetCode(user.getEmail(), code);
        // Khong tra code ra response
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        PasswordResetToken token = tokenRepository.findTopByCodeAndUsedFalseOrderByIdDesc(request.code())
            .orElseThrow(() -> new ApiException("Mã xác nhận không hợp lệ hoặc đã được sử dụng"));
        if (token.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new ApiException("Mã xác nhận đã hết hạn (15 phút)");
        }
        User user = token.getUser();
        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        token.setUsed(true);
        userRepository.save(user);
        tokenRepository.save(token);
    }

    @Transactional
    public AuthResponse refresh(String refreshTokenValue) {
        RefreshToken rt = refreshTokenRepository.findByTokenAndRevokedFalse(refreshTokenValue)
            .orElseThrow(() -> new ApiException("Refresh token không hợp lệ hoặc đã hết hạn"));
        if (rt.getExpiresAt().isBefore(LocalDateTime.now())) {
            rt.setRevoked(true);
            refreshTokenRepository.save(rt);
            throw new ApiException("Refresh token đã hết hạn. Vui lòng đăng nhập lại.");
        }
        User user = rt.getUser();
        // Issue refresh token moi (rotation)
        rt.setRevoked(true);
        refreshTokenRepository.save(rt);
        RefreshToken newRt = new RefreshToken(user);
        refreshTokenRepository.save(newRt);
        return toAuthResponse(user, newRt.getToken());
    }

    @Transactional
    public void logout(String refreshTokenValue) {
        refreshTokenRepository.findByTokenAndRevokedFalse(refreshTokenValue)
            .ifPresent(rt -> {
                rt.setRevoked(true);
                refreshTokenRepository.save(rt);
            });
    }

    public AuthResponse me(String email) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new ApiException("Không tìm thấy người dùng"));
        return toAuthResponse(user, null);
    }

    private AuthResponse toAuthResponse(User user, String refreshToken) {
        return new AuthResponse(
            jwtService.generateToken(user),
            refreshToken,
            user.getEmail(),
            user.getFullName(),
            user.getRole().name(),
            user.getVipLevel().name()
        );
    }
}
