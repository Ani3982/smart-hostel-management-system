package com.hostelmanagement.repository;

import com.hostelmanagement.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByStudentId(Long studentId);
    Optional<Payment> findByReceiptNumber(String receiptNumber);
    Optional<Payment> findByTransactionId(String transactionId);
    Optional<Payment> findByApplicationId(Long applicationId);

    @Query("SELECT p FROM Payment p WHERE p.application.hostel.id = :hostelId")
    List<Payment> findByHostelId(@Param("hostelId") Long hostelId);

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.status = 'SUCCESS'")
    BigDecimal sumTotalSuccessfulPayments();

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.application.hostel.id = :hostelId AND p.status = 'SUCCESS'")
    BigDecimal sumSuccessfulPaymentsByHostelId(@Param("hostelId") Long hostelId);

    long countByStatus(Payment.PaymentStatus status);

    @Query("SELECT COUNT(p) FROM Payment p WHERE p.application.hostel.id = :hostelId AND p.status = :status")
    long countByHostelIdAndStatus(@Param("hostelId") Long hostelId, @Param("status") Payment.PaymentStatus status);
}
