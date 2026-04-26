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
      <h2 className="auth-title">Tạo tài khoản khách hàng</h2>
      <p className="auth-sub">Đăng ký để tìm phòng, giữ phòng, thanh toán và theo dõi ưu đãi thành viên.</p>

      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Họ và tên</label>
          <input
            type="text"
            className="form-control"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            required
            placeholder="Nguyễn Văn A"
          />
        </div>

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
          <label className="form-label">Mật khẩu</label>
          <input
            type="password"
            className="form-control"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
            minLength={6}
            placeholder="Tối thiểu 6 ký tự"
          />
        </div>

        <button type="submit" className="btn full-width" disabled={loading} style={{ marginTop: 12 }}>
          {loading ? "Đang tạo tài khoản..." : "Đăng ký"}
        </button>
      </form>

      <div className="center-text" style={{ marginTop: 26, fontSize: "0.95rem" }}>
        <span className="text-muted">Đã có tài khoản? </span>
        <Link to="/login" style={{ fontWeight: 700 }}>Đăng nhập</Link>
      </div>
    </>
  );
}
