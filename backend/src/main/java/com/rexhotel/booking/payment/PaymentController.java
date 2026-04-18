package com.rexhotel.booking.payment;

import java.security.Principal;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.rexhotel.booking.booking.dto.BookingResponse;
import com.rexhotel.booking.payment.dto.MockPaymentRequest;
import com.rexhotel.booking.payment.dto.PaymentHistoryResponse;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    // Giu lai endpoint cu
    @PostMapping("/mock-success")
    public ResponseEntity<BookingResponse> mockSuccess(@Validated @RequestBody MockPaymentRequest request, Principal principal) {
        return ResponseEntity.ok(paymentService.mockSuccess(request.bookingId(), principal.getName()));
    }

    // FEATURE2: VNPay mock flow
    @PostMapping("/vnpay/create")
    public ResponseEntity<Map<String, String>> createVnpay(@RequestBody MockPaymentRequest request, Principal principal) {
        return ResponseEntity.ok(paymentService.initiateVnpay(request.bookingId(), principal.getName()));
    }

    @GetMapping("/vnpay/callback")
    public ResponseEntity<BookingResponse> vnpayCallback(@RequestParam Map<String, String> params) {
        return ResponseEntity.ok(paymentService.processVnpayCallback(params));
    }

    @GetMapping("/vnpay/sandbox")
    public ResponseEntity<Map<String, String>> vnpaySandbox(@RequestParam Map<String, String> params) {
        // Trang sandbox: mo phong VNPay tra ve ket qua thanh cong
        // Frontend se hien thi form "thanh toan" roi redirect ve /vnpay/callback
        params.put("vnp_ResponseCode", "00");
        params.put("vnp_TransactionStatus", "00");
        return ResponseEntity.ok(Map.of(
            "message", "VNPay Sandbox - Thanh toan gia lap",
            "callbackUrl", "/api/payments/vnpay/callback",
            "txnRef", params.getOrDefault("vnp_TxnRef", ""),
            "amount", params.getOrDefault("vnp_Amount", "")
        ));
    }

    // FEATURE7: Lich su thanh toan
    @GetMapping("/history")
    public ResponseEntity<List<PaymentHistoryResponse>> history(Principal principal) {
        return ResponseEntity.ok(paymentService.getHistory(principal.getName()));
    }
}
