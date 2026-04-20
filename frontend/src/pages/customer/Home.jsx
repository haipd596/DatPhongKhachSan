import { Link } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="home-page">
      <div className="home-hero glass-card" style={{ padding: 40, textAlign: 'center', marginBottom: 40 }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: 16, color: 'var(--primary-dark)' }}>
          Kỳ Nghỉ Hoàn Hảo Bắt Đầu Từ Đây
        </h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', marginBottom: 32, maxWidth: 600, margin: '0 auto 32px' }}>
          Trải nghiệm hệ thống đặt phòng thông minh, sang trọng và tiện lợi cùng RexHotel.
        </p>
        <Link to="/customer/search" className="btn" style={{ fontSize: '1.1rem', padding: '16px 32px' }}>
          Tìm Phòng Ngay
        </Link>
      </div>

      <div className="grid-3">
        <div className="stat-card">
          <h3 className="stat-title">Thành viên VIP</h3>
          <p className="stat-value" style={{ color: 'var(--accent)' }}>{user?.vipLevel}</p>
          <p className="text-muted" style={{ marginTop: 8 }}>Tận hưởng ưu đãi độc quyền.</p>
        </div>
        <div className="stat-card" style={{ borderLeftColor: 'var(--info)' }}>
          <h3 className="stat-title">Phòng Trống</h3>
          <p className="stat-value" style={{ color: 'var(--info)' }}>24/7</p>
          <p className="text-muted" style={{ marginTop: 8 }}>Hỗ trợ suốt kỳ nghỉ của bạn.</p>
        </div>
        <div className="stat-card" style={{ borderLeftColor: 'var(--success)' }}>
          <h3 className="stat-title">Thanh Toán</h3>
          <p className="stat-value" style={{ color: 'var(--success)' }}>VNPay</p>
          <p className="text-muted" style={{ marginTop: 8 }}>Nhanh chóng và an toàn tuyệt đối.</p>
        </div>
      </div>
    </div>
  );
}
