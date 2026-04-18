package com.rexhotel.booking.booking;

import jakarta.annotation.PostConstruct;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class BookingHoldScheduler {

    private final BookingService bookingService;

    public BookingHoldScheduler(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    // BUG6: Chay expire ngay khi app khoi dong de xu ly cac HOLD ton dong
    @PostConstruct
    public void expireOnStartup() {
        int count = bookingService.expireOldHolds();
        if (count > 0) {
            System.out.println("[BookingHoldScheduler] Startup: Expired " + count + " hold booking(s)");
        }
    }

    @Scheduled(fixedDelayString = "${app.booking.expire-delay-ms:60000}")
    public void expireHolds() {
        bookingService.expireOldHolds();
    }
}
