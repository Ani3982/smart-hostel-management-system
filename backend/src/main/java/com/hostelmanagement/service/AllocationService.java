package com.hostelmanagement.service;

import com.hostelmanagement.dto.AllocationRequest;
import com.hostelmanagement.entity.*;
import com.hostelmanagement.exception.BadRequestException;
import com.hostelmanagement.exception.ConflictException;
import com.hostelmanagement.exception.ResourceNotFoundException;
import com.hostelmanagement.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AllocationService {

    private final AllocationRepository allocationRepository;
    private final StudentRepository studentRepository;
    private final HostelRepository hostelRepository;
    private final RoomRepository roomRepository;
    private final BedRepository bedRepository;
    private final ApplicationRepository applicationRepository;
    private final RoomService roomService;
    private final NotificationService notificationService;

    public AllocationService(AllocationRepository allocationRepository,
                             StudentRepository studentRepository,
                             HostelRepository hostelRepository,
                             RoomRepository roomRepository,
                             BedRepository bedRepository,
                             ApplicationRepository applicationRepository,
                             RoomService roomService,
                             NotificationService notificationService) {
        this.allocationRepository = allocationRepository;
        this.studentRepository = studentRepository;
        this.hostelRepository = hostelRepository;
        this.roomRepository = roomRepository;
        this.bedRepository = bedRepository;
        this.applicationRepository = applicationRepository;
        this.roomService = roomService;
        this.notificationService = notificationService;
    }

    public List<Allocation> getAllAllocations() {
        return allocationRepository.findAll();
    }

    public List<Allocation> getAllocationsByHostel(Long hostelId) {
        return allocationRepository.findByHostelIdAndStatus(hostelId, Allocation.Status.ACTIVE);
    }

    public Allocation getAllocationByStudentId(Long studentId) {
        return allocationRepository.findByStudentIdAndStatus(studentId, Allocation.Status.ACTIVE)
                .orElse(null);
    }

    @Transactional
    public Allocation allocateBed(AllocationRequest req, String allocatedByUsername) {
        Student student = studentRepository.findById(req.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + req.getStudentId()));

        Hostel hostel = hostelRepository.findById(req.getHostelId())
                .orElseThrow(() -> new ResourceNotFoundException("Hostel not found with id: " + req.getHostelId()));

        Room room = roomRepository.findById(req.getRoomId())
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with id: " + req.getRoomId()));

        Bed bed = bedRepository.findById(req.getBedId())
                .orElseThrow(() -> new ResourceNotFoundException("Bed not found with id: " + req.getBedId()));

        // Rule: Application must be approved first
        List<Application> apps = applicationRepository.findByStudentId(student.getId());
        boolean hasApprovedApp = apps.stream()
                .anyMatch(a -> a.getStatus() == Application.ApplicationStatus.APPROVED);
        if (!hasApprovedApp) {
            throw new BadRequestException("Student application must be APPROVED before room and bed allocation.");
        }

        // Rule: Student cannot be allocated two beds simultaneously
        if (allocationRepository.existsByStudentIdAndStatus(student.getId(), Allocation.Status.ACTIVE)) {
            throw new ConflictException("Student already has an active bed allocation.");
        }

        // Rule: Bed must be AVAILABLE and cannot be allocated to multiple students
        if (bed.getStatus() != Bed.BedStatus.AVAILABLE) {
            throw new ConflictException("Selected bed " + bed.getBedNumber() + " is already " + bed.getStatus());
        }

        if (allocationRepository.existsByBedIdAndStatus(bed.getId(), Allocation.Status.ACTIVE)) {
            throw new ConflictException("Selected bed is already allocated to another student.");
        }

        // Allocate Bed
        bed.setStatus(Bed.BedStatus.OCCUPIED);
        bedRepository.save(bed);

        Allocation allocation = new Allocation(student, hostel, room, bed, allocatedByUsername);
        Allocation saved = allocationRepository.save(allocation);

        // Update room status
        roomService.updateRoomStatusBasedOnBeds(room.getId());

        // Notify Student
        notificationService.createNotification(
                student.getUser().getId(),
                "Room & Bed Allocated!",
                "You have been allocated Room " + room.getRoomNumber() + ", Bed " + bed.getBedNumber() +
                        " in " + hostel.getHostelName() + ". Please proceed to fee payment to complete admission.",
                "SUCCESS"
        );

        return saved;
    }

    @Transactional
    public void deallocateBed(Long allocationId) {
        Allocation allocation = allocationRepository.findById(allocationId)
                .orElseThrow(() -> new ResourceNotFoundException("Allocation not found with id: " + allocationId));

        allocation.setStatus(Allocation.Status.CANCELLED);
        allocationRepository.save(allocation);

        Bed bed = allocation.getBed();
        bed.setStatus(Bed.BedStatus.AVAILABLE);
        bedRepository.save(bed);

        roomService.updateRoomStatusBasedOnBeds(allocation.getRoom().getId());

        notificationService.createNotification(
                allocation.getStudent().getUser().getId(),
                "Bed Allocation Cancelled",
                "Your bed allocation for Room " + allocation.getRoom().getRoomNumber() + " has been cancelled.",
                "INFO"
        );
    }
}
