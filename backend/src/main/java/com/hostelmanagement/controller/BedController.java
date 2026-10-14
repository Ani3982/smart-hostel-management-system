package com.hostelmanagement.controller;

import com.hostelmanagement.dto.ApiResponse;
import com.hostelmanagement.dto.BedRequest;
import com.hostelmanagement.entity.Bed;
import com.hostelmanagement.service.BedService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/beds")
public class BedController {

    private final BedService bedService;

    public BedController(BedService bedService) {
        this.bedService = bedService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HOSTEL_HEAD')")
    public ResponseEntity<ApiResponse<List<Bed>>> getAllBeds() {
        return ResponseEntity.ok(ApiResponse.success("Beds retrieved", bedService.getAllBeds()));
    }

    @GetMapping("/room/{roomId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HOSTEL_HEAD', 'STUDENT')")
    public ResponseEntity<ApiResponse<List<Bed>>> getBedsByRoom(@PathVariable Long roomId) {
        return ResponseEntity.ok(ApiResponse.success("Room beds retrieved", bedService.getBedsByRoom(roomId)));
    }

    @GetMapping("/available/{hostelId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HOSTEL_HEAD', 'STUDENT')")
    public ResponseEntity<ApiResponse<List<Bed>>> getAvailableBeds(@PathVariable Long hostelId) {
        return ResponseEntity.ok(ApiResponse.success("Available beds retrieved", bedService.getAvailableBedsByHostel(hostelId)));
    }

    @GetMapping("/hostel/{hostelId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HOSTEL_HEAD')")
    public ResponseEntity<ApiResponse<List<Bed>>> getBedsByHostel(@PathVariable Long hostelId) {
        return ResponseEntity.ok(ApiResponse.success("Hostel beds retrieved", bedService.getBedsByHostel(hostelId)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HOSTEL_HEAD')")
    public ResponseEntity<ApiResponse<Bed>> createBed(@Valid @RequestBody BedRequest request) {
        Bed created = bedService.createBed(request);
        return ResponseEntity.ok(ApiResponse.success("Bed created successfully", created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HOSTEL_HEAD')")
    public ResponseEntity<ApiResponse<Bed>> updateBed(@PathVariable Long id, @Valid @RequestBody BedRequest request) {
        Bed updated = bedService.updateBed(id, request);
        return ResponseEntity.ok(ApiResponse.success("Bed updated successfully", updated));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'HOSTEL_HEAD')")
    public ResponseEntity<ApiResponse<Bed>> updateBedStatus(@PathVariable Long id, @RequestParam String status) {
        Bed updated = bedService.updateBedStatus(id, Bed.BedStatus.valueOf(status.toUpperCase()));
        return ResponseEntity.ok(ApiResponse.success("Bed status updated", updated));
    }
}
