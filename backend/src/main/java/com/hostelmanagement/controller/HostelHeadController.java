package com.hostelmanagement.controller;

import com.hostelmanagement.dto.ApiResponse;
import com.hostelmanagement.entity.HostelHead;
import com.hostelmanagement.repository.HostelHeadRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/hostel-heads")
public class HostelHeadController {

    private final HostelHeadRepository hostelHeadRepository;

    public HostelHeadController(HostelHeadRepository hostelHeadRepository) {
        this.hostelHeadRepository = hostelHeadRepository;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<HostelHead>>> getAllHeads() {
        return ResponseEntity.ok(ApiResponse.success("Hostel Heads retrieved", hostelHeadRepository.findAll()));
    }

    @GetMapping("/hostel/{hostelId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HOSTEL_HEAD')")
    public ResponseEntity<ApiResponse<HostelHead>> getHeadByHostel(@PathVariable Long hostelId) {
        return hostelHeadRepository.findByHostelId(hostelId)
                .map(h -> ResponseEntity.ok(ApiResponse.success("Hostel Head retrieved", h)))
                .orElse(ResponseEntity.ok(ApiResponse.error("No head assigned for this hostel")));
    }
}
