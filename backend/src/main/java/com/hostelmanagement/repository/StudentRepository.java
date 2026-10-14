package com.hostelmanagement.repository;

import com.hostelmanagement.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {
    Optional<Student> findByUserId(Long userId);
    Optional<Student> findByStudentId(String studentId);
    Optional<Student> findByEmail(String email);
    Boolean existsByStudentId(String studentId);
    Boolean existsByEmail(String email);
    List<Student> findByGender(Student.Gender gender);

    @Query("SELECT s FROM Student s WHERE " +
           "LOWER(s.fullName) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(s.studentId) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(s.email) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(s.course) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(s.rollNumber) LIKE LOWER(CONCAT('%', :q, '%'))")
    List<Student> searchStudents(@Param("q") String query);

    @Query("SELECT COUNT(s) FROM Student s JOIN Allocation a ON a.student.id = s.id WHERE a.hostel.id = :hostelId AND a.status = 'ACTIVE'")
    long countAllocatedStudentsByHostelId(@Param("hostelId") Long hostelId);

    @Query("SELECT s FROM Student s JOIN Allocation a ON a.student.id = s.id WHERE a.hostel.id = :hostelId AND a.status = 'ACTIVE'")
    List<Student> findAllocatedStudentsByHostelId(@Param("hostelId") Long hostelId);
}
