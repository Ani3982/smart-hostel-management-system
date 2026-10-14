package com.hostelmanagement.service;

import com.hostelmanagement.dto.RoomRequest;
import com.hostelmanagement.entity.Bed;
import com.hostelmanagement.entity.Hostel;
import com.hostelmanagement.entity.Room;
import com.hostelmanagement.exception.BadRequestException;
import com.hostelmanagement.exception.ResourceNotFoundException;
import com.hostelmanagement.repository.BedRepository;
import com.hostelmanagement.repository.HostelRepository;
import com.hostelmanagement.repository.RoomRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class RoomService {

    private final RoomRepository roomRepository;
    private final HostelRepository hostelRepository;
    private final BedRepository bedRepository;

    public RoomService(RoomRepository roomRepository,
                       HostelRepository hostelRepository,
                       BedRepository bedRepository) {
        this.roomRepository = roomRepository;
        this.hostelRepository = hostelRepository;
        this.bedRepository = bedRepository;
    }

    public List<Room> getAllRooms() {
        return roomRepository.findAll();
    }

    public List<Room> getRoomsByHostel(Long hostelId) {
        return roomRepository.findByHostelId(hostelId);
    }

    public Room getRoomById(Long id) {
        return roomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with id: " + id));
    }

    @Transactional
    public Room createRoom(RoomRequest req) {
        Hostel hostel = hostelRepository.findById(req.getHostelId())
                .orElseThrow(() -> new ResourceNotFoundException("Hostel not found with id: " + req.getHostelId()));

        if (roomRepository.findByHostelIdAndRoomNumber(hostel.getId(), req.getRoomNumber()).isPresent()) {
            throw new BadRequestException("Room " + req.getRoomNumber() + " already exists in this hostel");
        }

        Room room = new Room(hostel, req.getRoomNumber(), req.getFloor(), req.getCapacity(), req.getRoomType());
        Room savedRoom = roomRepository.save(room);

        // Auto-generate initial beds according to capacity (e.g. Bed 01, Bed 02...)
        for (int i = 1; i <= req.getCapacity(); i++) {
            String bedNum = String.format("%s-%02d", req.getRoomNumber(), i);
            Bed bed = new Bed(savedRoom, bedNum);
            bedRepository.save(bed);
        }

        // Update total rooms count in hostel
        hostel.setTotalRooms((int) roomRepository.countByHostelId(hostel.getId()));
        hostelRepository.save(hostel);

        return savedRoom;
    }

    @Transactional
    public Room updateRoom(Long id, RoomRequest req) {
        Room room = getRoomById(id);
        room.setRoomNumber(req.getRoomNumber());
        room.setFloor(req.getFloor());
        room.setCapacity(req.getCapacity());
        room.setRoomType(req.getRoomType());
        if (req.getStatus() != null) {
            room.setStatus(Room.RoomStatus.valueOf(req.getStatus().toUpperCase()));
        }
        return roomRepository.save(room);
    }

    @Transactional
    public void deleteRoom(Long id) {
        Room room = getRoomById(id);
        Hostel hostel = room.getHostel();
        roomRepository.delete(room);
        hostel.setTotalRooms((int) roomRepository.countByHostelId(hostel.getId()));
        hostelRepository.save(hostel);
    }

    public List<Room> searchRooms(Long hostelId, String query) {
        if (query == null || query.trim().isEmpty()) {
            return getRoomsByHostel(hostelId);
        }
        return roomRepository.searchRoomsByHostel(hostelId, query.trim());
    }

    @Transactional
    public void updateRoomStatusBasedOnBeds(Long roomId) {
        Room room = getRoomById(roomId);
        List<Bed> beds = bedRepository.findByRoomId(roomId);
        long occupiedCount = beds.stream()
                .filter(b -> b.getStatus() == Bed.BedStatus.OCCUPIED || b.getStatus() == Bed.BedStatus.RESERVED)
                .count();

        if (occupiedCount == 0) {
            room.setStatus(Room.RoomStatus.AVAILABLE);
        } else if (occupiedCount >= room.getCapacity()) {
            room.setStatus(Room.RoomStatus.FULL);
        } else {
            room.setStatus(Room.RoomStatus.PARTIALLY_OCCUPIED);
        }
        roomRepository.save(room);
    }
}
