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
      if (res.data.role === "MANAGER") {
        navigate("/manager");
      } else {
        navigate("/");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Dang nhap that bai");
    }
  };

  return (
    <div className="auth-container">
      <h1>Dang nhap</h1>
      <form onSubmit={onSubmit} className="auth-form">
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
        <button type="submit">Dang nhap</button>
      </form>
      <p>
        Chua co tai khoan? <Link to="/register">Dang ky</Link>
      </p>
      <p>
        Quen mat khau? <Link to="/forgot-password">Khoi phuc</Link>
      </p>
    </div>
  );
}

export default LoginPage;
