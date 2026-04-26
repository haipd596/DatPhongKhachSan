import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function AuthLayout() {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (user) {
    return <Navigate to={user.role === "MANAGER" ? "/manager/dashboard" : "/customer/home"} replace />;
  }

  return (
    <div className="auth-shell">
      <div className="auth-split">
        <div className="auth-hero">
          <div className="auth-hero-branding">RexHotel</div>
          <div className="auth-hero-content">
            <h1>Đặt phòng khách sạn nhanh, rõ ràng và chuyên nghiệp</h1>
            <p>
              Hệ thống hỗ trợ khách hàng tìm phòng, giữ phòng, thanh toán và
              theo dõi lịch sử đặt phòng. Khu quản trị giúp nhân viên kiểm soát
              phòng, booking, doanh thu và khách hàng thân thiết.
            </p>
          </div>
        </div>
        <div className="auth-form-container">
          <div className="auth-card">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
