import { Outlet, Navigate, Link } from "react-router-dom";
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
          <div className="auth-hero-branding">
            {/* Crown Logo SVG */}
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M2.25 18a.75.75 0 0 0 0 1.5c5.4 0 10.6 0 19.5 0a.75.75 0 0 0 0-1.5H2.25Zm0-2.25v-8.5a.75.75 0 0 1 1.25-.56l4.28 3.86 3.49-7.31a.75.75 0 0 1 1.35 0l3.49 7.31 4.28-3.86a.75.75 0 0 1 1.25.56v8.5H2.25Z" />
            </svg>
            RexHotel
          </div>
          <div className="auth-hero-content">
            <h1>Nơi Dừng Chân<br/>Của Sự Hoàn Mỹ</h1>
            <p className="auth-subtitle">
              <svg fill="currentColor" viewBox="0 0 20 20" width="20" height="20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
              Trải nghiệm điểm chạm của giới thượng lưu. Chọn Rex, chọn sự tinh tế.
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
