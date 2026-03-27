import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import client from "../api/client";

function ManagerPage() {
  const { user, logout } = useAuth();
  const [health, setHealth] = useState("");

  useEffect(() => {
    client
      .get("/manager/health")
      .then((res) => setHealth(res.data.message))
      .catch(() => setHealth("Khong truy cap duoc API manager"));
  }, []);

  return (
    <main className="panel">
      <h1>Manager Dashboard (Milestone 1)</h1>
      <p>Xin chao {user.fullName}</p>
      <p>API status: {health}</p>
      <button onClick={logout}>Dang xuat</button>
    </main>
  );
}

export default ManagerPage;
