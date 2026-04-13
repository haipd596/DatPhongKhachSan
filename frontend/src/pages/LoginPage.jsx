import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import client from "../api/client";
import { useAuth } from "../auth/AuthContext";

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await client.post("/auth/login", form);
      login(res.data);
      navigate(res.data.role === "MANAGER" ? "/manager" : "/customer");
    } catch (err) {
      setError(err.response?.data?.message || "Ðang nh?p th?t b?i");
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <h1 className="auth-title">Ðang nh?p h? th?ng</h1>
        <p className="auth-sub">N?n t?ng d?t phòng khách s?n Rex Sài Gòn - phiên b?n d? án t?t nghi?p.</p>

        <form onSubmit={onSubmit} className="auth-form">
          <label>
            Email
            <input
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </label>
          <label>
            M?t kh?u
            <input
              type="password"
              placeholder="Nh?p m?t kh?u"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </label>

          {error && <p className="alert alert-error">{error}</p>}
          <button type="submit">Ðang nh?p</button>
        </form>

        <p>
          Chua có tài kho?n? <Link to="/register">Ðang ký ngay</Link>
        </p>
        <p>
          Quên m?t kh?u? <Link to="/forgot-password">L?y mã khôi ph?c</Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
