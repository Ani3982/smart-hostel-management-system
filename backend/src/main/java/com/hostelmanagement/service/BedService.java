package com.hostelmanagement.service;

import com.hostelmanagement.dto.BedRequest;
import com.hostelmanagement.entity.Bed;
import com.hostelmanagement.entity.Room;
import com.hostelmanagement.exception.BadRequestException;
import com.hostelmanagement.exception.ResourceNotFoundException;
import com.hostelmanagement.repository.BedRepository;
import com.hostelmanagement.repository.RoomRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class BedService {

    private final BedRepository bedRepository;
    private final RoomRepository roomRepository;

    public BedService(BedRepository bedRepository, RoomRepository roomRepository) {
        this.bedRepository = bedRepository;
        this.roomRepository = roomRepository;
    }

    public List<Bed> getAllBeds() {
        return bedRepository.findAll();
    }

    public List<Bed> getBedsByRoom(Long roomId) {
        return bedRepository.findByRoomId(roomId);
    }

    public List<Bed> getBedsByHostel(Long hostelId) {
        return bedRepository.findByHostelId(hostelId);
    }

    public List<Bed> getAvailableBedsByHostel(Long hostelId) {
        return bedRepository.findByHostelIdAndStatus(hostelId, Bed.BedStatus.AVAILABLE);
    }

    public Bed getBedById(Long id) {
        return bedRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bed not found with id: " + id));
    }

    @Transactional
    public Bed createBed(BedRequest req) {
        Room room = roomRepository.findById(req.getRoomId())
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with id: " + req.getRoomId()));

        if (bedRepository.findByRoomIdAndBedNumber(room.getId(), req.getBedNumber()).isPresent()) {
            throw new BadRequestException("Bed " + req.getBedNumber() + " already exists in this room");
        }

        Bed bed = new Bed(room, req.getBedNumber());
        if (req.getStatus() != null) {
            bed.setStatus(Bed.BedStatus.valueOf(req.getStatus().toUpperCase()));
        }
        return bedRepository.save(bed);
    }

    @Transactional
    public Bed updateBed(Long id, BedRequest req) {
        Bed bed = getBedById(id);
        bed.setBedNumber(req.getBedNumber());
        if (req.getStatus() != null) {
            bed.setStatus(Bed.BedStatus.valueOf(req.getStatus().toUpperCase()));
        }
        return bedRepository.save(bed);
    }

    @Transactional
    public Bed updateBedStatus(Long id, Bed.BedStatus status) {
        Bed bed = getBedById(id);
        bed.setStatus(status);
        return bedRepository.save(bed);
    }

    @Transactional
    public void deleteBed(Long id) {
        Bed bed = getBedById(id);
        bedRepository.delete(bed);
    }
}
