import { useSearchParams, Link } from "react-router-dom";

export default function PaymentResult() {
  const [searchParams] = useSearchParams();
  const success = searchParams.get("vnp_ResponseCode") === "00";

  return (
    <div className="payment-result-shell">
      <div className="payment-result-card card">
        <span className={`badge ${success ? "badge-CONFIRMED" : "badge-CANCELLED"}`}>
          {success ? "Thành công" : "Thất bại"}
        </span>
        <h2 style={{ marginTop: 16 }}>Kết quả giao dịch</h2>
        <p className="text-muted">
          {success
            ? "Thanh toán đã được ghi nhận. Bạn có thể quay lại danh sách đặt phòng để kiểm tra trạng thái."
            : "Giao dịch chưa hoàn tất. Vui lòng kiểm tra lại thông tin hoặc thanh toán lại từ đơn đặt phòng."}
        </p>
        <Link to="/customer/bookings" className="btn" style={{ marginTop: 14 }}>
          Về danh sách đặt phòng
        </Link>
      </div>
    </div>
  );
}
