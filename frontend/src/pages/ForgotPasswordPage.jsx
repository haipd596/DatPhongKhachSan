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
    setMsg(""); setError("");
    setLoading(true);
    try {
      const res = await client.post("/auth/forgot-password", { email });
      setMsg(res.data.message || "Đã gửi mã xác nhận. Vui lòng kiểm tra email.");
      setTimeout(() => navigate(`/reset-password?email=${email}`), 2000);
    } catch (err) {
      if (err.response?.status === 429) {
        setError("Bạn thao tác quá nhanh. Vui lòng thử lại sau 1 phút.");
      } else {
        setError(err.response?.data?.message || "Lỗi hệ thống");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h2 className="page-title center-text">Quên Mật Khẩu</h2>
      <p className="text-muted center-text" style={{ marginBottom: 24 }}>
        Nhập email tài khoản để nhận mã khôi phục
      </p>

      {error && <div className="alert alert-error">{error}</div>}
      {msg && <div className="alert alert-success">{msg}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Địa chỉ Email</label>
          <input
            type="email"
            className="form-control"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoCapitalize="none"
          />
        </div>
        
        <button type="submit" className="btn full-width" disabled={loading} style={{ marginTop: 16 }}>
          {loading ? "Đang gửi email..." : "Gửi mã Reset Password"}
        </button>
      </form>

      <div className="center-text" style={{ marginTop: 24 }}>
        <Link to="/login">← Quay lại Đăng nhập</Link>
      </div>
    </>
  );
}
