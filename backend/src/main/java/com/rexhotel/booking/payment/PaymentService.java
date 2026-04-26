package com.rexhotel.booking.payment;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.rexhotel.booking.booking.Booking;
import com.rexhotel.booking.booking.BookingStatus;
import com.rexhotel.booking.booking.BookingService;
import com.rexhotel.booking.booking.dto.BookingResponse;
import com.rexhotel.booking.common.ApiException;
import com.rexhotel.booking.payment.dto.PaymentHistoryResponse;

@Service
public class PaymentService {

    private final BookingService bookingService;
    private final PaymentTransactionRepository paymentTransactionRepository;
    private final VnpayMockService vnpayMockService;

    public PaymentService(BookingService bookingService,
                          PaymentTransactionRepository paymentTransactionRepository,
                          VnpayMockService vnpayMockService) {
        this.bookingService = bookingService;
        this.paymentTransactionRepository = paymentTransactionRepository;
        this.vnpayMockService = vnpayMockService;
    }

    // --- Thanh toan mock cu con giu lai de compat ---
    @Transactional
    public BookingResponse mockSuccess(Long bookingId, String email) {
        Booking booking = bookingService.confirmPaymentSuccess(bookingId, email);
        String transactionCode = "MOCK-" + LocalDateTime.now().toString().replace(":", "").replace(".", "");
        PaymentTransaction tx = new PaymentTransaction(booking, booking.getTotalAmount(), PaymentStatus.SUCCESS, transactionCode);
        paymentTransactionRepository.save(tx);
        return bookingService.toResponse(booking);
    }

    // --- FEATURE2: VNPay mock flow ---

    /**
     * Tao URL thanh toan VNPay mock.
     * Booking phai o trang thai HOLD.
     */
    @Transactional
    public Map<String, String> initiateVnpay(Long bookingId, String email) {
        Booking booking = bookingService.getOwnedBooking(bookingId, email);
        if (!booking.getStatus().name().equals("HOLD")) {
            throw new ApiException("Chi co the thanh toan booking o trang thai HOLD");
        }
        String orderInfo = "Dat phong " + booking.getRoom().getCode() + " #" + bookingId;
        Map<String, String> result = vnpayMockService.createPaymentUrl(bookingId, booking.getTotalAmount(), orderInfo);

        // Luu giao dich PENDING
        String txnRef = result.get("txnRef");
        PaymentTransaction tx = new PaymentTransaction(booking, booking.getTotalAmount(), PaymentStatus.PENDING, txnRef);
        paymentTransactionRepository.save(tx);
        return result;
    }

    /**
     * Xu ly callback tu VNPay mock.
     */
    @Transactional
    public BookingResponse processVnpayCallback(Map<String, String> params) {
        String txnRef = vnpayMockService.extractTxnRef(params);
        if (txnRef == null) {
            throw new ApiException("Thieu thong tin giao dich (vnp_TxnRef)");
        }

        PaymentTransaction tx = paymentTransactionRepository.findByTransactionCode(txnRef)
            .orElseThrow(() -> new ApiException("Khong tim thay giao dich: " + txnRef));

        boolean success = vnpayMockService.verifyCallback(params);
        Booking booking = tx.getBooking();

        if (success) {
            String email = booking.getUser().getEmail();
            if (booking.getStatus() == BookingStatus.HOLD) {
                bookingService.confirmPaymentSuccess(booking.getId(), email);
            } else if (booking.getStatus() != BookingStatus.CONFIRMED) {
                throw new ApiException("Trạng thái đặt phòng không hợp lệ để xác nhận thanh toán: " + booking.getStatus());
            }
            tx.setStatus(PaymentStatus.SUCCESS);
        } else {
            tx.setStatus(PaymentStatus.FAILED);
        }
        paymentTransactionRepository.save(tx);
        return bookingService.toResponse(booking);
    }

    // --- FEATURE7: Lich su thanh toan ---
    public List<PaymentHistoryResponse> getHistory(String email) {
        return paymentTransactionRepository.findByBookingUserEmailOrderByCreatedAtDesc(email)
            .stream()
            .map(tx -> new PaymentHistoryResponse(
                tx.getId(),
                tx.getBooking().getId(),
                tx.getBooking().getRoom().getCode(),
                tx.getBooking().getRoom().getRoomType().getName(),
                tx.getAmount(),
                tx.getStatus().name(),
                tx.getTransactionCode(),
                tx.getCreatedAt()
            ))
            .toList();
    }
}
