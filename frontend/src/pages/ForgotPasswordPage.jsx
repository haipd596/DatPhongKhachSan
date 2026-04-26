import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import client from "../api/client";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setError("");
    setLoading(true);
    try {
      const res = await client.post("/auth/forgot-password", { email });
      setMsg(res.data.message || "Đã gửi mã xác nhận. Vui lòng kiểm tra email.");
      setTimeout(() => navigate(`/reset-password?email=${email}`), 2000);
    } catch (err) {
      setError(
        err.response?.status === 429
          ? "Bạn thao tác quá nhanh. Vui lòng thử lại sau 1 phút."
          : err.response?.data?.message || "Lỗi hệ thống"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h2 className="auth-title">Quên mật khẩu</h2>
      <p className="auth-sub">Nhập email tài khoản để nhận mã khôi phục mật khẩu.</p>

      {error && <div className="alert alert-error">{error}</div>}
      {msg && <div className="alert alert-success">{msg}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Địa chỉ email</label>
          <input
            type="email"
            className="form-control"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoCapitalize="none"
          />
        </div>

        <button type="submit" className="btn full-width" disabled={loading} style={{ marginTop: 12 }}>
          {loading ? "Đang gửi email..." : "Gửi mã khôi phục"}
        </button>
      </form>

      <div className="center-text" style={{ marginTop: 24 }}>
        <Link to="/login">Quay lại đăng nhập</Link>
      </div>
    </>
  );
}
