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
            "Rex Sài Gòn - Giữ phòng thành công",
            "Booking #" + booking.getId() + " đã được giữ đến " + booking.getHoldExpiresAt()
        );
    }

    public void sendBookingConfirmed(Booking booking) {
        emailService.send(
            booking.getUser().getEmail(),
            "Rex Sài Gòn - Đặt phòng thành công",
            "Booking #" + booking.getId() + " đã thanh toán thành công. Tổng tiền: " + booking.getTotalAmount()
        );
    }

    public void sendBookingCancelled(Booking booking) {
        emailService.send(
            booking.getUser().getEmail(),
            "Rex Sài Gòn - Hủy phòng thành công",
            "Booking #" + booking.getId() + " đã được hủy."
        );
    }

    public void sendPasswordResetCode(String email, String code) {
        emailService.send(email, "Rex Sài Gòn - Mã đổi mật khẩu", "Mã đổi mật khẩu của bạn là: " + code);
    }
}
