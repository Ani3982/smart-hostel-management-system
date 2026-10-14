package com.hostelmanagement.controller;

import com.hostelmanagement.dto.ApiResponse;
import com.hostelmanagement.dto.ApplicationReviewRequest;
import com.hostelmanagement.entity.*;
import com.hostelmanagement.repository.*;
import com.hostelmanagement.security.UserPrincipal;
import com.hostelmanagement.service.ApplicationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/warden")
@PreAuthorize("hasAnyRole('HOSTEL_HEAD', 'ADMIN')")
public class WardenController {

    private final HostelHeadRepository hostelHeadRepository;
    private final HostelRepository hostelRepository;
    private final RoomRepository roomRepository;
    private final BedRepository bedRepository;
    private final ApplicationRepository applicationRepository;
    private final AllocationRepository allocationRepository;
    private final PaymentRepository paymentRepository;
    private final StudentRepository studentRepository;
    private final NotificationRepository notificationRepository;
    private final ApplicationService applicationService;

    public WardenController(HostelHeadRepository hostelHeadRepository,
                            HostelRepository hostelRepository,
                            RoomRepository roomRepository,
                            BedRepository bedRepository,
                            ApplicationRepository applicationRepository,
                            AllocationRepository allocationRepository,
                            PaymentRepository paymentRepository,
                            StudentRepository studentRepository,
                            NotificationRepository notificationRepository,
                            ApplicationService applicationService) {
        this.hostelHeadRepository = hostelHeadRepository;
        this.hostelRepository = hostelRepository;
        this.roomRepository = roomRepository;
        this.bedRepository = bedRepository;
        this.applicationRepository = applicationRepository;
        this.allocationRepository = allocationRepository;
        this.paymentRepository = paymentRepository;
        this.studentRepository = studentRepository;
        this.notificationRepository = notificationRepository;
        this.applicationService = applicationService;
    }

    private Long resolveHostelId(UserPrincipal userPrincipal, Long optionalQueryHostelId) {
        Optional<HostelHead> headOpt = hostelHeadRepository.findByUserId(userPrincipal.getId());
        if (headOpt.isPresent()) {
            return headOpt.get().getHostel().getId();
        }
        // Fallback for ADMIN override
        return optionalQueryHostelId != null ? optionalQueryHostelId : 1L;
    }

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<HostelHead>> getProfile(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        return hostelHeadRepository.findByUserId(userPrincipal.getId())
                .map(h -> ResponseEntity.ok(ApiResponse.success("Warden profile retrieved", h)))
                .orElse(ResponseEntity.badRequest().body(ApiResponse.error("Warden profile not found")));
    }

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDashboard(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        Long hostelId = resolveHostelId(userPrincipal, null);
        Hostel hostel = hostelRepository.findById(hostelId).orElse(null);
        Optional<HostelHead> headOpt = hostelHeadRepository.findByHostelId(hostelId);

        List<Room> rooms = roomRepository.findByHostelId(hostelId);
        List<Bed> beds = bedRepository.findByRoomHostelId(hostelId);
        List<Application> apps = applicationRepository.findByHostelId(hostelId);
        List<Allocation> allocs = allocationRepository.findByHostelId(hostelId);
        List<Payment> payments = paymentRepository.findByApplicationHostelId(hostelId);

        long occupiedBeds = beds.stream().filter(b -> b.getStatus() == Bed.Status.OCCUPIED).count();
        long availableBeds = beds.stream().filter(b -> b.getStatus() == Bed.Status.AVAILABLE).count();

        long pendingApps = apps.stream().filter(a -> a.getStatus() == Application.Status.PENDING).count();
        long approvedApps = apps.stream().filter(a -> a.getStatus() == Application.Status.APPROVED).count();
        long rejectedApps = apps.stream().filter(a -> a.getStatus() == Application.Status.REJECTED).count();

        long activeStudents = allocs.stream().filter(a -> a.getStatus() == Allocation.Status.ACTIVE).count();

        long successfulPayments = payments.stream().filter(p -> p.getStatus() == Payment.Status.SUCCESS).count();
        long pendingPayments = payments.stream().filter(p -> p.getStatus() == Payment.Status.PENDING).count();
        double totalPaidAmount = payments.stream()
                .filter(p -> p.getStatus() == Payment.Status.SUCCESS)
                .mapToDouble(p -> p.getAmount() != null ? p.getAmount().doubleValue() : 0.0)
                .sum();

        Map<String, Object> stats = new HashMap<>();
        stats.put("hostelId", hostelId);
        stats.put("hostelName", hostel != null ? hostel.getHostelName() : "Hostel");
        stats.put("hostelType", hostel != null ? hostel.getHostelType().name() : "BOYS");
        stats.put("wardenName", headOpt.map(HostelHead::getFullName).orElse(userPrincipal.getName()));
        stats.put("employeeId", headOpt.map(HostelHead::getEmployeeId).orElse(hostelId == 1 ? "WH001" : "WH002"));

        stats.put("totalStudents", activeStudents);
        stats.put("totalRooms", rooms.size());
        stats.put("totalBeds", beds.size());
        stats.put("occupiedBeds", occupiedBeds);
        stats.put("availableBeds", availableBeds);

        stats.put("totalApplications", apps.size());
        stats.put("pendingApplications", pendingApps);
        stats.put("approvedApplications", approvedApps);
        stats.put("rejectedApplications", rejectedApps);

        stats.put("totalPaymentsAmount", totalPaidAmount);
        stats.put("successfulPayments", successfulPayments);
        stats.put("pendingPayments", pendingPayments);

        return ResponseEntity.ok(ApiResponse.success("Warden dashboard stats retrieved successfully", stats));
    }

