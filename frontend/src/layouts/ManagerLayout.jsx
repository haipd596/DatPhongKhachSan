import { Outlet, Navigate, Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function ManagerLayout() {
  const { user, loading, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (loading) return null;
  if (!user || user.role !== "MANAGER") {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const currentPath = location.pathname;

  return (
    <div className="manager-layout">
      <aside className="manager-sidebar">
        <div className="sidebar-brand">
          <h2>RexHotel Admin</h2>
          <p>Xin chào, {user.fullName}</p>
        </div>
        <nav className="sidebar-nav">
          <Link to="/manager/dashboard" className={`side-link ${currentPath.includes("/dashboard") ? "active" : ""}`}>
            Tổng quan
          </Link>
          <Link to="/manager/rooms" className={`side-link ${currentPath.includes("/rooms") ? "active" : ""}`}>
            Quản lý phòng
          </Link>
          <Link to="/manager/bookings" className={`side-link ${currentPath.includes("/bookings") ? "active" : ""}`}>
            Quản lý đặt phòng
          </Link>
          <Link to="/manager/customers" className={`side-link ${currentPath.includes("/customers") ? "active" : ""}`}>
            Khách hàng
          </Link>
        </nav>
        <div className="sidebar-footer">
          <button className="btn btn-outline full-width" onClick={handleLogout}>Đăng xuất</button>
        </div>
      </aside>

      <div className="manager-content">
        <header className="manager-topbar">
          <h3 className="page-title" style={{ marginBottom: 0 }}>Không gian quản trị</h3>
        </header>
        <main className="manager-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
