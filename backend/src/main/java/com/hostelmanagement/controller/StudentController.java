package com.hostelmanagement.controller;

import com.hostelmanagement.dto.ApiResponse;
import com.hostelmanagement.entity.Student;
import com.hostelmanagement.service.StudentService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/students")
public class StudentController {

    private final StudentService studentService;

    public StudentController(StudentService studentService) {
        this.studentService = studentService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HOSTEL_HEAD')")
    public ResponseEntity<ApiResponse<List<Student>>> getAllStudents(@RequestParam(required = false) String search) {
        List<Student> students = studentService.searchStudents(search);
        return ResponseEntity.ok(ApiResponse.success("Students retrieved", students));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HOSTEL_HEAD', 'STUDENT')")
    public ResponseEntity<ApiResponse<Student>> getStudentById(@PathVariable Long id) {
        Student student = studentService.getStudentById(id);
        return ResponseEntity.ok(ApiResponse.success("Student retrieved", student));
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HOSTEL_HEAD', 'STUDENT')")
    public ResponseEntity<ApiResponse<Student>> getStudentByUserId(@PathVariable Long userId) {
        Student student = studentService.getStudentByUserId(userId);
        return ResponseEntity.ok(ApiResponse.success("Student retrieved", student));
    }

    @GetMapping("/hostel/{hostelId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HOSTEL_HEAD')")
    public ResponseEntity<ApiResponse<List<Student>>> getStudentsByHostel(@PathVariable Long hostelId) {
        List<Student> students = studentService.getStudentsByHostel(hostelId);
        return ResponseEntity.ok(ApiResponse.success("Hostel students retrieved", students));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STUDENT')")
    public ResponseEntity<ApiResponse<Student>> updateStudent(@PathVariable Long id, @RequestBody Student student) {
        Student updated = studentService.updateStudent(id, student);
        return ResponseEntity.ok(ApiResponse.success("Student profile updated", updated));
    }
}
