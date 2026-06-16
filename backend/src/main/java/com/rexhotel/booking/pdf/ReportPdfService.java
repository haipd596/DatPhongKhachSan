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
import com.rexhotel.booking.dashboard.ReportSummaryResponse;

@Service
public class ReportPdfService {

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    private final String configuredFontPath;

    public ReportPdfService(@Value("${app.pdf.font-path:}") String configuredFontPath) {
        this.configuredFontPath = configuredFontPath;
    }

    public byte[] generateReportPdf(ReportSummaryResponse report) {
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

            Paragraph subtitle = new Paragraph("BÁO CÁO THỐNG KÊ HOẠT ĐỘNG", fonts.subtitle);
            subtitle.setAlignment(Element.ALIGN_CENTER);
            subtitle.setSpacingAfter(4);
            document.add(subtitle);

            String timeRange = String.format("Từ ngày: %s - Đến ngày: %s", 
                report.startDate().format(DATE_FMT), 
                report.endDate().format(DATE_FMT));
            Paragraph period = new Paragraph(timeRange, fonts.normal);
            period.setAlignment(Element.ALIGN_CENTER);
            period.setSpacingAfter(18);
            document.add(period);

            document.add(section("Số liệu thống kê hoạt động", fonts.section));
            PdfPTable reportTable = table();
            
            // Thêm header cho bảng
            reportTable.addCell(headerCell("Chỉ số vận hành", fonts.boldHeader, new Color(5, 150, 105)));
            reportTable.addCell(headerCell("Số liệu thực tế", fonts.boldHeader, new Color(5, 150, 105)));

            addRow(reportTable, "Số lượng khách hàng mới", String.valueOf(report.newCustomersCount()), fonts);
            addRow(reportTable, "Tổng số đơn book phòng", String.valueOf(report.bookingsCount()), fonts);
            addRow(reportTable, "Số đơn đặt phòng bị hủy", String.valueOf(report.cancelledBookingsCount()), fonts);
            addRow(reportTable, "Số lượng đánh giá mới", String.valueOf(report.newReviewsCount()), fonts);
            addRow(reportTable, "Doanh thu kiếm được", money(report.revenue()), fonts);
            
            document.add(reportTable);

            Paragraph note = new Paragraph(
                "Báo cáo này được kết xuất tự động từ hệ thống quản trị RexHotel phục vụ mục đích kiểm tra và lưu trữ.",
                fonts.normal
            );
            note.setSpacingBefore(24);
            note.setAlignment(Element.ALIGN_CENTER);
            document.add(note);
            
            document.close();
            return out.toByteArray();
        } catch (Exception ex) {
            throw new RuntimeException("Không tạo được file PDF báo cáo", ex);
        }
    }

    private BaseFont loadFont(String resourcePath) throws Exception {
        try (java.io.InputStream is = getClass().getResourceAsStream(resourcePath)) {
            if (is == null) {
                throw new java.io.FileNotFoundException("Không tìm thấy font resource: " + resourcePath);
            }
            byte[] fontBytes = is.readAllBytes();
            return BaseFont.createFont(resourcePath, BaseFont.IDENTITY_H, BaseFont.EMBEDDED, BaseFont.CACHED, fontBytes, null);
        }
    }

    private FontSet createFonts() throws Exception {
        try {
            BaseFont regularBase = loadFont("/fonts/Roboto-Regular.ttf");
            BaseFont boldBase = loadFont("/fonts/Roboto-Bold.ttf");
            return new FontSet(
                new Font(boldBase, 18, Font.NORMAL),
                new Font(boldBase, 13, Font.NORMAL),
                new Font(boldBase, 12, Font.NORMAL),
                new Font(regularBase, 10, Font.NORMAL),
                new Font(boldBase, 10, Font.NORMAL),
                new Font(boldBase, 10, Font.NORMAL) // header
            );
        } catch (Exception e) {
            String fontPath = resolveFontPath();
            String encoding = BaseFont.IDENTITY_H;
            if (BaseFont.HELVETICA.equals(fontPath)) {
                encoding = BaseFont.CP1252;
            }
            BaseFont fallbackBase = BaseFont.createFont(fontPath, encoding, BaseFont.EMBEDDED);
            return new FontSet(
                new Font(fallbackBase, 18, Font.BOLD),
                new Font(fallbackBase, 13, Font.BOLD),
                new Font(fallbackBase, 12, Font.BOLD),
                new Font(fallbackBase, 10, Font.NORMAL),
                new Font(fallbackBase, 10, Font.BOLD),
                new Font(fallbackBase, 10, Font.BOLD)
            );
        }
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
        table.setWidths(new float[] { 50, 50 });
        return table;
    }

    private void addRow(PdfPTable table, String label, String value, FontSet fonts) {
        table.addCell(cell(label, fonts.bold, new Color(245, 247, 250)));
        table.addCell(cell(value != null ? value : "-", fonts.normal, Color.WHITE));
    }

    private PdfPCell cell(String text, Font font, Color background) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setPadding(10);
        cell.setBorderColor(new Color(220, 226, 235));
        cell.setBackgroundColor(background);
        cell.setBorder(Rectangle.BOX);
        return cell;
    }

    private PdfPCell headerCell(String text, Font font, Color background) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setPadding(10);
        cell.setBorderColor(new Color(220, 226, 235));
        cell.setBackgroundColor(background);
        cell.setBorder(Rectangle.BOX);
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        return cell;
    }

    private String money(BigDecimal value) {
        if (value == null) {
            return "0 VND";
        }
        return String.format("%,.0f VND", value);
    }

    private record FontSet(Font title, Font subtitle, Font section, Font normal, Font bold, Font boldHeader) {
    }
}
