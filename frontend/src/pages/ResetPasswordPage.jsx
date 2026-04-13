import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import client from "../api/client";

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ code: "", newPassword: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    try {
      const res = await client.post("/auth/reset-password", form);
      setMessage(res.data.message || "Ð?i m?t kh?u thành công");
      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      setError(err.response?.data?.message || "Không d?i du?c m?t kh?u");
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <h1 className="auth-title">Ð?t l?i m?t kh?u</h1>
        <p className="auth-sub">Nh?p mã reset và m?t kh?u m?i (6-72 ký t?).</p>

        <form className="auth-form" onSubmit={onSubmit}>
          <label>
            Mã reset
            <input
              type="text"
              placeholder="ABC123"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              required
            />
          </label>
          <label>
            M?t kh?u m?i
            <input
              type="password"
              placeholder="Nh?p m?t kh?u m?i"
              value={form.newPassword}
              onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
              required
            />
          </label>
          <button type="submit">C?p nh?t m?t kh?u</button>
        </form>

        {message && <p className="alert alert-success">{message}</p>}
        {error && <p className="alert alert-error">{error}</p>}

        <p>
          <Link to="/login">Quay v? dang nh?p</Link>
        </p>
      </div>
    </div>
  );
}

export default ResetPasswordPage;
