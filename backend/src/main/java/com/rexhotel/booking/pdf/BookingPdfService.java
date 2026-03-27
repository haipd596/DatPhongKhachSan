package com.rexhotel.booking.pdf;

import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;

import org.springframework.stereotype.Service;

import com.lowagie.text.Document;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfWriter;
import com.rexhotel.booking.booking.Booking;

@Service
public class BookingPdfService {

    private static final DateTimeFormatter DATE_TIME_FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    public byte[] generateBookingDocument(Booking booking, String purpose) {
        try {
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            Document document = new Document();
            PdfWriter.getInstance(document, out);
            document.open();
            document.add(new Paragraph("REX SAI GON HOTEL"));
            document.add(new Paragraph("Phieu xac nhan: " + purpose));
            document.add(new Paragraph("Ma booking: #" + booking.getId()));
            document.add(new Paragraph("Khach hang: " + booking.getUser().getFullName()));
            document.add(new Paragraph("Email: " + booking.getUser().getEmail()));
            document.add(new Paragraph("Phong: " + booking.getRoom().getCode() + " - " + booking.getRoom().getRoomType().getName()));
            document.add(new Paragraph("Check-in: " + booking.getCheckInDate()));
            document.add(new Paragraph("Check-out: " + booking.getCheckOutDate()));
            document.add(new Paragraph("Trang thai: " + booking.getStatus().name()));
            document.add(new Paragraph("Tong tien: " + booking.getTotalAmount() + " VND"));
            document.add(new Paragraph("Ngay tao: " + booking.getCreatedAt().format(DATE_TIME_FMT)));
            document.close();
            return out.toByteArray();
        } catch (Exception ex) {
            throw new RuntimeException("Khong tao duoc file PDF", ex);
        }
    }
}
