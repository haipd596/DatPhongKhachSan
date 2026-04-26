import { Outlet, Navigate, NavLink, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import SupportChatbot from "../components/SupportChatbot";

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
      <header className="topbar">
        <div className="brand">
          <Link to="/customer/home">
            <h1 className="brand-title">
              RexHotel <span className="vip-badge">{user.vipLevel}</span>
            </h1>
            <p className="brand-sub">Kính chào {user.fullName}</p>
          </Link>
        </div>
        <nav className="topbar-nav">
          <NavLink to="/customer/home" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
            Trang chủ
          </NavLink>
          <NavLink to="/customer/search" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
            Tìm phòng
          </NavLink>
          <NavLink to="/customer/bookings" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
            Đặt phòng của tôi
          </NavLink>
          <NavLink to="/customer/history" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
            Thanh toán
          </NavLink>
          <button className="btn btn-outline" onClick={handleLogout}>Đăng xuất</button>
        </nav>
      </header>

      <main className="page-shell">
        <Outlet />
      </main>
      <SupportChatbot />

      <footer className="footer">
        <p>&copy; 2026 RexHotel. Đồ án tốt nghiệp hệ thống đặt phòng khách sạn.</p>
      </footer>
    </div>
  );
}
