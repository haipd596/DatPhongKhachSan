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
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Dang ky that bai");
    }
  };

  return (
    <div className="auth-container">
      <h1>Dang ky tai khoan</h1>
      <form onSubmit={onSubmit} className="auth-form">
        <input
          type="text"
          placeholder="Ho ten"
          value={form.fullName}
          onChange={(e) => setForm({ ...form, fullName: e.target.value })}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <input
          type="password"
          placeholder="Mat khau"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />
        {error && <p className="error">{error}</p>}
        <button type="submit">Dang ky</button>
      </form>
      <p>
        Da co tai khoan? <Link to="/login">Dang nhap</Link>
      </p>
    </div>
  );
}

export default RegisterPage;
