package com.hostelmanagement.controller;

import com.hostelmanagement.dto.ApiResponse;
import com.hostelmanagement.entity.Hostel;
import com.hostelmanagement.service.HostelService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/hostels")
public class HostelController {

    private final HostelService hostelService;

    public HostelController(HostelService hostelService) {
        this.hostelService = hostelService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Hostel>>> getAllHostels() {
        List<Hostel> hostels = hostelService.getAllHostels();
        return ResponseEntity.ok(ApiResponse.success("Hostels retrieved", hostels));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Hostel>> getHostelById(@PathVariable Long id) {
        Hostel hostel = hostelService.getHostelById(id);
        return ResponseEntity.ok(ApiResponse.success("Hostel retrieved", hostel));
    }
}
