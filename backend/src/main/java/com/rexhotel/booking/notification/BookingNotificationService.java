package com.rexhotel.booking.notification;

import org.springframework.stereotype.Service;

import com.rexhotel.booking.booking.Booking;
import com.rexhotel.booking.pdf.BookingPdfService;

@Service
public class BookingNotificationService {

    private final EmailService emailService;
    private final BookingPdfService bookingPdfService;

    public BookingNotificationService(EmailService emailService, BookingPdfService bookingPdfService) {
        this.emailService = emailService;
        this.bookingPdfService = bookingPdfService;
    }

    public void sendHoldConfirmation(Booking booking) {
        sendBookingMail(
            booking,
            booking.getUser().getEmail(),
            "Rex Sài Gòn - Giữ phòng thành công",
            "Booking #" + booking.getId() + " đã được giữ đến " + booking.getHoldExpiresAt(),
            "Phiếu giữ phòng"
        );
    }

    public void sendBookingConfirmed(Booking booking) {
        sendBookingMail(
            booking,
            booking.getUser().getEmail(),
            "Rex Sài Gòn - Đặt phòng thành công",
            "Booking #" + booking.getId() + " đã thanh toán thành công. Tổng tiền: " + booking.getTotalAmount(),
            "Phiếu xác nhận đặt phòng"
        );
    }

    public void sendBookingCancelled(Booking booking) {
        sendBookingMail(
            booking,
            booking.getUser().getEmail(),
            "Rex Sài Gòn - Hủy phòng thành công",
            "Booking #" + booking.getId() + " đã được hủy.",
            "Phiếu hủy đặt phòng"
        );
    }

    public void sendPasswordResetCode(String email, String code) {
        emailService.send(email, "Rex Sài Gòn - Mã đổi mật khẩu", "Mã đổi mật khẩu của bạn là: " + code);
    }

    private void sendBookingMail(Booking booking, String to, String subject, String body, String purpose) {
        byte[] pdf = bookingPdfService.generateBookingDocument(booking, purpose);
        emailService.sendWithAttachment(to, subject, body, "booking-" + booking.getId() + ".pdf", pdf);
    }
}
