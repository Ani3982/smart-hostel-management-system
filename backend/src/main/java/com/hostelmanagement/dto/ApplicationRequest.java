package com.hostelmanagement.dto;

import jakarta.validation.constraints.NotNull;

public class ApplicationRequest {
    @NotNull(message = "Hostel ID is required")
    private Long hostelId;

    private String preferredRoomType = "Standard 4-Sharing";
    private String remarks;

    public ApplicationRequest() {}

    public ApplicationRequest(Long hostelId, String preferredRoomType, String remarks) {
        this.hostelId = hostelId;
        this.preferredRoomType = preferredRoomType;
        this.remarks = remarks;
    }

    public Long getHostelId() { return hostelId; }
    public void setHostelId(Long hostelId) { this.hostelId = hostelId; }

    public String getPreferredRoomType() { return preferredRoomType; }
    public void setPreferredRoomType(String preferredRoomType) { this.preferredRoomType = preferredRoomType; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
}
