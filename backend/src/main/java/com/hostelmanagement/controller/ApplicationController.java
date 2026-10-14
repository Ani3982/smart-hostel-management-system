package com.hostelmanagement.controller;

import com.hostelmanagement.dto.ApiResponse;
import com.hostelmanagement.dto.ApplicationRequest;
import com.hostelmanagement.dto.ApplicationReviewRequest;
import com.hostelmanagement.entity.Application;
import com.hostelmanagement.entity.Student;
import com.hostelmanagement.security.UserPrincipal;
import com.hostelmanagement.service.ApplicationService;
import com.hostelmanagement.service.StudentService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/applications")
public class ApplicationController {

    private final ApplicationService applicationService;
    private final StudentService studentService;

    public ApplicationController(ApplicationService applicationService, StudentService studentService) {
        this.applicationService = applicationService;
        this.studentService = studentService;
    }

    @PostMapping
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<Application>> submitApplication(@AuthenticationPrincipal UserPrincipal userPrincipal,
                                                                      @Valid @RequestBody ApplicationRequest request) {
        Student student = studentService.getStudentByUserId(userPrincipal.getId());
        Application app = applicationService.submitApplication(student.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Hostel application submitted successfully", app));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<Application>>> getAllApplications() {
        return ResponseEntity.ok(ApiResponse.success("All applications retrieved", applicationService.getAllApplications()));
    }

    @GetMapping("/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<Application>>> getAllPendingApplications() {
        return ResponseEntity.ok(ApiResponse.success("Pending applications retrieved", applicationService.getAllPendingApplications()));
    }

    @GetMapping("/hostel/{hostelId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HOSTEL_HEAD')")
    public ResponseEntity<ApiResponse<List<Application>>> getApplicationsByHostel(@PathVariable Long hostelId,
                                                                                  @RequestParam(required = false) String search) {
        List<Application> apps = applicationService.searchApplications(hostelId, search);
        return ResponseEntity.ok(ApiResponse.success("Hostel applications retrieved", apps));
    }

    @GetMapping("/hostel/{hostelId}/pending")
    @PreAuthorize("hasAnyRole('ADMIN', 'HOSTEL_HEAD')")
    public ResponseEntity<ApiResponse<List<Application>>> getPendingByHostel(@PathVariable Long hostelId) {
        return ResponseEntity.ok(ApiResponse.success("Pending hostel applications retrieved",
                applicationService.getPendingApplicationsByHostel(hostelId)));
    }

    @GetMapping("/my-application")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<Application>> getMyApplication(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        Student student = studentService.getStudentByUserId(userPrincipal.getId());
        Application app = applicationService.getStudentLatestApplication(student.getId());
        return ResponseEntity.ok(ApiResponse.success("Latest application retrieved", app));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HOSTEL_HEAD', 'STUDENT')")
    public ResponseEntity<ApiResponse<Application>> getApplicationById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Application details retrieved", applicationService.getApplicationById(id)));
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('ADMIN', 'HOSTEL_HEAD')")
    public ResponseEntity<ApiResponse<Application>> approveApplication(@PathVariable Long id,
                                                                       @AuthenticationPrincipal UserPrincipal userPrincipal) {
        Application approved = applicationService.approveApplication(id, userPrincipal.getName());
        return ResponseEntity.ok(ApiResponse.success("Application approved successfully", approved));
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('ADMIN', 'HOSTEL_HEAD')")
    public ResponseEntity<ApiResponse<Application>> rejectApplication(@PathVariable Long id,
                                                                      @RequestBody ApplicationReviewRequest request,
                                                                      @AuthenticationPrincipal UserPrincipal userPrincipal) {
        Application rejected = applicationService.rejectApplication(id, request, userPrincipal.getName());
        return ResponseEntity.ok(ApiResponse.success("Application rejected with reason", rejected));
    }
}
