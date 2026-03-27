package com.rexhotel.booking.payment;

import java.security.Principal;

import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.rexhotel.booking.booking.dto.BookingResponse;
import com.rexhotel.booking.payment.dto.MockPaymentRequest;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/mock-success")
    public ResponseEntity<BookingResponse> mockSuccess(@Validated @RequestBody MockPaymentRequest request, Principal principal) {
        return ResponseEntity.ok(paymentService.mockSuccess(request.bookingId(), principal.getName()));
    }
}
