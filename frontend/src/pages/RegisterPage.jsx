import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import client from "../api/client";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({ email: "", fullName: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await client.post("/auth/register", formData);
      login(res.data);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Đăng ký thất bại, email có thể đã tồn tại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h2 className="auth-title playfair-text">Đặc Quyền Hội Viên</h2>
      <p className="auth-sub">
        Thiết lập định danh để trải nghiệm dịch vụ đẳng cấp từ RexHotel
      </p>

      {error && <div className="alert alert-error">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
        {error}
      </div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Họ và tên</label>
          <input
            type="text"
            className="form-control"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            required
            placeholder="Tony Stark"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Email / Định danh điện tử</label>
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
          <label className="form-label">Khóa bảo mật</label>
          <input
            type="password"
            className="form-control"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
            placeholder="Tối thiểu 6 ký tự"
            minLength={6}
          />
        </div>

        <button type="submit" className="btn full-width" disabled={loading} style={{ marginTop: 20 }}>
          {loading ? "Đang khởi tạo đặc quyền..." : "Mở Khóa Đặc Quyền"}
        </button>
      </form>

      <div className="center-text" style={{ marginTop: 32, fontSize: '0.95rem' }}>
        <span className="text-muted">Đã sở hữu định danh? </span>
        <Link to="/login" style={{ fontWeight: 600 }}>Cổng đăng nhập</Link>
      </div>
    </>
  );
}
