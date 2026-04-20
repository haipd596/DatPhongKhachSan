import { Outlet, Navigate, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function MainLayout() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();

  if (loading) return null;
  if (!user || user.role !== "CUSTOMER") {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="main-layout">
      <header className="topbar glass-header">
        <div className="brand">
          <Link to="/customer/home">
            <h1 className="brand-title">RexHotel <span className="vip-badge">{user.vipLevel}</span></h1>
            <p className="brand-sub">Kính chào quý khách {user.fullName}</p>
          </Link>
        </div>
        <nav className="topbar-nav">
          <Link to="/customer/home" className="nav-link">Trang chủ</Link>
          <Link to="/customer/search" className="nav-link">Tìm phòng</Link>
          <Link to="/customer/bookings" className="nav-link">Booking của tôi</Link>
          <Link to="/customer/history" className="nav-link">Lịch sử thanh toán</Link>
          <button className="btn btn-outline" onClick={handleLogout}>Đăng xuất</button>
        </nav>
      </header>
      
      <main className="page-shell">
        <Outlet />
      </main>

      <footer className="footer">
        <p>&copy; 2026 RexHotel. Đồ án tốt nghiệp.</p>
      </footer>
    </div>
  );
}
