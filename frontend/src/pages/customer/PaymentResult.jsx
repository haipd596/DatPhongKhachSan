import { useSearchParams, Link } from "react-router-dom";

export default function PaymentResult() {
  const [searchParams] = useSearchParams();
  return (
    <div className="auth-shell">
      <div className="auth-card center-text glass-card">
        <h2>Kết Quả Giao Dịch</h2>
        <p>{searchParams.get("vnp_ResponseCode") === "00" ? "✅ Giao dịch thành công" : "❌ Giao dịch thất bại"}</p>
        <div style={{ marginTop: 20 }}>
          <Link to="/customer/bookings" className="btn">Về Lịch Sử Đặt Phòng</Link>
        </div>
      </div>
    </div>
  );
}
