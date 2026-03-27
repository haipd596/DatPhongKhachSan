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
      setMessage(res.data.message);
      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      setError(err.response?.data?.message || "Khong doi duoc mat khau");
    }
  };

  return (
    <div className="auth-container">
      <h1>Doi mat khau</h1>
      <form className="auth-form" onSubmit={onSubmit}>
        <input
          type="text"
          placeholder="Ma reset"
          value={form.code}
          onChange={(e) => setForm({ ...form, code: e.target.value })}
          required
        />
        <input
          type="password"
          placeholder="Mat khau moi"
          value={form.newPassword}
          onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
          required
        />
        <button type="submit">Cap nhat</button>
      </form>
      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}
      <p>
        <Link to="/login">Ve dang nhap</Link>
      </p>
    </div>
  );
}

export default ResetPasswordPage;
