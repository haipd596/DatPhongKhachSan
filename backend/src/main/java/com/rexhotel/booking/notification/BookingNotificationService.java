package com.rexhotel.booking.notification;

import org.springframework.stereotype.Service;

import com.rexhotel.booking.booking.Booking;

@Service
public class BookingNotificationService {

    private final EmailService emailService;

    public BookingNotificationService(EmailService emailService) {
        this.emailService = emailService;
    }

    public void sendHoldConfirmation(Booking booking) {
        emailService.send(
            booking.getUser().getEmail(),
            "Rex Sai Gon - Giu phong thanh cong",
            "Booking #" + booking.getId() + " da duoc giu den " + booking.getHoldExpiresAt()
        );
    }

    public void sendBookingConfirmed(Booking booking) {
        emailService.send(
            booking.getUser().getEmail(),
            "Rex Sai Gon - Dat phong thanh cong",
            "Booking #" + booking.getId() + " da thanh toan thanh cong. Tong tien: " + booking.getTotalAmount()
        );
    }

    public void sendBookingCancelled(Booking booking) {
        emailService.send(
            booking.getUser().getEmail(),
            "Rex Sai Gon - Huy phong thanh cong",
            "Booking #" + booking.getId() + " da duoc huy."
        );
    }

    public void sendPasswordResetCode(String email, String code) {
        emailService.send(email, "Rex Sai Gon - Ma doi mat khau", "Ma doi mat khau cua ban la: " + code);
    }
}
