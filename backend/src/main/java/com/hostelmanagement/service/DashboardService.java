package com.hostelmanagement.service;

import com.hostelmanagement.dto.DashboardStatsDTO;
import com.hostelmanagement.dto.HostelStatsDTO;
import com.hostelmanagement.entity.Application;
import com.hostelmanagement.entity.Bed;
import com.hostelmanagement.entity.Hostel;
import com.hostelmanagement.entity.Payment;
import com.hostelmanagement.repository.*;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class DashboardService {

    private final HostelRepository hostelRepository;
    private final RoomRepository roomRepository;
    private final BedRepository bedRepository;
    private final StudentRepository studentRepository;
    private final ApplicationRepository applicationRepository;
    private final PaymentRepository paymentRepository;

    public DashboardService(HostelRepository hostelRepository,
                            RoomRepository roomRepository,
                            BedRepository bedRepository,
                            StudentRepository studentRepository,
                            ApplicationRepository applicationRepository,
                            PaymentRepository paymentRepository) {
        this.hostelRepository = hostelRepository;
        this.roomRepository = roomRepository;
        this.bedRepository = bedRepository;
        this.studentRepository = studentRepository;
        this.applicationRepository = applicationRepository;
        this.paymentRepository = paymentRepository;
    }

    public DashboardStatsDTO getAdminDashboardStats() {
        DashboardStatsDTO stats = new DashboardStatsDTO();

        long totalHostels = hostelRepository.count();
        long totalRooms = roomRepository.count();
        long totalBeds = bedRepository.count();
        long occupiedBeds = bedRepository.countTotalOccupiedOrReservedBeds();
        long maintenanceBeds = bedRepository.countByStatus(Bed.BedStatus.MAINTENANCE);
        long availableBeds = Math.max(0, totalBeds - occupiedBeds - maintenanceBeds);
        long totalStudents = studentRepository.count();

        long totalApps = applicationRepository.count();
        long pendingApps = applicationRepository.countByStatus(Application.ApplicationStatus.PENDING);
        long approvedApps = applicationRepository.countByStatus(Application.ApplicationStatus.APPROVED);
        long rejectedApps = applicationRepository.countByStatus(Application.ApplicationStatus.REJECTED);

        BigDecimal totalPayments = paymentRepository.sumTotalSuccessfulPayments();
        long successPayCount = paymentRepository.countByStatus(Payment.PaymentStatus.SUCCESS);
        long pendingPayCount = paymentRepository.countByStatus(Payment.PaymentStatus.PENDING);

        stats.setTotalHostels(totalHostels);
        stats.setTotalRooms(totalRooms);
        stats.setTotalBeds(totalBeds);
        stats.setOccupiedBeds(occupiedBeds);
        stats.setAvailableBeds(availableBeds);
        stats.setMaintenanceBeds(maintenanceBeds);
        stats.setTotalStudents(totalStudents);
        stats.setTotalApplications(totalApps);
        stats.setPendingApplications(pendingApps);
        stats.setApprovedApplications(approvedApps);
        stats.setRejectedApplications(rejectedApps);
        stats.setTotalPaymentsAmount(totalPayments != null ? totalPayments : BigDecimal.ZERO);
        stats.setSuccessfulPaymentsCount(successPayCount);
        stats.setPendingPaymentsCount(pendingPayCount);

        // Fetch individual breakdown for Boys and Girls Hostel
        hostelRepository.findByHostelType(Hostel.HostelType.BOYS).ifPresent(bh -> {
            stats.setBoysHostel(getHostelDashboardStats(bh.getId()));
        });

        hostelRepository.findByHostelType(Hostel.HostelType.GIRLS).ifPresent(gh -> {
            stats.setGirlsHostel(getHostelDashboardStats(gh.getId()));
        });

        return stats;
    }

    public HostelStatsDTO getHostelDashboardStats(Long hostelId) {
        Hostel hostel = hostelRepository.findById(hostelId).orElse(null);
        HostelStatsDTO dto = new HostelStatsDTO();

        if (hostel == null) {
            return dto;
        }

        dto.setHostelId(hostel.getId());
        dto.setHostelName(hostel.getHostelName());
        dto.setHostelType(hostel.getHostelType().name());

        long rooms = roomRepository.countByHostelId(hostelId);
        long beds = bedRepository.countTotalBedsByHostelId(hostelId);
        long occupied = bedRepository.countOccupiedOrReservedBedsByHostelId(hostelId);
        long maintenance = bedRepository.countBedsByHostelIdAndStatus(hostelId, Bed.BedStatus.MAINTENANCE);
        long available = Math.max(0, beds - occupied - maintenance);
        long students = studentRepository.countAllocatedStudentsByHostelId(hostelId);

        long apps = applicationRepository.countByHostelId(hostelId);
        long pendingApps = applicationRepository.countByHostelIdAndStatus(hostelId, Application.ApplicationStatus.PENDING);
        long approvedApps = applicationRepository.countByHostelIdAndStatus(hostelId, Application.ApplicationStatus.APPROVED);
        long rejectedApps = applicationRepository.countByHostelIdAndStatus(hostelId, Application.ApplicationStatus.REJECTED);

        BigDecimal payments = paymentRepository.sumSuccessfulPaymentsByHostelId(hostelId);
        long successPayCount = paymentRepository.countByHostelIdAndStatus(hostelId, Payment.PaymentStatus.SUCCESS);
        long pendingPayCount = paymentRepository.countByHostelIdAndStatus(hostelId, Payment.PaymentStatus.PENDING);

        dto.setTotalRooms(rooms);
        dto.setTotalBeds(beds);
        dto.setOccupiedBeds(occupied);
        dto.setAvailableBeds(available);
        dto.setMaintenanceBeds(maintenance);
        dto.setTotalStudents(students);
        dto.setTotalApplications(apps);
        dto.setPendingApplications(pendingApps);
        dto.setApprovedApplications(approvedApps);
        dto.setRejectedApplications(rejectedApps);
        dto.setTotalPaymentsAmount(payments != null ? payments : BigDecimal.ZERO);
        dto.setSuccessfulPaymentsCount(successPayCount);
        dto.setPendingPaymentsCount(pendingPayCount);

        return dto;
    }
}
