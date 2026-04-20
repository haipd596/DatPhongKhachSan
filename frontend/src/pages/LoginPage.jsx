import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import client from "../api/client";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await client.post("/auth/login", formData);
      login(res.data);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h2 className="auth-title playfair-text">Chào Mừng Trở Lại</h2>
      <p className="auth-sub">
        Đăng nhập để vào thế giới đặc quyền của bạn
      </p>

      {error && <div className="alert alert-error">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
        {error}
      </div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Email / Định danh</label>
          <input
            type="email"
            className="form-control"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            placeholder="contact@rexhotel.com"
          />
        </div>

        <div className="form-group">
          <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Mật khẩu</span>
            <Link to="/forgot-password" style={{ textTransform: 'none', fontWeight: 500, fontSize: '0.8rem' }}>Quên mật khẩu?</Link>
          </label>
          <input
            type="password"
            className="form-control"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
            placeholder="••••••••"
          />
        </div>

        <button type="submit" className="btn full-width" disabled={loading} style={{ marginTop: 20 }}>
          {loading ? "Đang xử lý phân quyền..." : "Đăng Nhập Quản Trị"}
        </button>
      </form>

      <div className="center-text" style={{ marginTop: 32, fontSize: '0.95rem' }}>
        <span className="text-muted">Lần đầu đến với RexHotel? </span>
        <Link to="/register" style={{ fontWeight: 600 }}>Tạo tài khoản VIP</Link>
      </div>
    </>
  );
}