    @GetMapping("/applications")
    public ResponseEntity<ApiResponse<List<Application>>> getApplications(@AuthenticationPrincipal UserPrincipal userPrincipal,
                                                                          @RequestParam(required = false) String status,
                                                                          @RequestParam(required = false) String search) {
        Long hostelId = resolveHostelId(userPrincipal, null);
        List<Application> apps = applicationRepository.findByHostelId(hostelId);

        if (status != null && !status.equalsIgnoreCase("ALL")) {
            apps = apps.stream().filter(a -> a.getStatus().name().equalsIgnoreCase(status)).toList();
        }

        return ResponseEntity.ok(ApiResponse.success("Hostel applications retrieved", apps));
    }

    @GetMapping("/applications/{id}")
    public ResponseEntity<ApiResponse<Application>> getApplicationById(@AuthenticationPrincipal UserPrincipal userPrincipal,
                                                                       @PathVariable Long id) {
        Long hostelId = resolveHostelId(userPrincipal, null);
        return applicationRepository.findById(id)
                .filter(a -> a.getHostel().getId().equals(hostelId))
                .map(a -> ResponseEntity.ok(ApiResponse.success("Application details retrieved", a)))
                .orElse(ResponseEntity.badRequest().body(ApiResponse.error("Application not found in your hostel")));
    }

    @PutMapping("/applications/{id}/approve")
    public ResponseEntity<ApiResponse<Application>> approveApplication(@AuthenticationPrincipal UserPrincipal userPrincipal,
                                                                       @PathVariable Long id) {
        Long hostelId = resolveHostelId(userPrincipal, null);
        Application app = applicationRepository.findById(id)
                .filter(a -> a.getHostel().getId().equals(hostelId))
                .orElseThrow(() -> new RuntimeException("Application not found or unauthorized"));

        ApplicationReviewRequest req = new ApplicationReviewRequest();
        req.setStatus(Application.Status.APPROVED);
        req.setRemarks("Admission approved by Warden");

        Application reviewed = applicationService.reviewApplication(id, req, userPrincipal.getName());
        return ResponseEntity.ok(ApiResponse.success("Application approved by Warden", reviewed));
    }

    @PutMapping("/applications/{id}/reject")
    public ResponseEntity<ApiResponse<Application>> rejectApplication(@AuthenticationPrincipal UserPrincipal userPrincipal,
                                                                      @PathVariable Long id,
                                                                      @RequestBody Map<String, String> body) {
        Long hostelId = resolveHostelId(userPrincipal, null);
        Application app = applicationRepository.findById(id)
                .filter(a -> a.getHostel().getId().equals(hostelId))
                .orElseThrow(() -> new RuntimeException("Application not found or unauthorized"));

        String reason = body.getOrDefault("reason", body.getOrDefault("rejectionReason", "Criteria not met"));
        ApplicationReviewRequest req = new ApplicationReviewRequest();
        req.setStatus(Application.Status.REJECTED);
        req.setRejectionReason(reason);

        Application reviewed = applicationService.reviewApplication(id, req, userPrincipal.getName());
        return ResponseEntity.ok(ApiResponse.success("Application rejected with reason", reviewed));
    }

