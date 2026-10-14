package com.hostelmanagement.service;

import com.hostelmanagement.entity.Hostel;
import com.hostelmanagement.exception.ResourceNotFoundException;
import com.hostelmanagement.repository.HostelRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class HostelService {

    private final HostelRepository hostelRepository;

    public HostelService(HostelRepository hostelRepository) {
        this.hostelRepository = hostelRepository;
    }

    public List<Hostel> getAllHostels() {
        return hostelRepository.findAll();
    }

    public Hostel getHostelById(Long id) {
        return hostelRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hostel not found with id: " + id));
    }

    public Hostel getHostelByType(Hostel.HostelType type) {
        return hostelRepository.findByHostelType(type)
                .orElseThrow(() -> new ResourceNotFoundException("Hostel not found for type: " + type));
    }
}
