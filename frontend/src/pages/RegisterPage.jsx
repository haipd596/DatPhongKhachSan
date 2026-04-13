import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import client from "../api/client";
import { useAuth } from "../auth/AuthContext";

function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "", fullName: "" });
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await client.post("/auth/register", form);
      login(res.data);
      navigate("/customer");
    } catch (err) {
      setError(err.response?.data?.message || "Ðang ký th?t b?i");
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <h1 className="auth-title">Ðang ký tài kho?n khách hàng</h1>
        <p className="auth-sub">T?o tài kho?n d? d?t phòng, theo dõi VIP và t?i phi?u xác nh?n PDF.</p>

        <form onSubmit={onSubmit} className="auth-form">
          <label>
            H? và tên
            <input
              type="text"
              placeholder="Nguy?n Van A"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              required
            />
          </label>
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
              placeholder="T?i thi?u 6 ký t?"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </label>

          {error && <p className="alert alert-error">{error}</p>}
          <button type="submit">Ðang ký</button>
        </form>

        <p>
          Ðã có tài kho?n? <Link to="/login">Ðang nh?p</Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;
