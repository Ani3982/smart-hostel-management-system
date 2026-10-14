package com.hostelmanagement.controller;

import com.hostelmanagement.dto.ApiResponse;
import com.hostelmanagement.dto.DashboardStatsDTO;
import com.hostelmanagement.dto.HostelStatsDTO;
import com.hostelmanagement.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/admin")
    public ResponseEntity<ApiResponse<DashboardStatsDTO>> getAdminDashboard() {
        DashboardStatsDTO stats = dashboardService.getAdminDashboardStats();
        return ResponseEntity.ok(ApiResponse.success("Admin dashboard statistics retrieved dynamically", stats));
    }

    @GetMapping("/hostel/{hostelId}")
    public ResponseEntity<ApiResponse<HostelStatsDTO>> getHostelDashboard(@PathVariable Long hostelId) {
        HostelStatsDTO stats = dashboardService.getHostelDashboardStats(hostelId);
        return ResponseEntity.ok(ApiResponse.success("Hostel dashboard statistics retrieved dynamically", stats));
    }

    @GetMapping("/public/summary")
    public ResponseEntity<ApiResponse<DashboardStatsDTO>> getPublicSummary() {
        DashboardStatsDTO stats = dashboardService.getAdminDashboardStats();
        return ResponseEntity.ok(ApiResponse.success("Public hostel summary retrieved dynamically", stats));
    }
}
