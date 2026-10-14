package com.hostelmanagement.dto;

import java.math.BigDecimal;

public class HostelStatsDTO {
    private Long hostelId;
    private String hostelName;
    private String hostelType;
    private long totalRooms;
    private long totalBeds;
    private long occupiedBeds;
    private long availableBeds;
    private long maintenanceBeds;
    private long totalStudents;
    private long totalApplications;
    private long pendingApplications;
    private long approvedApplications;
    private long rejectedApplications;
    private BigDecimal totalPaymentsAmount;
    private long successfulPaymentsCount;
    private long pendingPaymentsCount;

    public HostelStatsDTO() {}

    public Long getHostelId() { return hostelId; }
    public void setHostelId(Long hostelId) { this.hostelId = hostelId; }

    public String getHostelName() { return hostelName; }
    public void setHostelName(String hostelName) { this.hostelName = hostelName; }

    public String getHostelType() { return hostelType; }
    public void setHostelType(String hostelType) { this.hostelType = hostelType; }

    public long getTotalRooms() { return totalRooms; }
    public void setTotalRooms(long totalRooms) { this.totalRooms = totalRooms; }

    public long getTotalBeds() { return totalBeds; }
    public void setTotalBeds(long totalBeds) { this.totalBeds = totalBeds; }

    public long getOccupiedBeds() { return occupiedBeds; }
    public void setOccupiedBeds(long occupiedBeds) { this.occupiedBeds = occupiedBeds; }

    public long getAvailableBeds() { return availableBeds; }
    public void setAvailableBeds(long availableBeds) { this.availableBeds = availableBeds; }

    public long getMaintenanceBeds() { return maintenanceBeds; }
    public void setMaintenanceBeds(long maintenanceBeds) { this.maintenanceBeds = maintenanceBeds; }

    public long getTotalStudents() { return totalStudents; }
    public void setTotalStudents(long totalStudents) { this.totalStudents = totalStudents; }

    public long getTotalApplications() { return totalApplications; }
    public void setTotalApplications(long totalApplications) { this.totalApplications = totalApplications; }

    public long getPendingApplications() { return pendingApplications; }
    public void setPendingApplications(long pendingApplications) { this.pendingApplications = pendingApplications; }

    public long getApprovedApplications() { return approvedApplications; }
    public void setApprovedApplications(long approvedApplications) { this.approvedApplications = approvedApplications; }

    public long getRejectedApplications() { return rejectedApplications; }
    public void setRejectedApplications(long rejectedApplications) { this.rejectedApplications = rejectedApplications; }

    public BigDecimal getTotalPaymentsAmount() { return totalPaymentsAmount; }
    public void setTotalPaymentsAmount(BigDecimal totalPaymentsAmount) { this.totalPaymentsAmount = totalPaymentsAmount; }

    public long getSuccessfulPaymentsCount() { return successfulPaymentsCount; }
    public void setSuccessfulPaymentsCount(long successfulPaymentsCount) { this.successfulPaymentsCount = successfulPaymentsCount; }

    public long getPendingPaymentsCount() { return pendingPaymentsCount; }
    public void setPendingPaymentsCount(long pendingPaymentsCount) { this.pendingPaymentsCount = pendingPaymentsCount; }
}
