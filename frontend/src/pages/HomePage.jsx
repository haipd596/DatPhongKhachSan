import { useAuth } from "../auth/AuthContext";

function HomePage() {
  const { user, logout } = useAuth();

  return (
    <main className="panel">
      <h1>Rex Sai Gon Booking - Customer Portal</h1>
      <p>Xin chao {user.fullName}</p>
      <p>Email: {user.email}</p>
      <p>Vai tro: {user.role}</p>
      <p>Hang VIP: {user.vipLevel}</p>
      <button onClick={logout}>Dang xuat</button>
    </main>
  );
}

export default HomePage;
