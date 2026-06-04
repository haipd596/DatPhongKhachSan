package com.rexhotel.booking.pdf;

import java.io.ByteArrayOutputStream;
import java.awt.Color;
import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.Rectangle;
import com.lowagie.text.pdf.BaseFont;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.rexhotel.booking.booking.Booking;

@Service
public class BookingPdfService {

    private static final DateTimeFormatter DATE_TIME_FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    private final String configuredFontPath;

    public BookingPdfService(@Value("${app.pdf.font-path:}") String configuredFontPath) {
        this.configuredFontPath = configuredFontPath;
    }

    public byte[] generateBookingDocument(Booking booking, String purpose) {
        try {
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            Document document = new Document(PageSize.A4, 42, 42, 42, 42);
            PdfWriter.getInstance(document, out);
            document.open();
            FontSet fonts = createFonts();

            Paragraph title = new Paragraph("REX SÀI GÒN HOTEL", fonts.title);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(8);
            document.add(title);

            Paragraph subtitle = new Paragraph(purpose, fonts.subtitle);
            subtitle.setAlignment(Element.ALIGN_CENTER);
            subtitle.setSpacingAfter(18);
            document.add(subtitle);

            document.add(section("Thông tin đặt phòng", fonts.section));
            PdfPTable bookingTable = table();
            addRow(bookingTable, "Mã đặt phòng", "#" + booking.getId(), fonts);
            addRow(bookingTable, "Trạng thái", booking.getStatus().name(), fonts);
            addRow(bookingTable, "Ngày tạo", booking.getCreatedAt().format(DATE_TIME_FMT), fonts);
            addRow(bookingTable, "Khách hàng", booking.getUser().getFullName(), fonts);
            addRow(bookingTable, "Email", booking.getUser().getEmail(), fonts);
            addRow(bookingTable, "Phòng", booking.getRoom().getCode() + " - " + booking.getRoom().getRoomType().getName(), fonts);
            addRow(bookingTable, "Ngày nhận phòng", String.valueOf(booking.getCheckInDate()), fonts);
            addRow(bookingTable, "Ngày trả phòng", String.valueOf(booking.getCheckOutDate()), fonts);
            document.add(bookingTable);

            document.add(section("Chi phí và dịch vụ", fonts.section));
            PdfPTable feeTable = table();
            addRow(feeTable, "Buffet sáng", booking.isHasBreakfast() ? "Có" : "Không", fonts);
            addRow(feeTable, "Xe đưa đón", booking.isHasTransfer() ? "Có" : "Không", fonts);
            addRow(feeTable, "Chăm sóc thú cưng", booking.isHasPetCare() ? "Có" : "Không", fonts);
            addRow(feeTable, "Phí dịch vụ", money(booking.getExtraFee()), fonts);
            addRow(feeTable, "Tổng tiền", money(booking.getTotalAmount()), fonts);
            document.add(feeTable);

            Paragraph note = new Paragraph(
                "Vui lòng mang theo giấy tờ tùy thân khi nhận phòng. Phiếu này được phát hành tự động từ hệ thống đặt phòng RexHotel.",
                fonts.normal
            );
            note.setSpacingBefore(18);
            document.add(note);
            document.close();
            return out.toByteArray();
        } catch (Exception ex) {
            throw new RuntimeException("Không tạo được file PDF", ex);
        }
    }

    private FontSet createFonts() throws Exception {
        BaseFont baseFont = BaseFont.createFont(resolveFontPath(), BaseFont.IDENTITY_H, BaseFont.EMBEDDED);
        return new FontSet(
            new Font(baseFont, 18, Font.BOLD),
            new Font(baseFont, 13, Font.BOLD),
            new Font(baseFont, 12, Font.BOLD),
            new Font(baseFont, 10, Font.NORMAL),
            new Font(baseFont, 10, Font.BOLD)
        );
    }

    private String resolveFontPath() {
        if (configuredFontPath != null && !configuredFontPath.isBlank()) {
            return configuredFontPath;
        }
        String[] candidates = {
            "C:/Windows/Fonts/arial.ttf",
            "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
            "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf"
        };
        for (String candidate : candidates) {
            if (new java.io.File(candidate).exists()) {
                return candidate;
            }
        }
        return BaseFont.HELVETICA;
    }

    private Paragraph section(String text, Font font) {
        Paragraph paragraph = new Paragraph(text, font);
        paragraph.setSpacingBefore(12);
        paragraph.setSpacingAfter(8);
        return paragraph;
    }

    private PdfPTable table() throws Exception {
        PdfPTable table = new PdfPTable(2);
        table.setWidthPercentage(100);
        table.setSpacingAfter(8);
        table.setWidths(new float[] { 32, 68 });
        return table;
    }

    private void addRow(PdfPTable table, String label, String value, FontSet fonts) {
        table.addCell(cell(label, fonts.bold, new Color(245, 247, 250)));
        table.addCell(cell(value != null ? value : "-", fonts.normal, Color.WHITE));
    }

    private PdfPCell cell(String text, Font font, Color background) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setPadding(8);
        cell.setBorderColor(new Color(220, 226, 235));
        cell.setBackgroundColor(background);
        cell.setBorder(Rectangle.BOX);
        return cell;
    }

    private String money(BigDecimal value) {
        if (value == null) {
            return "0 VND";
        }
        return String.format("%,.0f VND", value);
    }

    private record FontSet(Font title, Font subtitle, Font section, Font normal, Font bold) {
    }
}
