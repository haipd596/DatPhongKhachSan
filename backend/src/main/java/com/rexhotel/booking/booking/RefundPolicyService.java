package com.rexhotel.booking.booking;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

import org.springframework.stereotype.Service;

/**
 * Chinh sach hoan tien khi huy dat phong.
 * Tinh theo so ngay con lai truoc ngay check-in.
 */
@Service
public class RefundPolicyService {

    /**
     * @return phan tram hoan tien (0.8 = 80%)
     */
    public BigDecimal getRefundRate(LocalDate checkInDate) {
        long daysUntilCheckIn = ChronoUnit.DAYS.between(LocalDate.now(), checkInDate);
        if (daysUntilCheckIn >= 3) {
            return BigDecimal.valueOf(0.80);
        } else if (daysUntilCheckIn >= 1) {
            return BigDecimal.valueOf(0.30);
        } else {
            return BigDecimal.ZERO;
        }
    }

    public BigDecimal calculateRefund(BigDecimal totalAmount, LocalDate checkInDate) {
        BigDecimal rate = getRefundRate(checkInDate);
        return totalAmount.multiply(rate).setScale(2, RoundingMode.HALF_UP);
    }

    public String getRefundDescription(LocalDate checkInDate) {
        long days = ChronoUnit.DAYS.between(LocalDate.now(), checkInDate);
        if (days >= 3) return "Hoan tien 80% (huy truoc " + days + " ngay check-in)";
        if (days >= 1) return "Hoan tien 30% (huy truoc " + days + " ngay check-in)";
        return "Khong hoan tien (huy trong ngay hoac sau ngay check-in)";
    }
}
