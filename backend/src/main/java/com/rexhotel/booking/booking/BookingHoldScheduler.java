package com.rexhotel.booking.booking;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class BookingHoldScheduler {

    private final BookingService bookingService;

    public BookingHoldScheduler(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @Scheduled(fixedDelayString = "${app.booking.expire-delay-ms:60000}")
    public void expireHolds() {
        bookingService.expireOldHolds();
    }
}
