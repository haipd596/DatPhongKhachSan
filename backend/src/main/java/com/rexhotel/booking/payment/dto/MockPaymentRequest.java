package com.rexhotel.booking.payment.dto;

import jakarta.validation.constraints.NotNull;

public record MockPaymentRequest(
    @NotNull Long bookingId
) {
}
