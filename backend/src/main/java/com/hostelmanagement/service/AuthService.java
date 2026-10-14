package com.hostelmanagement.service;

import com.hostelmanagement.dto.AuthRequest;
import com.hostelmanagement.dto.AuthResponse;
import com.hostelmanagement.dto.RegisterRequest;
import com.hostelmanagement.entity.*;
import com.hostelmanagement.exception.BadRequestException;
import com.hostelmanagement.exception.ConflictException;
import com.hostelmanagement.repository.HostelHeadRepository;
import com.hostelmanagement.repository.HostelRepository;
import com.hostelmanagement.repository.StudentRepository;
import com.hostelmanagement.repository.UserRepository;
import com.hostelmanagement.security.JwtTokenProvider;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final HostelRepository hostelRepository;
    private final HostelHeadRepository hostelHeadRepository;
    private final ApplicationRepository applicationRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final NotificationService notificationService;

    public AuthService(AuthenticationManager authenticationManager,
                       UserRepository userRepository,
                       StudentRepository studentRepository,
                       HostelRepository hostelRepository,
                       HostelHeadRepository hostelHeadRepository,
                       ApplicationRepository applicationRepository,
                       PasswordEncoder passwordEncoder,
                       JwtTokenProvider tokenProvider,
                       NotificationService notificationService) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.studentRepository = studentRepository;
        this.hostelRepository = hostelRepository;
        this.hostelHeadRepository = hostelHeadRepository;
        this.applicationRepository = applicationRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
        this.notificationService = notificationService;
    }

    @Transactional
    public AuthResponse registerStudent(RegisterRequest req) {
        if (!req.getPassword().equals(req.getConfirmPassword())) {
            throw new BadRequestException("Password and confirm password do not match");
        }

        if (userRepository.existsByEmail(req.getEmail())) {
            throw new ConflictException("Email is already registered: " + req.getEmail());
        }

        if (studentRepository.existsByStudentId(req.getStudentId())) {
            throw new ConflictException("Student ID / PRN is already registered: " + req.getStudentId());
        }

        // Strict Gender vs Hostel selection validation on backend
        String genderUpper = req.getGender().trim().toUpperCase();
        String hostelUpper = req.getHostelType().trim().toUpperCase();

        if (genderUpper.equals("MALE") && !hostelUpper.contains("BOY")) {
            throw new BadRequestException("Male students must select Boys Hostel");
        }
        if (genderUpper.equals("FEMALE") && !hostelUpper.contains("GIRL")) {
            throw new BadRequestException("Female students must select Girls Hostel");
        }

        // Create User
        User user = new User();
        user.setName(req.getFullName());
        user.setEmail(req.getEmail());
        user.setPassword(passwordEncoder.encode(req.getPassword()));
        user.setRole(User.Role.STUDENT);
        user.setStatus(User.Status.ACTIVE);
        User savedUser = userRepository.save(user);

        // Create Student
        Student student = new Student();
        student.setUser(savedUser);
        student.setStudentId(req.getStudentId());
        student.setFullName(req.getFullName());
        student.setDob(req.getDob());
        student.setGender(Student.Gender.valueOf(genderUpper));
        student.setMobile(req.getMobile());
        student.setEmail(req.getEmail());
        student.setAddress(req.getAddress());
        student.setCity(req.getCity());
        student.setState(req.getState());
        student.setPincode(req.getPincode());
        student.setCollegeName(req.getCollegeName() != null ? req.getCollegeName() : "Ahilyanagar Jilha Maratha Vidya Prasarak Samaj's New Arts, Commerce & Science College, Ahilyanagar (Autonomous)");
        student.setCourse(req.getCourse());
        student.setDepartment(req.getDepartment());
        student.setAcademicYear(req.getAcademicYear());
        student.setRollNumber(req.getRollNumber());
        student.setParentName(req.getParentName());
        student.setParentMobile(req.getParentMobile());
        student.setEmergencyContact(req.getEmergencyContact());
        Student savedStudent = studentRepository.save(student);

        // Auto-create pending application for the student's selected hostel
        Hostel.HostelType hType = hostelUpper.contains("GIRL") ? Hostel.HostelType.GIRLS : Hostel.HostelType.BOYS;
        Hostel targetHostel = hostelRepository.findByHostelType(hType)
                .orElseGet(() -> hostelRepository.findAll().stream().findFirst().orElse(null));

        Long assignedHostelId = null;
        String assignedHostelName = null;
        if (targetHostel != null) {
            String roomType = req.getPreferredRoomType() != null && !req.getPreferredRoomType().isBlank()
                    ? req.getPreferredRoomType()
                    : "Standard 4-Sharing";
            String remarks = "Online registration application for " + req.getFullName();
            Application app = new Application(savedStudent, targetHostel, roomType, remarks);
            app.setStatus(Application.ApplicationStatus.PENDING);
            applicationRepository.save(app);
            assignedHostelId = targetHostel.getId();
            assignedHostelName = targetHostel.getHostelName();
        }

        // Welcome notification
        notificationService.createNotification(
                savedUser.getId(),
                "Welcome to Hostel Management System!",
                "Your admission registration for " + (assignedHostelName != null ? assignedHostelName : "Hostel") + " is submitted successfully. It is pending review by the Warden.",
                "SUCCESS"
        );

        // Auto authenticate and generate token
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword())
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        AuthResponse res = new AuthResponse(jwt, savedUser.getId(), savedUser.getName(), savedUser.getEmail(), "ROLE_STUDENT");
        res.setStudentId(savedStudent.getId());
        res.setHostelId(assignedHostelId);
        res.setHostelName(assignedHostelName);
        return res;
    }

    public AuthResponse login(AuthRequest req) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword())
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        User user = userRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> new BadRequestException("User not found"));

        AuthResponse res = new AuthResponse(jwt, user.getId(), user.getName(), user.getEmail(), "ROLE_" + user.getRole().name());

        if (user.getRole() == User.Role.STUDENT) {
            studentRepository.findByUserId(user.getId()).ifPresent(s -> res.setStudentId(s.getId()));
        } else if (user.getRole() == User.Role.HOSTEL_HEAD) {
            hostelHeadRepository.findByUserId(user.getId()).ifPresent(h -> {
                res.setHostelId(h.getHostel().getId());
                res.setHostelName(h.getHostel().getHostelName());
            });
        }

        return res;
    }
}
