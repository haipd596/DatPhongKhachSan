package com.rexhotel.booking.user;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.rexhotel.booking.dashboard.DashboardResponse;
import com.rexhotel.booking.dashboard.DashboardService;

@RestController
@RequestMapping("/api/manager")
public class ManagerController {

    private final DashboardService dashboardService;

    public ManagerController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("message", "Manager API OK"));
    }

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardResponse> dashboard() {
        return ResponseEntity.ok(dashboardService.getManagerDashboard());
    }
}
