package com.rexhotel.booking.user;

import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.format.annotation.DateTimeFormat;

import com.rexhotel.booking.dashboard.DashboardResponse;
import com.rexhotel.booking.dashboard.DashboardService;
import com.rexhotel.booking.dashboard.ReportService;
import com.rexhotel.booking.dashboard.ReportSummaryResponse;
import com.rexhotel.booking.pdf.ReportPdfService;

@RestController
@RequestMapping("/api/manager")
public class ManagerController {

    private final DashboardService dashboardService;
    private final ReportService reportService;
    private final ReportPdfService reportPdfService;

    public ManagerController(DashboardService dashboardService, 
                             ReportService reportService, 
                             ReportPdfService reportPdfService) {
        this.dashboardService = dashboardService;
        this.reportService = reportService;
        this.reportPdfService = reportPdfService;
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("message", "Manager API OK"));
    }

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardResponse> dashboard() {
        return ResponseEntity.ok(dashboardService.getManagerDashboard());
    }

    @GetMapping("/reports/summary")
    public ResponseEntity<ReportSummaryResponse> getReportSummary(
            @RequestParam("startDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) java.time.LocalDate startDate,
            @RequestParam("endDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) java.time.LocalDate endDate) {
        return ResponseEntity.ok(reportService.getReportSummary(startDate, endDate));
    }

    @GetMapping("/reports/pdf")
    public ResponseEntity<byte[]> exportPdf(
            @RequestParam("startDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) java.time.LocalDate startDate,
            @RequestParam("endDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) java.time.LocalDate endDate) {
        
        ReportSummaryResponse report = reportService.getReportSummary(startDate, endDate);
        byte[] pdfData = reportPdfService.generateReportPdf(report);
        
        String filename = String.format("bao_cao_thong_ke_%s_to_%s.pdf", startDate, endDate);
        
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
            .contentType(MediaType.APPLICATION_PDF)
            .body(pdfData);
    }

    @GetMapping("/reports/excel")
    public ResponseEntity<byte[]> exportExcel(
            @RequestParam("startDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) java.time.LocalDate startDate,
            @RequestParam("endDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) java.time.LocalDate endDate) {
        
        ReportSummaryResponse report = reportService.getReportSummary(startDate, endDate);
        
        StringBuilder csvContent = new StringBuilder();
        // UTF-8 BOM to prevent Excel font issues
        csvContent.append("\uFEFF");
        csvContent.append("Chỉ số vận hành,Số liệu thực tế\n");
        csvContent.append("Ngày bắt đầu thống kê,").append(startDate).append("\n");
        csvContent.append("Ngày kết thúc thống kê,").append(endDate).append("\n");
        csvContent.append("Số lượng khách hàng mới,").append(report.newCustomersCount()).append("\n");
        csvContent.append("Tổng số đơn book phòng,").append(report.bookingsCount()).append("\n");
        csvContent.append("Số đơn đặt phòng bị hủy,").append(report.cancelledBookingsCount()).append("\n");
        csvContent.append("Số lượng đánh giá mới,").append(report.newReviewsCount()).append("\n");
        csvContent.append("Doanh thu kiếm được,").append(report.revenue().setScale(0, java.math.RoundingMode.HALF_UP)).append(" VND\n");
        
        byte[] data = csvContent.toString().getBytes(java.nio.charset.StandardCharsets.UTF_8);
        String filename = String.format("bao_cao_thong_ke_%s_to_%s.csv", startDate, endDate);
        
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
            .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
            .body(data);
    }
}
