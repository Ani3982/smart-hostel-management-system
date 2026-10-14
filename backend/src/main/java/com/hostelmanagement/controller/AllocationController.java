package com.hostelmanagement.controller;

import com.hostelmanagement.dto.AllocationRequest;
import com.hostelmanagement.dto.ApiResponse;
import com.hostelmanagement.entity.Allocation;
import com.hostelmanagement.entity.Student;
import com.hostelmanagement.security.UserPrincipal;
import com.hostelmanagement.service.AllocationService;
import com.hostelmanagement.service.StudentService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/allocations")
public class AllocationController {

    private final AllocationService allocationService;
    private final StudentService studentService;

    public AllocationController(AllocationService allocationService, StudentService studentService) {
        this.allocationService = allocationService;
        this.studentService = studentService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HOSTEL_HEAD')")
    public ResponseEntity<ApiResponse<Allocation>> allocateBed(@Valid @RequestBody AllocationRequest request,
                                                               @AuthenticationPrincipal UserPrincipal userPrincipal) {
        Allocation allocation = allocationService.allocateBed(request, userPrincipal.getName());
        return ResponseEntity.ok(ApiResponse.success("Room and Bed allocated successfully", allocation));
    }

    @GetMapping("/hostel/{hostelId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HOSTEL_HEAD')")
    public ResponseEntity<ApiResponse<List<Allocation>>> getAllocationsByHostel(@PathVariable Long hostelId) {
        return ResponseEntity.ok(ApiResponse.success("Allocations retrieved", allocationService.getAllocationsByHostel(hostelId)));
    }

    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HOSTEL_HEAD', 'STUDENT')")
    public ResponseEntity<ApiResponse<Allocation>> getAllocationByStudent(@PathVariable Long studentId) {
        Allocation allocation = allocationService.getAllocationByStudentId(studentId);
        return ResponseEntity.ok(ApiResponse.success("Allocation retrieved", allocation));
    }

    @GetMapping("/my-allocation")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<Allocation>> getMyAllocation(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        Student student = studentService.getStudentByUserId(userPrincipal.getId());
        Allocation allocation = allocationService.getAllocationByStudentId(student.getId());
        return ResponseEntity.ok(ApiResponse.success("My allocation retrieved", allocation));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HOSTEL_HEAD')")
    public ResponseEntity<ApiResponse<Void>> deallocateBed(@PathVariable Long id) {
        allocationService.deallocateBed(id);
        return ResponseEntity.ok(ApiResponse.success("Bed deallocated successfully", null));
    }
}
