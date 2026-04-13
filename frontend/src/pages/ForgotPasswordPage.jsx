import { useState } from "react";
import { Link } from "react-router-dom";
import client from "../api/client";

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setCode("");
    try {
      const res = await client.post("/auth/forgot-password", { email });
      setMessage(res.data.message || "Ðã g?i mã d?t l?i m?t kh?u");
      setCode(res.data.debugResetCode || "");
    } catch (err) {
      setError(err.response?.data?.message || "Không g?i du?c mã reset");
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <h1 className="auth-title">Khôi ph?c m?t kh?u</h1>
        <p className="auth-sub">Nh?p email d? nh?n mã reset (môi tru?ng demo hi?n th? mã tr?c ti?p).</p>

        <form className="auth-form" onSubmit={onSubmit}>
          <label>
            Email tài kho?n
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <button type="submit">G?i mã</button>
        </form>

        {message && <p className="alert alert-success">{message}</p>}
        {code && <p className="alert alert-warn">Mã reset demo: {code}</p>}
        {error && <p className="alert alert-error">{error}</p>}

        <p>
          Ðã có mã? <Link to="/reset-password">Ð?t l?i m?t kh?u</Link>
        </p>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
