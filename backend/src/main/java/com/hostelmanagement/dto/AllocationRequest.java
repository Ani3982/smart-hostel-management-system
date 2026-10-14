package com.hostelmanagement.dto;

import jakarta.validation.constraints.NotNull;

public class AllocationRequest {
    @NotNull(message = "Student ID is required")
    private Long studentId;

    @NotNull(message = "Hostel ID is required")
    private Long hostelId;

    @NotNull(message = "Room ID is required")
    private Long roomId;

    @NotNull(message = "Bed ID is required")
    private Long bedId;

    public AllocationRequest() {}

    public AllocationRequest(Long studentId, Long hostelId, Long roomId, Long bedId) {
        this.studentId = studentId;
        this.hostelId = hostelId;
        this.roomId = roomId;
        this.bedId = bedId;
    }

    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }

    public Long getHostelId() { return hostelId; }
    public void setHostelId(Long hostelId) { this.hostelId = hostelId; }

    public Long getRoomId() { return roomId; }
    public void setRoomId(Long roomId) { this.roomId = roomId; }

    public Long getBedId() { return bedId; }
    public void setBedId(Long bedId) { this.bedId = bedId; }
}
