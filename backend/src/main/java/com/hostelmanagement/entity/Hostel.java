package com.hostelmanagement.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "hostels")
public class Hostel {

    public enum HostelType {
        BOYS, GIRLS
    }

    public enum Status {
        ACTIVE, INACTIVE
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "hostel_name", nullable = false, length = 150)
    private String hostelName;

    @Enumerated(EnumType.STRING)
    @Column(name = "hostel_type", nullable = false, unique = true, length = 20)
    private HostelType hostelType;

    @Column(nullable = false, length = 255)
    private String address;

    @Column(name = "total_rooms")
    private Integer totalRooms = 0;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private Status status = Status.ACTIVE;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public Hostel() {}

    public Hostel(String hostelName, HostelType hostelType, String address, Integer totalRooms) {
        this.hostelName = hostelName;
        this.hostelType = hostelType;
        this.address = address;
        this.totalRooms = totalRooms;
        this.status = Status.ACTIVE;
        this.createdAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getHostelName() { return hostelName; }
    public void setHostelName(String hostelName) { this.hostelName = hostelName; }

    public HostelType getHostelType() { return hostelType; }
    public void setHostelType(HostelType hostelType) { this.hostelType = hostelType; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public Integer getTotalRooms() { return totalRooms; }
    public void setTotalRooms(Integer totalRooms) { this.totalRooms = totalRooms; }

    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
