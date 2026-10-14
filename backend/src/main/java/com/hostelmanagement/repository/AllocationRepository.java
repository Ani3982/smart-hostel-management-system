package com.hostelmanagement.repository;

import com.hostelmanagement.entity.Allocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AllocationRepository extends JpaRepository<Allocation, Long> {
    Optional<Allocation> findByStudentId(Long studentId);
    Optional<Allocation> findByStudentIdAndStatus(Long studentId, Allocation.Status status);
    Optional<Allocation> findByBedIdAndStatus(Long bedId, Allocation.Status status);
    List<Allocation> findByHostelId(Long hostelId);
    List<Allocation> findByHostelIdAndStatus(Long hostelId, Allocation.Status status);
    long countByHostelIdAndStatus(Long hostelId, Allocation.Status status);
    Boolean existsByStudentIdAndStatus(Long studentId, Allocation.Status status);
    Boolean existsByBedIdAndStatus(Long bedId, Allocation.Status status);
}
