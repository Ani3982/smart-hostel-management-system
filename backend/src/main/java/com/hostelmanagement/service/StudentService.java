package com.hostelmanagement.service;

import com.hostelmanagement.entity.Student;
import com.hostelmanagement.exception.ResourceNotFoundException;
import com.hostelmanagement.repository.StudentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class StudentService {

    private final StudentRepository studentRepository;

    public StudentService(StudentRepository studentRepository) {
        this.studentRepository = studentRepository;
    }

    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }

    public Student getStudentById(Long id) {
        return studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + id));
    }

    public Student getStudentByUserId(Long userId) {
        return studentRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found for user id: " + userId));
    }

    public List<Student> getStudentsByHostel(Long hostelId) {
        return studentRepository.findAllocatedStudentsByHostelId(hostelId);
    }

    public List<Student> searchStudents(String query) {
        if (query == null || query.trim().isEmpty()) {
            return studentRepository.findAll();
        }
        return studentRepository.searchStudents(query.trim());
    }

    @Transactional
    public Student updateStudent(Long id, Student updated) {
        Student existing = getStudentById(id);
        existing.setFullName(updated.getFullName());
        existing.setMobile(updated.getMobile());
        existing.setAddress(updated.getAddress());
        existing.setCity(updated.getCity());
        existing.setState(updated.getState());
        existing.setPincode(updated.getPincode());
        existing.setParentName(updated.getParentName());
        existing.setParentMobile(updated.getParentMobile());
        existing.setEmergencyContact(updated.getEmergencyContact());
        existing.setCourse(updated.getCourse());
        existing.setDepartment(updated.getDepartment());
        existing.setAcademicYear(updated.getAcademicYear());
        existing.setRollNumber(updated.getRollNumber());
        return studentRepository.save(existing);
    }
}
