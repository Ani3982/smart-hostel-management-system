package com.hostelmanagement.controller;

import com.hostelmanagement.dto.ApiResponse;
import com.hostelmanagement.dto.PaymentRequest;
import com.hostelmanagement.dto.PaymentVerifyRequest;
import com.hostelmanagement.entity.Payment;
import com.hostelmanagement.entity.Student;
import com.hostelmanagement.security.UserPrincipal;
import com.hostelmanagement.service.PaymentService;
import com.hostelmanagement.service.StudentService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;
    private final StudentService studentService;

    public PaymentController(PaymentService paymentService, StudentService studentService) {
        this.paymentService = paymentService;
        this.studentService = studentService;
    }

    @PostMapping("/create")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<Payment>> initiatePayment(@Valid @RequestBody PaymentRequest request) {
        Payment payment = paymentService.initiatePayment(request);
        return ResponseEntity.ok(ApiResponse.success("Payment initiated successfully", payment));
    }

    @PostMapping("/verify")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<Payment>> verifyPayment(@Valid @RequestBody PaymentVerifyRequest request) {
        Payment payment = paymentService.verifyPayment(request);
        return ResponseEntity.ok(ApiResponse.success("Payment processed successfully", payment));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<Payment>>> getAllPayments() {
        return ResponseEntity.ok(ApiResponse.success("All payments retrieved", paymentService.getAllPayments()));
    }

    @GetMapping("/hostel/{hostelId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HOSTEL_HEAD')")
    public ResponseEntity<ApiResponse<List<Payment>>> getPaymentsByHostel(@PathVariable Long hostelId) {
        return ResponseEntity.ok(ApiResponse.success("Hostel payments retrieved", paymentService.getPaymentsByHostel(hostelId)));
    }

    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HOSTEL_HEAD', 'STUDENT')")
    public ResponseEntity<ApiResponse<List<Payment>>> getPaymentsByStudent(@PathVariable Long studentId) {
        return ResponseEntity.ok(ApiResponse.success("Student payments retrieved", paymentService.getPaymentsByStudent(studentId)));
    }

    @GetMapping("/my-payments")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<List<Payment>>> getMyPayments(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        Student student = studentService.getStudentByUserId(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success("My payments retrieved", paymentService.getPaymentsByStudent(student.getId())));
    }

    @GetMapping("/receipt/{receiptNumber}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HOSTEL_HEAD', 'STUDENT')")
    public ResponseEntity<ApiResponse<Payment>> getPaymentByReceipt(@PathVariable String receiptNumber) {
        return ResponseEntity.ok(ApiResponse.success("Payment receipt retrieved", paymentService.getPaymentByReceipt(receiptNumber)));
    }
}
