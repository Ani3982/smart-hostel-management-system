package com.hostelmanagement.repository;

import com.hostelmanagement.entity.HostelHead;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface HostelHeadRepository extends JpaRepository<HostelHead, Long> {
    Optional<HostelHead> findByUserId(Long userId);
    Optional<HostelHead> findByHostelId(Long hostelId);
}