    @GetMapping("/students")
    public ResponseEntity<ApiResponse<List<Student>>> getStudents(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        Long hostelId = resolveHostelId(userPrincipal, null);
        List<Application> apps = applicationRepository.findByHostelId(hostelId);
        List<Student> students = apps.stream().map(Application::getStudent).distinct().toList();
        return ResponseEntity.ok(ApiResponse.success("Hostel students retrieved", students));
    }

    @GetMapping("/rooms")
    public ResponseEntity<ApiResponse<List<Room>>> getRooms(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        Long hostelId = resolveHostelId(userPrincipal, null);
        return ResponseEntity.ok(ApiResponse.success("Hostel rooms retrieved", roomRepository.findByHostelId(hostelId)));
    }

    @GetMapping("/beds")
    public ResponseEntity<ApiResponse<List<Bed>>> getBeds(@AuthenticationPrincipal UserPrincipal userPrincipal,
                                                          @RequestParam(required = false) Long roomId) {
        Long hostelId = resolveHostelId(userPrincipal, null);
        List<Bed> beds;
        if (roomId != null) {
            beds = bedRepository.findByRoomId(roomId);
        } else {
            beds = bedRepository.findByRoomHostelId(hostelId);
        }
        return ResponseEntity.ok(ApiResponse.success("Hostel beds retrieved", beds));
    }

    @GetMapping("/allocations")
    public ResponseEntity<ApiResponse<List<Allocation>>> getAllocations(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        Long hostelId = resolveHostelId(userPrincipal, null);
        return ResponseEntity.ok(ApiResponse.success("Hostel allocations retrieved", allocationRepository.findByHostelId(hostelId)));
    }

    @PostMapping("/allocations")
    public ResponseEntity<ApiResponse<Allocation>> createAllocation(@AuthenticationPrincipal UserPrincipal userPrincipal,
                                                                    @RequestBody Map<String, Object> body) {
        Long hostelId = resolveHostelId(userPrincipal, null);
        Long studentId = Long.valueOf(body.get("studentId").toString());
        Long roomId = Long.valueOf(body.get("roomId").toString());
        Long bedId = Long.valueOf(body.get("bedId").toString());

        Room room = roomRepository.findById(roomId).orElseThrow(() -> new RuntimeException("Room not found"));
        if (!room.getHostel().getId().equals(hostelId)) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Room does not belong to your assigned hostel"));
        }

        Bed bed = bedRepository.findById(bedId).orElseThrow(() -> new RuntimeException("Bed not found"));
        if (bed.getStatus() != Bed.Status.AVAILABLE) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Bed is already " + bed.getStatus() + ". Only AVAILABLE beds can be allocated."));
        }

        Student student = studentRepository.findById(studentId).orElseThrow(() -> new RuntimeException("Student not found"));

        Allocation alloc = new Allocation();
        alloc.setStudent(student);
        alloc.setHostel(room.getHostel());
        alloc.setRoom(room);
        alloc.setBed(bed);
        alloc.setStatus(Allocation.Status.ACTIVE);
        alloc.setAllocationDate(LocalDateTime.now());
        alloc.setAllocatedBy(userPrincipal.getName());

        Allocation saved = allocationRepository.save(alloc);

        bed.setStatus(Bed.Status.OCCUPIED);
        bedRepository.save(bed);

        return ResponseEntity.ok(ApiResponse.success("Room and bed allocated successfully", saved));
    }

    @GetMapping("/payments")
    public ResponseEntity<ApiResponse<List<Payment>>> getPayments(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        Long hostelId = resolveHostelId(userPrincipal, null);
        return ResponseEntity.ok(ApiResponse.success("Hostel payments retrieved", paymentRepository.findByApplicationHostelId(hostelId)));
    }

    @GetMapping("/reports")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getReports(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        Long hostelId = resolveHostelId(userPrincipal, null);
        Hostel hostel = hostelRepository.findById(hostelId).orElse(null);

        Map<String, Object> report = new HashMap<>();
        report.put("hostelId", hostelId);
        report.put("hostelName", hostel != null ? hostel.getHostelName() : "Hostel");
        report.put("occupancyReport", roomRepository.findByHostelId(hostelId));
        report.put("studentResidentReport", allocationRepository.findByHostelId(hostelId));
        return ResponseEntity.ok(ApiResponse.success("Hostel reports compiled", report));
    }
}
