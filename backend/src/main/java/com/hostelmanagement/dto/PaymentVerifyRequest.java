package com.hostelmanagement.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class PaymentVerifyRequest {
    @NotNull(message = "Payment ID is required")
    private Long paymentId;

    @NotBlank(message = "Transaction ID is required")
    private String transactionId;

    private boolean simulateSuccess = true;

    public PaymentVerifyRequest() {}

    public Long getPaymentId() { return paymentId; }
    public void setPaymentId(Long paymentId) { this.paymentId = paymentId; }

    public String getTransactionId() { return transactionId; }
    public void setTransactionId(String transactionId) { this.transactionId = transactionId; }

    public boolean isSimulateSuccess() { return simulateSuccess; }
    public void setSimulateSuccess(boolean simulateSuccess) { this.simulateSuccess = simulateSuccess; }
}
