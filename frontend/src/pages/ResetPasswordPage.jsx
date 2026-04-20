import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import client from "../api/client";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [formData, setFormData] = useState({ 
    code: "", 
    newPassword: "" 
  });
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg(""); setError("");
    setLoading(true);
    try {
      await client.post("/auth/reset-password", {
        code: formData.code.trim(),
        newPassword: formData.newPassword
      });
      setMsg("Đổi mật khẩu thành công! Chuyển hướng...");
      setTimeout(() => navigate(`/login`), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi hệ thống");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h2 className="page-title center-text">Đặt Lại Mật Khẩu</h2>
      <p className="text-muted center-text" style={{ marginBottom: 24 }}>
        Nhập mã xác nhận (6 số) đã được gửi đến hộp thư: <strong>{searchParams.get("email") || "của bạn"}</strong>
      </p>

      {error && <div className="alert alert-error">{error}</div>}
      {msg && <div className="alert alert-success">{msg}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Mã xác nhận OTP</label>
          <input
            type="text"
            className="form-control"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            required
            maxLength={6}
            placeholder="Ví dụ: 123456"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Mật khẩu mới</label>
          <input
            type="password"
            className="form-control"
            value={formData.newPassword}
            onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
            required
            minLength={6}
            placeholder="••••••••"
          />
        </div>
        
        <button type="submit" className="btn full-width" disabled={loading} style={{ marginTop: 16 }}>
          {loading ? "Đang xử lý..." : "Cập nhật mật khẩu"}
        </button>
      </form>

      <div className="center-text" style={{ marginTop: 24 }}>
        <Link to="/login">← Về trang Đăng nhập</Link>
      </div>
    </>
  );
}
