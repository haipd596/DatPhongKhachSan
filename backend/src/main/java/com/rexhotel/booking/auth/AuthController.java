package com.rexhotel.booking.auth;

import java.security.Principal;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.rexhotel.booking.auth.dto.AuthResponse;
import com.rexhotel.booking.auth.dto.ForgotPasswordRequest;
import com.rexhotel.booking.auth.dto.LoginRequest;
import com.rexhotel.booking.auth.dto.RefreshTokenRequest;
import com.rexhotel.booking.auth.dto.RegisterRequest;
import com.rexhotel.booking.auth.dto.ResetPasswordRequest;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Validated @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Validated @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(@Validated @RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request);
        return ResponseEntity.ok(Map.of("message", "Ma xac nhan da duoc gui den email cua ban"));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@Validated @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok(Map.of("message", "Doi mat khau thanh cong"));
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(@Validated @RequestBody RefreshTokenRequest request) {
        return ResponseEntity.ok(authService.refresh(request.refreshToken()));
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(@Validated @RequestBody RefreshTokenRequest request) {
        authService.logout(request.refreshToken());
        return ResponseEntity.ok(Map.of("message", "Dang xuat thanh cong"));
    }

    @GetMapping("/me")
    public ResponseEntity<AuthResponse> me(Principal principal) {
        return ResponseEntity.ok(authService.me(principal.getName()));
    }
}
