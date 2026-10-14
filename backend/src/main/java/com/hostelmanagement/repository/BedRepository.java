package com.hostelmanagement.repository;

import com.hostelmanagement.entity.Bed;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BedRepository extends JpaRepository<Bed, Long> {
    List<Bed> findByRoomId(Long roomId);
    Optional<Bed> findByRoomIdAndBedNumber(Long roomId, String bedNumber);

    @Query("SELECT b FROM Bed b WHERE b.room.hostel.id = :hostelId")
    List<Bed> findByHostelId(@Param("hostelId") Long hostelId);

    @Query("SELECT b FROM Bed b WHERE b.room.hostel.id = :hostelId AND b.status = :status")
    List<Bed> findByHostelIdAndStatus(@Param("hostelId") Long hostelId, @Param("status") Bed.BedStatus status);

    @Query("SELECT COUNT(b) FROM Bed b WHERE b.room.hostel.id = :hostelId")
    long countTotalBedsByHostelId(@Param("hostelId") Long hostelId);

    @Query("SELECT COUNT(b) FROM Bed b WHERE b.room.hostel.id = :hostelId AND b.status = :status")
    long countBedsByHostelIdAndStatus(@Param("hostelId") Long hostelId, @Param("status") Bed.BedStatus status);

    @Query("SELECT COUNT(b) FROM Bed b WHERE b.room.hostel.id = :hostelId AND b.status IN ('OCCUPIED', 'RESERVED')")
    long countOccupiedOrReservedBedsByHostelId(@Param("hostelId") Long hostelId);

    long countByStatus(Bed.BedStatus status);

    @Query("SELECT COUNT(b) FROM Bed b WHERE b.status IN ('OCCUPIED', 'RESERVED')")
    long countTotalOccupiedOrReservedBeds();
}
