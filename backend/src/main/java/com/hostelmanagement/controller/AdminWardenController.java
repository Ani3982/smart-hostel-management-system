package com.hostelmanagement.controller;

import com.hostelmanagement.dto.ApiResponse;
import com.hostelmanagement.entity.Hostel;
import com.hostelmanagement.entity.HostelHead;
import com.hostelmanagement.entity.User;
import com.hostelmanagement.repository.HostelHeadRepository;
import com.hostelmanagement.repository.HostelRepository;
import com.hostelmanagement.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/wardens")
@PreAuthorize("hasRole('ADMIN')")
public class AdminWardenController {

    private final HostelHeadRepository hostelHeadRepository;
    private final HostelRepository hostelRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminWardenController(HostelHeadRepository hostelHeadRepository,
                                 HostelRepository hostelRepository,
                                 UserRepository userRepository,
                                 PasswordEncoder passwordEncoder) {
        this.hostelHeadRepository = hostelHeadRepository;
        this.hostelRepository = hostelRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<HostelHead>>> getAllWardens() {
        return ResponseEntity.ok(ApiResponse.success("Wardens retrieved successfully", hostelHeadRepository.findAll()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<HostelHead>> getWardenById(@PathVariable Long id) {
        return hostelHeadRepository.findById(id)
                .map(w -> ResponseEntity.ok(ApiResponse.success("Warden details retrieved", w)))
                .orElse(ResponseEntity.badRequest().body(ApiResponse.error("Warden not found")));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<HostelHead>> createWarden(@RequestBody Map<String, Object> body) {
        try {
            String fullName = (String) body.get("fullName");
            String email = (String) body.get("email");
            String mobile = (String) body.get("mobile");
            String gender = (String) body.get("gender");
            String designation = (String) body.get("designation");
            String status = body.get("status") != null ? (String) body.get("status") : "ACTIVE";
            String password = body.get("password") != null ? (String) body.get("password") : "Warden@123";
            
            Number hostelAssignNum = (Number) body.get("hostelAssignment");
            Long hostelId = (hostelAssignNum != null && hostelAssignNum.longValue() == 2) ? 2L : 1L;
            String employeeId = (String) body.get("employeeId");
            if (employeeId == null || employeeId.trim().isEmpty()) {
                employeeId = hostelId == 1L ? "WH001" : "WH002";
            }

            Hostel hostel = hostelRepository.findById(hostelId)
                    .orElseThrow(() -> new RuntimeException("Hostel not found: " + hostelId));

            // Find or create User with role HOSTEL_HEAD
            User user = userRepository.findByEmail(email).orElse(null);
            if (user == null) {
                user = new User(fullName, email, passwordEncoder.encode(password), User.Role.HOSTEL_HEAD);
                user = userRepository.save(user);
            } else {
                user.setName(fullName);
                user.setRole(User.Role.HOSTEL_HEAD);
                userRepository.save(user);
            }

            // Find existing head for this hostel or create new
            HostelHead head = hostelHeadRepository.findByHostelId(hostelId).orElse(new HostelHead());
            head.setUser(user);
            head.setHostel(hostel);
            head.setName(fullName);
            head.setFullName(fullName);
            head.setEmployeeId(employeeId);
            head.setEmail(email);
            head.setMobile(mobile != null ? mobile : "9876543210");
            head.setGender(gender != null ? gender : (hostelId == 1L ? "MALE" : "FEMALE"));
            head.setDesignation(designation != null ? designation : (hostelId == 1L ? "Boys Hostel Warden" : "Girls Hostel Warden"));
            head.setStatus(status);
            head.setJoiningDate(LocalDate.now());
            head.setUpdatedAt(LocalDateTime.now());

            HostelHead saved = hostelHeadRepository.save(head);
            return ResponseEntity.ok(ApiResponse.success("Warden created and commissioned with role HOSTEL_HEAD", saved));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<HostelHead>> updateWarden(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        return hostelHeadRepository.findById(id).map(head -> {
            if (body.containsKey("fullName")) {
                head.setFullName((String) body.get("fullName"));
                head.setName((String) body.get("fullName"));
            }
            if (body.containsKey("employeeId")) head.setEmployeeId((String) body.get("employeeId"));
            if (body.containsKey("email")) head.setEmail((String) body.get("email"));
            if (body.containsKey("mobile")) head.setMobile((String) body.get("mobile"));
            if (body.containsKey("gender")) head.setGender((String) body.get("gender"));
            if (body.containsKey("designation")) head.setDesignation((String) body.get("designation"));
            if (body.containsKey("status")) head.setStatus((String) body.get("status"));
            head.setUpdatedAt(LocalDateTime.now());

            HostelHead updated = hostelHeadRepository.save(head);
            return ResponseEntity.ok(ApiResponse.success("Warden updated successfully", updated));
        }).orElse(ResponseEntity.badRequest().body(ApiResponse.error("Warden not found")));
    }

    @PutMapping("/{id}/activate")
    public ResponseEntity<ApiResponse<Void>> activateWarden(@PathVariable Long id) {
        return hostelHeadRepository.findById(id).map(head -> {
            head.setStatus("ACTIVE");
            head.setUpdatedAt(LocalDateTime.now());
            hostelHeadRepository.save(head);
            return ResponseEntity.ok(ApiResponse.<Void>success("Warden activated successfully"));
        }).orElse(ResponseEntity.badRequest().body(ApiResponse.error("Warden not found")));
    }

    @PutMapping("/{id}/deactivate")
    public ResponseEntity<ApiResponse<Void>> deactivateWarden(@PathVariable Long id) {
        return hostelHeadRepository.findById(id).map(head -> {
            head.setStatus("INACTIVE");
            head.setUpdatedAt(LocalDateTime.now());
            hostelHeadRepository.save(head);
            return ResponseEntity.ok(ApiResponse.<Void>success("Warden deactivated successfully"));
        }).orElse(ResponseEntity.badRequest().body(ApiResponse.error("Warden not found")));
    }

    @PutMapping("/{id}/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return hostelHeadRepository.findById(id).map(head -> {
            String newPassword = body.getOrDefault("newPassword", "Warden@123");
            User user = head.getUser();
            if (user != null) {
                user.setPassword(passwordEncoder.encode(newPassword));
                userRepository.save(user);
            }
            return ResponseEntity.ok(ApiResponse.<Void>success("Password reset successfully"));
        }).orElse(ResponseEntity.badRequest().body(ApiResponse.error("Warden not found")));
    }
}
