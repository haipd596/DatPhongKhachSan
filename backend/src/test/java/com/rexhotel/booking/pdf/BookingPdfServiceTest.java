package com.rexhotel.booking.pdf;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

import com.rexhotel.booking.booking.Booking;
import com.rexhotel.booking.booking.BookingStatus;
import com.rexhotel.booking.room.Room;
import com.rexhotel.booking.room.RoomType;
import com.rexhotel.booking.user.User;
import com.rexhotel.booking.user.UserRole;

public class BookingPdfServiceTest {

    @Test
    public void testGenerateBookingDocument() {
        BookingPdfService service = new BookingPdfService("");
        
        User user = new User("customer@example.com", "hash", "Nguyễn Văn A", UserRole.CUSTOMER);
        RoomType roomType = new RoomType("Phòng Deluxe", BigDecimal.valueOf(1500000), 2, "Mô tả", "image.jpg");
        Room room = new Room("D101", 1, roomType);
        
        Booking booking = new Booking(user, room, LocalDate.now(), LocalDate.now().plusDays(2), BookingStatus.CONFIRMED, BigDecimal.valueOf(3000000));
        booking.setHasBreakfast(true);
        booking.setHasTransfer(false);
        booking.setHasPetCare(true);
        booking.setExtraFee(BigDecimal.valueOf(200000));
        booking.setCreatedAt(LocalDateTime.now());
        
        byte[] pdfBytes = service.generateBookingDocument(booking, "Giấy xác nhận đặt phòng");
        assertNotNull(pdfBytes);
        assertTrue(pdfBytes.length > 0);
        System.out.println("PDF generation succeeded! Generated size: " + pdfBytes.length + " bytes");
        
        try (java.io.FileOutputStream fos = new java.io.FileOutputStream("backend/target/booking-test.pdf")) {
            fos.write(pdfBytes);
            System.out.println("Saved PDF to backend/target/booking-test.pdf");
        } catch (Exception ex) {
            fail("Failed to save PDF: " + ex.getMessage());
        }
    }

    @Test
    public void testHelveticaIdentityHCompatibility() {
        try {
            com.lowagie.text.pdf.BaseFont.createFont("Helvetica", com.lowagie.text.pdf.BaseFont.IDENTITY_H, com.lowagie.text.pdf.BaseFont.EMBEDDED);
            System.out.println("Helvetica supports IDENTITY_H!");
        } catch (Exception ex) {
            System.out.println("Helvetica FAILED with IDENTITY_H: " + ex.toString());
        }
    }
}
