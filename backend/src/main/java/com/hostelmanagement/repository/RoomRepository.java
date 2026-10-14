package com.hostelmanagement.repository;

import com.hostelmanagement.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoomRepository extends JpaRepository<Room, Long> {
    List<Room> findByHostelId(Long hostelId);
    Optional<Room> findByHostelIdAndRoomNumber(Long hostelId, String roomNumber);
    long countByHostelId(Long hostelId);

    @Query("SELECT r FROM Room r WHERE r.hostel.id = :hostelId AND " +
           "(LOWER(r.roomNumber) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(r.roomType) LIKE LOWER(CONCAT('%', :q, '%')))")
    List<Room> searchRoomsByHostel(@Param("hostelId") Long hostelId, @Param("q") String query);
}
