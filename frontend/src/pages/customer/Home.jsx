import { Link } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="home-page">
      <section className="home-hero">
        <div>
          <h1>Kỳ nghỉ hoàn hảo bắt đầu từ một lần đặt phòng rõ ràng</h1>
          <p>
            RexHotel giúp bạn tìm phòng trống, giữ phòng, thanh toán và quản lý
            lịch sử đặt phòng trong một quy trình thống nhất.
          </p>
          <Link to="/customer/search" className="btn" style={{ marginTop: 10 }}>
            Tìm phòng ngay
          </Link>
        </div>
      </section>

      <section className="grid-3">
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
