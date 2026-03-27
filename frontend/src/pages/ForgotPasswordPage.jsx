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
      setMessage(res.data.message);
      setCode(res.data.debugResetCode || "");
    } catch (err) {
      setError(err.response?.data?.message || "Khong gui duoc ma reset");
    }
  };

  return (
    <div className="auth-container">
      <h1>Quen mat khau</h1>
      <form className="auth-form" onSubmit={onSubmit}>
        <input
          type="email"
          placeholder="Nhap email tai khoan"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit">Gui ma</button>
      </form>
      {message && <p className="success">{message}</p>}
      {code && <p className="hint">Ma reset demo: {code}</p>}
      {error && <p className="error">{error}</p>}
      <p>
        Da co ma? <Link to="/reset-password">Doi mat khau</Link>
      </p>
    </div>
  );
}

export default ForgotPasswordPage;
