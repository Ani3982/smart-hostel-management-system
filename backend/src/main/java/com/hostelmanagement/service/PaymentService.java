package com.hostelmanagement.service;

import com.hostelmanagement.dto.PaymentRequest;
import com.hostelmanagement.dto.PaymentVerifyRequest;
import com.hostelmanagement.entity.*;
import com.hostelmanagement.exception.BadRequestException;
import com.hostelmanagement.exception.ResourceNotFoundException;
import com.hostelmanagement.repository.AllocationRepository;
import com.hostelmanagement.repository.ApplicationRepository;
import com.hostelmanagement.repository.PaymentRepository;
import com.hostelmanagement.repository.StudentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final StudentRepository studentRepository;
    private final ApplicationRepository applicationRepository;
    private final AllocationRepository allocationRepository;
    private final NotificationService notificationService;

    public PaymentService(PaymentRepository paymentRepository,
                          StudentRepository studentRepository,
                          ApplicationRepository applicationRepository,
                          AllocationRepository allocationRepository,
                          NotificationService notificationService) {
        this.paymentRepository = paymentRepository;
        this.studentRepository = studentRepository;
        this.applicationRepository = applicationRepository;
        this.allocationRepository = allocationRepository;
        this.notificationService = notificationService;
    }

    public List<Payment> getAllPayments() {
        return paymentRepository.findAll();
    }

    public List<Payment> getPaymentsByStudent(Long studentId) {
        return paymentRepository.findByStudentId(studentId);
    }

    public List<Payment> getPaymentsByHostel(Long hostelId) {
        return paymentRepository.findByHostelId(hostelId);
    }

    public Payment getPaymentByReceipt(String receiptNumber) {
        return paymentRepository.findByReceiptNumber(receiptNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Payment receipt not found: " + receiptNumber));
    }

    @Transactional
    public Payment initiatePayment(PaymentRequest req) {
        Student student = studentRepository.findById(req.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + req.getStudentId()));

        Application app = applicationRepository.findById(req.getApplicationId())
                .orElseThrow(() -> new ResourceNotFoundException("Application not found with id: " + req.getApplicationId()));

        if (app.getStatus() != Application.ApplicationStatus.APPROVED) {
            throw new BadRequestException("Application must be approved before payment can be made.");
        }

        // Check if allocation is done
        Allocation allocation = allocationRepository.findByStudentIdAndStatus(student.getId(), Allocation.Status.ACTIVE)
                .orElseThrow(() -> new BadRequestException("Room and Bed must be allocated by the Hostel Warden before fee payment."));

        // Check if already paid
        var existing = paymentRepository.findByApplicationId(app.getId());
        if (existing.isPresent() && existing.get().getStatus() == Payment.PaymentStatus.SUCCESS) {
            throw new BadRequestException("Payment has already been completed for this application.");
        }

        String txnId = "TXN-" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        String recNo = "REC-" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd")) + "-" + (int)(Math.random() * 90000 + 10000);

        Payment payment = new Payment(
                student,
                app,
                req.getAmount(),
                Payment.PaymentMethod.valueOf(req.getPaymentMethod().toUpperCase()),
                txnId,
                Payment.PaymentStatus.PENDING,
                recNo
        );

        return paymentRepository.save(payment);
    }

    @Transactional
    public Payment verifyPayment(PaymentVerifyRequest req) {
        Payment payment = paymentRepository.findById(req.getPaymentId())
                .orElseThrow(() -> new ResourceNotFoundException("Payment record not found: " + req.getPaymentId()));

        if (req.isSimulateSuccess()) {
            payment.setStatus(Payment.PaymentStatus.SUCCESS);
            payment.setTransactionId(req.getTransactionId());
            Payment saved = paymentRepository.save(payment);

            // Notify student
            notificationService.createNotification(
                    payment.getStudent().getUser().getId(),
                    "Payment Successful!",
                    "Hostel admission fee of ₹" + payment.getAmount() + " paid successfully. Receipt No: " + payment.getReceiptNumber(),
                    "SUCCESS"
            );

            return saved;
        } else {
            payment.setStatus(Payment.PaymentStatus.FAILED);
            Payment saved = paymentRepository.save(payment);

            notificationService.createNotification(
                    payment.getStudent().getUser().getId(),
                    "Payment Failed",
                    "Your transaction " + req.getTransactionId() + " was unsuccessful. Please try again.",
                    "ERROR"
            );

            return saved;
        }
    }
}
