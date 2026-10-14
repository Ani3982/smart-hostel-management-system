package com.hostelmanagement.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class BedRequest {
    @NotNull(message = "Room ID is required")
    private Long roomId;

    @NotBlank(message = "Bed number is required")
    private String bedNumber;

    private String status = "AVAILABLE";

    public BedRequest() {}

    public Long getRoomId() { return roomId; }
    public void setRoomId(Long roomId) { this.roomId = roomId; }

    public String getBedNumber() { return bedNumber; }
    public void setBedNumber(String bedNumber) { this.bedNumber = bedNumber; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
