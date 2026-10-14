package com.hostelmanagement.config;

import com.hostelmanagement.entity.*;
import com.hostelmanagement.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final HostelRepository hostelRepository;
    private final HostelHeadRepository hostelHeadRepository;
    private final StudentRepository studentRepository;
    private final RoomRepository roomRepository;
    private final BedRepository bedRepository;
    private final ApplicationRepository applicationRepository;
    private final AllocationRepository allocationRepository;
    private final PaymentRepository paymentRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           HostelRepository hostelRepository,
                           HostelHeadRepository hostelHeadRepository,
                           StudentRepository studentRepository,
                           RoomRepository roomRepository,
                           BedRepository bedRepository,
                           ApplicationRepository applicationRepository,
                           AllocationRepository allocationRepository,
                           PaymentRepository paymentRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.hostelRepository = hostelRepository;
        this.hostelHeadRepository = hostelHeadRepository;
        this.studentRepository = studentRepository;
        this.roomRepository = roomRepository;
        this.bedRepository = bedRepository;
        this.applicationRepository = applicationRepository;
        this.allocationRepository = allocationRepository;
        this.paymentRepository = paymentRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        log.info("Checking and seeding initial data for New Arts, Commerce and Science College, Ahilyanagar Hostel System...");

        // 1. Seed Hostels
        Hostel boysHostel = hostelRepository.findByHostelType(Hostel.HostelType.BOYS).orElseGet(() -> {
            Hostel h = new Hostel(
                    "Boys Hostel (छत्रपती शिवाजी महाराज वसतिगृह)",
                    Hostel.HostelType.BOYS,
                    "North Campus, New Arts, Commerce and Science College, Lal Taki Road, Ahilyanagar, Maharashtra 414001",
                    10
            );
            return hostelRepository.save(h);
        });

        Hostel girlsHostel = hostelRepository.findByHostelType(Hostel.HostelType.GIRLS).orElseGet(() -> {
            Hostel h = new Hostel(
                    "Girls Hostel (सावित्रीबाई फुले वसतिगृह)",
                    Hostel.HostelType.GIRLS,
                    "South Campus, New Arts, Commerce and Science College, Lal Taki Road, Ahilyanagar, Maharashtra 414001",
                    10
            );
            return hostelRepository.save(h);
        });

        // 2. Seed Super Admin
        if (!userRepository.existsByEmail("admin@hostel.com")) {
            User admin = new User(
                    "Chief Rector / Administrator",
                    "admin@hostel.com",
                    passwordEncoder.encode("Admin@123"),
                    User.Role.ADMIN
            );
            userRepository.save(admin);
            log.info("Created Super Admin: admin@hostel.com / Admin@123");
        }

        // 3. Seed Boys Hostel Head
        if (!userRepository.existsByEmail("boyshead@hostel.com")) {
            User bUser = new User(
                    "Prof. Suresh Patil (Boys Warden)",
                    "boyshead@hostel.com",
                    passwordEncoder.encode("Warden@123"),
                    User.Role.HOSTEL_HEAD
            );
            bUser = userRepository.save(bUser);

            HostelHead bHead = new HostelHead(
                    bUser,
                    boysHostel,
                    "Prof. Suresh Patil",
                    "9876543210",
                    "boyshead@hostel.com"
            );
            hostelHeadRepository.save(bHead);
            log.info("Created Boys Hostel Head: boyshead@hostel.com / Warden@123");
        }

        // 4. Seed Girls Hostel Head
        if (!userRepository.existsByEmail("girlshead@hostel.com")) {
            User gUser = new User(
                    "Dr. Sunita Deshmukh (Girls Warden)",
                    "girlshead@hostel.com",
                    passwordEncoder.encode("Warden@123"),
                    User.Role.HOSTEL_HEAD
            );
            gUser = userRepository.save(gUser);

            HostelHead gHead = new HostelHead(
                    gUser,
                    girlsHostel,
                    "Dr. Sunita Deshmukh",
                    "9876543211",
                    "girlshead@hostel.com"
            );
            hostelHeadRepository.save(gHead);
            log.info("Created Girls Hostel Head: girlshead@hostel.com / Warden@123");
        }

        // 5. Seed Rooms & Beds if none exist
        if (roomRepository.count() == 0) {
            log.info("Generating rooms and beds for Boys and Girls Hostels...");
            // Boys Hostel: 10 rooms (B-101 to B-110), 4 beds per room
            for (int i = 1; i <= 10; i++) {
                String roomNum = String.format("B-%03d", 100 + i);
                int floor = (i <= 5) ? 1 : 2;
                Room room = new Room(boysHostel, roomNum, floor, 4, "Standard 4-Sharing");
                Room savedRoom = roomRepository.save(room);

                for (int b = 1; b <= 4; b++) {
                    String bedNum = String.format("%s-%02d", roomNum, b);
                    Bed bed = new Bed(savedRoom, bedNum);
                    bedRepository.save(bed);
                }
            }
            boysHostel.setTotalRooms(10);
            hostelRepository.save(boysHostel);

            // Girls Hostel: 10 rooms (G-101 to G-110), 4 beds per room
            for (int i = 1; i <= 10; i++) {
                String roomNum = String.format("G-%03d", 100 + i);
                int floor = (i <= 5) ? 1 : 2;
                Room room = new Room(girlsHostel, roomNum, floor, 4, "Standard 4-Sharing");
                Room savedRoom = roomRepository.save(room);

                for (int b = 1; b <= 4; b++) {
                    String bedNum = String.format("%s-%02d", roomNum, b);
                    Bed bed = new Bed(savedRoom, bedNum);
                    bedRepository.save(bed);
                }
            }
            girlsHostel.setTotalRooms(10);
            hostelRepository.save(girlsHostel);
            log.info("Created 20 rooms and 80 beds total (40 Boys, 40 Girls).");
        }

        // 6. Seed Sample Students with applications, allocations, payments
        if (!userRepository.existsByEmail("student@hostel.com")) {
            // Student 1: Male Student with active allocation & payment
            User sUser1 = new User("Rahul Shinde", "student@hostel.com", passwordEncoder.encode("Student@123"), User.Role.STUDENT);
            sUser1 = userRepository.save(sUser1);

            Student student1 = new Student();
            student1.setUser(sUser1);
            student1.setStudentId("NACSC-2026-001");
            student1.setFullName("Rahul Ashok Shinde");
            student1.setDob(LocalDate.of(2003, 5, 14));
            student1.setGender(Student.Gender.MALE);
            student1.setMobile("9822334455");
            student1.setEmail("student@hostel.com");
            student1.setAddress("Shivaji Nagar, Pipeline Road");
            student1.setCity("Ahilyanagar");
            student1.setState("Maharashtra");
            student1.setPincode("414003");
            student1.setCollegeName("New Arts, Commerce and Science College, Ahilyanagar (Autonomous)");
            student1.setCourse("M.Sc. Computer Science");
            student1.setDepartment("Computer Science");
            student1.setAcademicYear("First Year (Part I)");
            student1.setRollNumber("MCS-24");
            student1.setParentName("Ashok Shinde");
            student1.setParentMobile("9822334450");
            student1.setEmergencyContact("9822334451");
            student1 = studentRepository.save(student1);

            // Application
            Application app1 = new Application(student1, boysHostel, "Standard 4-Sharing", "Resident of rural Ahilyanagar district");
            app1.setStatus(Application.ApplicationStatus.APPROVED);
            app1.setApprovedBy("Prof. Suresh Patil (Boys Warden)");
            app1.setApprovedDate(LocalDateTime.now().minusDays(2));
            app1 = applicationRepository.save(app1);

            // Allocate Bed B-101-01
            Room roomB101 = roomRepository.findByHostelIdAndRoomNumber(boysHostel.getId(), "B-101").orElse(null);
            if (roomB101 != null) {
                Bed bed1 = bedRepository.findByRoomIdAndBedNumber(roomB101.getId(), "B-101-01").orElse(null);
                if (bed1 != null) {
                    bed1.setStatus(Bed.BedStatus.OCCUPIED);
                    bedRepository.save(bed1);

                    Allocation alloc = new Allocation(student1, boysHostel, roomB101, bed1, "Prof. Suresh Patil");
                    allocationRepository.save(alloc);

                    roomB101.setStatus(Room.RoomStatus.PARTIALLY_OCCUPIED);
                    roomRepository.save(roomB101);

                    // Successful Payment
                    Payment payment = new Payment(
                            student1,
                            app1,
                            new BigDecimal("15000.00"),
                            Payment.PaymentMethod.UPI,
                            "TXN-NACSC-2026-9812",
                            Payment.PaymentStatus.SUCCESS,
                            "REC-20260928-8421"
                    );
                    paymentRepository.save(payment);
                }
            }
            log.info("Created Sample Student 1 (Male - Allocated & Paid): student@hostel.com / Student@123");
        }

        // Student 2: Female Student with pending application
        if (!userRepository.existsByEmail("priya@hostel.com")) {
            User sUser2 = new User("Priya Kulkarni", "priya@hostel.com", passwordEncoder.encode("Student@123"), User.Role.STUDENT);
            sUser2 = userRepository.save(sUser2);

            Student student2 = new Student();
            student2.setUser(sUser2);
            student2.setStudentId("NACSC-2026-002");
            student2.setFullName("Priya Sunil Kulkarni");
            student2.setDob(LocalDate.of(2004, 8, 22));
            student2.setGender(Student.Gender.FEMALE);
            student2.setMobile("9890112233");
            student2.setEmail("priya@hostel.com");
            student2.setAddress("Court Road, Savedi");
            student2.setCity("Ahilyanagar");
            student2.setState("Maharashtra");
            student2.setPincode("414002");
            student2.setCollegeName("New Arts, Commerce and Science College, Ahilyanagar (Autonomous)");
            student2.setCourse("M.Sc. Information Technology");
            student2.setDepartment("Information Technology");
            student2.setAcademicYear("First Year");
            student2.setRollNumber("MIT-12");
            student2.setParentName("Sunil Kulkarni");
            student2.setParentMobile("9890112230");
            student2.setEmergencyContact("9890112231");
            student2 = studentRepository.save(student2);

            Application app2 = new Application(student2, girlsHostel, "Standard 4-Sharing", "Merit student, need accommodation near college library");
            app2.setStatus(Application.ApplicationStatus.PENDING);
            applicationRepository.save(app2);
            log.info("Created Sample Student 2 (Female - Pending Application): priya@hostel.com / Student@123");
        }

        // Student 3: Male Student with pending application
        if (!userRepository.existsByEmail("amit@hostel.com")) {
            User sUser3 = new User("Amit Deshmukh", "amit@hostel.com", passwordEncoder.encode("Student@123"), User.Role.STUDENT);
            sUser3 = userRepository.save(sUser3);

            Student student3 = new Student();
            student3.setUser(sUser3);
            student3.setStudentId("NACSC-2026-003");
            student3.setFullName("Amit Ramesh Deshmukh");
            student3.setDob(LocalDate.of(2003, 11, 10));
            student3.setGender(Student.Gender.MALE);
            student3.setMobile("9860223344");
            student3.setEmail("amit@hostel.com");
            student3.setAddress("Station Road, Near Railway Station");
            student3.setCity("Ahilyanagar");
            student3.setState("Maharashtra");
            student3.setPincode("414001");
            student3.setCollegeName("New Arts, Commerce and Science College, Ahilyanagar (Autonomous)");
            student3.setCourse("B.Sc. Computer Science");
            student3.setDepartment("Computer Science");
            student3.setAcademicYear("Third Year");
            student3.setRollNumber("BCS-55");
            student3.setParentName("Ramesh Deshmukh");
            student3.setParentMobile("9860223340");
            student3.setEmergencyContact("9860223341");
            student3 = studentRepository.save(student3);

            Application app3 = new Application(student3, boysHostel, "Standard 4-Sharing", "Final year project work");
            app3.setStatus(Application.ApplicationStatus.PENDING);
            applicationRepository.save(app3);
            log.info("Created Sample Student 3 (Male - Pending Application): amit@hostel.com / Student@123");
        }

        log.info("Data initialization complete. All initial hostels, rooms, beds, heads, students, and sample data ready!");
    }
}
