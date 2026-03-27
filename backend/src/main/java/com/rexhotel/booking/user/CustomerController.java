package com.rexhotel.booking.user;

import java.security.Principal;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.rexhotel.booking.common.ApiException;

@RestController
@RequestMapping("/api/customers")
public class CustomerController {

    private final UserRepository userRepository;
    private final VipPolicyService vipPolicyService;

    public CustomerController(UserRepository userRepository, VipPolicyService vipPolicyService) {
        this.userRepository = userRepository;
        this.vipPolicyService = vipPolicyService;
    }

    @GetMapping("/me/vip")
    public ResponseEntity<Map<String, Object>> myVip(Principal principal) {
        User user = userRepository.findByEmail(principal.getName()).orElseThrow(() -> new ApiException("Khong tim thay user"));
        return ResponseEntity.ok(Map.of(
            "bookingCount", user.getBookingCount(),
            "vipLevel", user.getVipLevel().name(),
            "discountRate", vipPolicyService.discountRate(user.getVipLevel())
        ));
    }
}
