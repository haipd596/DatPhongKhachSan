package com.rexhotel.booking.payment;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.Principal;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.view.RedirectView;

import com.rexhotel.booking.booking.dto.BookingResponse;
import com.rexhotel.booking.common.ApiException;
import com.rexhotel.booking.payment.dto.MockPaymentRequest;
import com.rexhotel.booking.payment.dto.PaymentHistoryResponse;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;
    private final VnpayMockService vnpayMockService;
    private final String frontendReturnUrl;

    public PaymentController(PaymentService paymentService,
                             VnpayMockService vnpayMockService,
                             @Value("${app.vnpay.mock-return-url:http://localhost:5173/payment/result}") String frontendReturnUrl) {
        this.paymentService = paymentService;
        this.vnpayMockService = vnpayMockService;
        this.frontendReturnUrl = frontendReturnUrl;
    }

    @PostMapping("/mock-success")
    public ResponseEntity<BookingResponse> mockSuccess(@Validated @RequestBody MockPaymentRequest request, Principal principal) {
        return ResponseEntity.ok(paymentService.mockSuccess(request.bookingId(), principal.getName()));
    }

    @PostMapping("/vnpay/create")
    public ResponseEntity<Map<String, String>> createVnpay(@Validated @RequestBody MockPaymentRequest request, Principal principal) {
        return ResponseEntity.ok(paymentService.initiateVnpay(request.bookingId(), principal.getName()));
    }

    @GetMapping("/vnpay/sandbox")
    public RedirectView vnpaySandbox(@RequestParam Map<String, String> params) {
        String signedQuery = vnpayMockService.buildSignedResultQuery(params, "00");
        return new RedirectView("/api/payments/vnpay/callback?" + signedQuery);
    }

    @GetMapping("/vnpay/callback")
    public RedirectView vnpayCallback(@RequestParam Map<String, String> params) {
        String responseCode = params.getOrDefault("vnp_ResponseCode", "99");
        try {
            paymentService.processVnpayCallback(params);
        } catch (ApiException ex) {
            responseCode = "99";
        }

        String txnRef = URLEncoder.encode(params.getOrDefault("vnp_TxnRef", ""), StandardCharsets.UTF_8);
        return new RedirectView(frontendReturnUrl + "?vnp_ResponseCode=" + responseCode + "&vnp_TxnRef=" + txnRef);
    }

    @GetMapping("/history")
    public ResponseEntity<List<PaymentHistoryResponse>> history(Principal principal) {
        return ResponseEntity.ok(paymentService.getHistory(principal.getName()));
    }
}
