import { useAuth } from "../../auth/AuthContext";
import HotelPage from "../HotelPage";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="home-page">
      <HotelPage embedded />

      <section className="grid-3 customer-home-stats">
        <div className="stat-card">
          <h3 className="stat-title">Hạng thành viên</h3>
          <p className="stat-value">{user?.vipLevel || "STANDARD"}</p>
          <p className="text-muted" style={{ marginBottom: 0 }}>Tự động áp dụng ưu đãi theo chính sách VIP.</p>
        </div>
        <div className="stat-card">
          <h3 className="stat-title">Tra cứu phòng</h3>
          <p className="stat-value">24/7</p>
          <p className="text-muted" style={{ marginBottom: 0 }}>Kiểm tra phòng theo ngày nhận, ngày trả và số khách.</p>
        </div>
        <div className="stat-card">
          <h3 className="stat-title">Thanh toán</h3>
          <p className="stat-value">VNPay</p>
          <p className="text-muted" style={{ marginBottom: 0 }}>Mô phỏng thanh toán phù hợp phạm vi đồ án tốt nghiệp.</p>
        </div>
      </section>
    </div>
  );
}
