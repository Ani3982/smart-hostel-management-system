package com.hostelmanagement.service;

import com.hostelmanagement.dto.ApplicationRequest;
import com.hostelmanagement.dto.ApplicationReviewRequest;
import com.hostelmanagement.entity.Application;
import com.hostelmanagement.entity.Hostel;
import com.hostelmanagement.entity.Student;
import com.hostelmanagement.exception.BadRequestException;
import com.hostelmanagement.exception.ConflictException;
import com.hostelmanagement.exception.ResourceNotFoundException;
import com.hostelmanagement.repository.ApplicationRepository;
import com.hostelmanagement.repository.HostelRepository;
import com.hostelmanagement.repository.StudentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final StudentRepository studentRepository;
    private final HostelRepository hostelRepository;
    private final NotificationService notificationService;

    public ApplicationService(ApplicationRepository applicationRepository,
                              StudentRepository studentRepository,
                              HostelRepository hostelRepository,
                              NotificationService notificationService) {
        this.applicationRepository = applicationRepository;
        this.studentRepository = studentRepository;
        this.hostelRepository = hostelRepository;
        this.notificationService = notificationService;
    }

    public List<Application> getAllApplications() {
        return applicationRepository.findAll();
    }

    public List<Application> getApplicationsByHostel(Long hostelId) {
        return applicationRepository.findByHostelId(hostelId);
    }

    public List<Application> getPendingApplicationsByHostel(Long hostelId) {
        return applicationRepository.findByHostelIdAndStatus(hostelId, Application.ApplicationStatus.PENDING);
    }

    public List<Application> getAllPendingApplications() {
        return applicationRepository.findByStatus(Application.ApplicationStatus.PENDING);
    }

    public Application getApplicationById(Long id) {
        return applicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found with id: " + id));
    }

    public Application getStudentLatestApplication(Long studentId) {
        return applicationRepository.findTopByStudentIdOrderByCreatedAtDesc(studentId)
                .orElse(null);
    }

    @Transactional
    public Application submitApplication(Long studentId, ApplicationRequest req) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + studentId));

        Hostel hostel = hostelRepository.findById(req.getHostelId())
                .orElseThrow(() -> new ResourceNotFoundException("Hostel not found with id: " + req.getHostelId()));

        // Check if student already has a pending or approved application
        List<Application> existing = applicationRepository.findByStudentId(studentId);
        boolean hasActive = existing.stream().anyMatch(a ->
                a.getStatus() == Application.ApplicationStatus.PENDING ||
                a.getStatus() == Application.ApplicationStatus.APPROVED
        );
        if (hasActive) {
            throw new ConflictException("You already have an active hostel application.");
        }

        // Validate gender vs hostel type
        if (student.getGender() == Student.Gender.MALE && hostel.getHostelType() != Hostel.HostelType.BOYS) {
            throw new BadRequestException("Male students are only eligible for the Boys Hostel");
        }
        if (student.getGender() == Student.Gender.FEMALE && hostel.getHostelType() != Hostel.HostelType.GIRLS) {
            throw new BadRequestException("Female students are only eligible for the Girls Hostel");
        }

        Application app = new Application(student, hostel, req.getPreferredRoomType(), req.getRemarks());
        Application saved = applicationRepository.save(app);

        // Notify Student
        notificationService.createNotification(
                student.getUser().getId(),
                "Application Submitted",
                "Your hostel application for " + hostel.getHostelName() + " has been submitted successfully. Awaiting Warden verification.",
                "INFO"
        );

        return saved;
    }

    @Transactional
    public Application approveApplication(Long applicationId, String approvedByUsername) {
        Application app = getApplicationById(applicationId);

        if (app.getStatus() == Application.ApplicationStatus.APPROVED) {
            throw new BadRequestException("Application is already approved");
        }

        app.setStatus(Application.ApplicationStatus.APPROVED);
        app.setApprovedBy(approvedByUsername);
        app.setApprovedDate(LocalDateTime.now());
        app.setRejectionReason(null);
        Application saved = applicationRepository.save(app);

        notificationService.createNotification(
                app.getStudent().getUser().getId(),
                "Hostel Application Approved!",
                "Congratulations! Your hostel application has been approved by " + approvedByUsername + ". Please await Room and Bed allocation to proceed with fee payment.",
                "SUCCESS"
        );

        return saved;
    }

    @Transactional
    public Application rejectApplication(Long applicationId, ApplicationReviewRequest req, String rejectedByUsername) {
        Application app = getApplicationById(applicationId);

        if (req.getReason() == null || req.getReason().trim().isEmpty()) {
            throw new BadRequestException("A valid rejection reason must be provided");
        }

        app.setStatus(Application.ApplicationStatus.REJECTED);
        app.setApprovedBy(rejectedByUsername);
        app.setApprovedDate(LocalDateTime.now());
        app.setRejectionReason(req.getReason().trim());
        Application saved = applicationRepository.save(app);

        notificationService.createNotification(
                app.getStudent().getUser().getId(),
                "Hostel Application Update",
                "Your hostel application was not approved. Reason: " + req.getReason(),
                "WARNING"
        );

        return saved;
    }

    public List<Application> searchApplications(Long hostelId, String query) {
        if (query == null || query.trim().isEmpty()) {
            return getApplicationsByHostel(hostelId);
        }
        return applicationRepository.searchApplicationsByHostel(hostelId, query.trim());
    }
}
