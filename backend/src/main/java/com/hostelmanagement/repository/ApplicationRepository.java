package com.hostelmanagement.repository;

import com.hostelmanagement.entity.Application;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {
    List<Application> findByStudentId(Long studentId);
    Optional<Application> findTopByStudentIdOrderByCreatedAtDesc(Long studentId);
    List<Application> findByHostelId(Long hostelId);
    List<Application> findByHostelIdAndStatus(Long hostelId, Application.ApplicationStatus status);
    List<Application> findByStatus(Application.ApplicationStatus status);

    long countByStatus(Application.ApplicationStatus status);
    long countByHostelIdAndStatus(Long hostelId, Application.ApplicationStatus status);
    long countByHostelId(Long hostelId);

    @Query("SELECT a FROM Application a WHERE a.hostel.id = :hostelId AND " +
           "(LOWER(a.student.fullName) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(a.student.studentId) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(a.student.rollNumber) LIKE LOWER(CONCAT('%', :q, '%')))")
    List<Application> searchApplicationsByHostel(@Param("hostelId") Long hostelId, @Param("q") String query);
}
