package com.hostelmanagement.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public class RegisterRequest {

    // Personal Info
    @NotBlank(message = "Full name is required")
    private String fullName;

    @NotNull(message = "Date of birth is required")
    private LocalDate dob;

    @NotBlank(message = "Gender is required (MALE or FEMALE)")
    private String gender;

    @NotBlank(message = "Mobile number is required")
    @Pattern(regexp = "^[0-9]{10}$", message = "Mobile number must be exactly 10 digits")
    private String mobile;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Address is required")
    private String address;

    @NotBlank(message = "City is required")
    private String city;

    @NotBlank(message = "State is required")
    private String state;

    @NotBlank(message = "PIN code is required")
    @Pattern(regexp = "^[0-9]{6}$", message = "PIN code must be exactly 6 digits")
    private String pincode;

    // Academic Info
    private String collegeName = "Ahilyanagar Jilha Maratha Vidya Prasarak Samaj's New Arts, Commerce & Science College, Ahilyanagar (Autonomous)";

    @NotBlank(message = "Course is required")
    private String course;

    @NotBlank(message = "Department is required")
    private String department;

    @NotBlank(message = "Academic year is required")
    private String academicYear;

    @NotBlank(message = "Roll number is required")
    private String rollNumber;

    @NotBlank(message = "Student ID / PRN is required")
    private String studentId;

    // Parent / Guardian Info
    @NotBlank(message = "Parent name is required")
    private String parentName;

    @NotBlank(message = "Parent mobile is required")
    @Pattern(regexp = "^[0-9]{10}$", message = "Parent mobile number must be exactly 10 digits")
    private String parentMobile;

    @NotBlank(message = "Emergency contact is required")
    @Pattern(regexp = "^[0-9]{10}$", message = "Emergency contact must be exactly 10 digits")
    private String emergencyContact;

    // Hostel Preference
    @NotBlank(message = "Hostel type is required (BOYS or GIRLS)")
    private String hostelType;

    private String preferredRoomType = "Standard 4-Sharing";

    // Password
    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    @NotBlank(message = "Confirm password is required")
    private String confirmPassword;

    public RegisterRequest() {}

    // Getters and Setters
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public LocalDate getDob() { return dob; }
    public void setDob(LocalDate dob) { this.dob = dob; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public String getMobile() { return mobile; }
    public void setMobile(String mobile) { this.mobile = mobile; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public String getPincode() { return pincode; }
    public void setPincode(String pincode) { this.pincode = pincode; }

    public String getCollegeName() { return collegeName; }
    public void setCollegeName(String collegeName) { this.collegeName = collegeName; }

    public String getCourse() { return course; }
    public void setCourse(String course) { this.course = course; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public String getAcademicYear() { return academicYear; }
    public void setAcademicYear(String academicYear) { this.academicYear = academicYear; }

    public String getRollNumber() { return rollNumber; }
    public void setRollNumber(String rollNumber) { this.rollNumber = rollNumber; }

    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }

    public String getParentName() { return parentName; }
    public void setParentName(String parentName) { this.parentName = parentName; }

    public String getParentMobile() { return parentMobile; }
    public void setParentMobile(String parentMobile) { this.parentMobile = parentMobile; }

    public String getEmergencyContact() { return emergencyContact; }
    public void setEmergencyContact(String emergencyContact) { this.emergencyContact = emergencyContact; }

    public String getHostelType() { return hostelType; }
    public void setHostelType(String hostelType) { this.hostelType = hostelType; }

    public String getPreferredRoomType() { return preferredRoomType; }
    public void setPreferredRoomType(String preferredRoomType) { this.preferredRoomType = preferredRoomType; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getConfirmPassword() { return confirmPassword; }
    public void setConfirmPassword(String confirmPassword) { this.confirmPassword = confirmPassword; }
}
