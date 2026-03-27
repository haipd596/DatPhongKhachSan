package com.rexhotel.booking.payment;

import java.time.LocalDateTime;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.rexhotel.booking.booking.Booking;
import com.rexhotel.booking.booking.BookingService;
import com.rexhotel.booking.booking.dto.BookingResponse;

@Service
public class PaymentService {

    private final BookingService bookingService;
    private final PaymentTransactionRepository paymentTransactionRepository;

    public PaymentService(BookingService bookingService, PaymentTransactionRepository paymentTransactionRepository) {
        this.bookingService = bookingService;
        this.paymentTransactionRepository = paymentTransactionRepository;
    }

    @Transactional
    public BookingResponse mockSuccess(Long bookingId, String email) {
        Booking booking = bookingService.confirmPaymentSuccess(bookingId, email);
        String transactionCode = "MOCK-" + LocalDateTime.now().toString().replace(":", "").replace(".", "");
        PaymentTransaction tx = new PaymentTransaction(booking, booking.getTotalAmount(), PaymentStatus.SUCCESS, transactionCode);
        paymentTransactionRepository.save(tx);
        return bookingService.toResponse(booking);
    }
}
