package com.hostelmanagement.dto;

public class ApplicationReviewRequest {
    private String reason; // Rejection reason if rejecting
    private String remarks;

    public ApplicationReviewRequest() {}

    public ApplicationReviewRequest(String reason, String remarks) {
        this.reason = reason;
        this.remarks = remarks;
    }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
}
