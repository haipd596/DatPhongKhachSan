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
      <h2 className="auth-title">Đăng nhập hệ thống</h2>
      <p className="auth-sub">Truy cập tài khoản khách hàng hoặc tài khoản quản trị RexHotel.</p>

      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Email</label>
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
          <label className="form-label" style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Mật khẩu</span>
            <Link to="/forgot-password" style={{ fontWeight: 700, fontSize: "0.82rem" }}>Quên mật khẩu?</Link>
          </label>
          <input
            type="password"
            className="form-control"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
            placeholder="Nhập mật khẩu"
          />
        </div>

        <button type="submit" className="btn full-width" disabled={loading} style={{ marginTop: 12 }}>
          {loading ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>
      </form>

      <div className="center-text" style={{ marginTop: 26, fontSize: "0.95rem" }}>
        <span className="text-muted">Chưa có tài khoản? </span>
        <Link to="/register" style={{ fontWeight: 700 }}>Đăng ký khách hàng</Link>
      </div>
    </>
  );
}
