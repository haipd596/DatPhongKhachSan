package com.rexhotel.booking.payment;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.TreeMap;
import java.util.UUID;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/**
 * Gia lap dong VNPay don gian phuc vu demo do an.
 * Su dung HMAC-SHA256 de ky va xac thuc tham so.
 */
@Service
public class VnpayMockService {

    private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");

    @Value("${app.vnpay.mock-secret:RexHotelVNPayMockSecretKey2026}")
    private String mockSecret;

    @Value("${app.vnpay.mock-return-url:http://localhost:5173/payment/result}")
    private String returnUrl;

    /**
     * Tao URL thanh toan gia lap.
     * @return map chua paymentUrl va txnRef
     */
    public Map<String, String> createPaymentUrl(Long bookingId, BigDecimal amount, String orderInfo) {
        String txnRef = "REX" + bookingId + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        String createDate = LocalDateTime.now().format(FMT);

        // Tao query string theo thu tu alphabet (giu lai ky tu thuc te VNPay)
        TreeMap<String, String> params = new TreeMap<>();
        params.put("vnp_Version", "2.1.0");
        params.put("vnp_Command", "pay");
        params.put("vnp_TmnCode", "REXHOTEL");
        params.put("vnp_Amount", String.valueOf(amount.multiply(BigDecimal.valueOf(100)).longValue()));
        params.put("vnp_CurrCode", "VND");
        params.put("vnp_TxnRef", txnRef);
        params.put("vnp_OrderInfo", orderInfo);
        params.put("vnp_OrderType", "hotel");
        params.put("vnp_ReturnUrl", returnUrl);
        params.put("vnp_IpAddr", "127.0.0.1");
        params.put("vnp_CreateDate", createDate);
        params.put("vnp_Locale", "vn");

        String hashData = buildQueryString(params);
        String secureHash = hmacSHA256(hashData, mockSecret);
        params.put("vnp_SecureHash", secureHash);

        // URL mock: frontend se tu hieu thi form thanh toan gia lap
        String paymentUrl = "http://localhost:8080/api/payments/vnpay/sandbox?" + buildQueryString(params);

        return Map.of(
            "paymentUrl", paymentUrl,
            "txnRef", txnRef,
            "amount", amount.toString()
        );
    }

    /**
     * Xac thuc callback tu VNPay (mock).
     * @return true neu chu ky hop le va giao dich thanh cong
     */
    public boolean verifyCallback(Map<String, String> params) {
        String receivedHash = params.get("vnp_SecureHash");
        if (receivedHash == null) return false;

        TreeMap<String, String> toVerify = new TreeMap<>(params);
        toVerify.remove("vnp_SecureHash");

        String hashData = buildQueryString(toVerify);
        String expectedHash = hmacSHA256(hashData, mockSecret);
        boolean hashValid = expectedHash.equalsIgnoreCase(receivedHash);

        String responseCode = params.getOrDefault("vnp_ResponseCode", "99");
        return hashValid && "00".equals(responseCode);
    }

    public String extractTxnRef(Map<String, String> params) {
        return params.get("vnp_TxnRef");
    }

    private String buildQueryString(Map<String, String> params) {
        StringBuilder sb = new StringBuilder();
        params.forEach((k, v) -> {
            if (sb.length() > 0) sb.append('&');
            sb.append(k).append('=').append(v);
        });
        return sb.toString();
    }

    private String hmacSHA256(String data, String secret) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder hex = new StringBuilder();
            for (byte b : hash) hex.append(String.format("%02x", b));
            return hex.toString();
        } catch (Exception e) {
            throw new RuntimeException("HMAC-SHA256 error", e);
        }
    }
}
