package com.rexhotel.booking.user;

import java.math.BigDecimal;
import java.math.RoundingMode;

import org.springframework.stereotype.Service;

@Service
public class VipPolicyService {

    public VipLevel calculateLevel(int bookingCount) {
        if (bookingCount >= 6) {
            return VipLevel.GOLD;
        }
        if (bookingCount >= 3) {
            return VipLevel.SILVER;
        }
        return VipLevel.NORMAL;
    }

    public BigDecimal discountRate(VipLevel level) {
        return switch (level) {
            case GOLD -> BigDecimal.valueOf(0.07);
            case SILVER -> BigDecimal.valueOf(0.03);
            default -> BigDecimal.ZERO;
        };
    }

    public BigDecimal applyDiscount(BigDecimal amount, VipLevel level) {
        BigDecimal discount = amount.multiply(discountRate(level));
        return amount.subtract(discount).setScale(2, RoundingMode.HALF_UP);
    }
}
