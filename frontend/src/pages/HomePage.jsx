import { useEffect, useState } from "react";
import client from "../api/client";
import { useAuth } from "../auth/AuthContext";

function HomePage() {
  const { user, logout } = useAuth();
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [rooms, setRooms] = useState([]);
  const [summary, setSummary] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    client.get("/rooms").then((res) => setRooms(res.data));
  }, []);

  const searchAvailable = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const [roomRes, summaryRes] = await Promise.all([
        client.get(`/rooms?checkIn=${checkIn}&checkOut=${checkOut}`),
        client.get(`/rooms/available-summary?checkIn=${checkIn}&checkOut=${checkOut}`)
      ]);
      setRooms(roomRes.data);
      setSummary(summaryRes.data);
    } catch (err) {
      setError(err.response?.data?.message || "Khong tim duoc phong trong");
    }
  };

  return (
    <main className="panel">
      <h1>Rex Sai Gon Booking - Customer Portal</h1>
      <p>Xin chao {user.fullName}</p>
      <p>Email: {user.email}</p>
      <p>Vai tro: {user.role}</p>
      <p>Hang VIP: {user.vipLevel}</p>
      <form className="auth-form" onSubmit={searchAvailable}>
        <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} required />
        <input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} required />
        <button type="submit">Tim phong trong</button>
      </form>
      {error && <p className="error">{error}</p>}
      {!!summary.length && (
        <div>
          <h3>Tong quan theo loai phong</h3>
          {summary.map((s) => (
            <p key={s.roomTypeId}>
              {s.roomTypeName}: con {s.availableRooms}/{s.totalRooms} phong
            </p>
          ))}
        </div>
      )}
      <h3>Danh sach phong kha dung</h3>
      {rooms.map((room) => (
        <p key={room.id}>
          {room.code} - {room.roomTypeName} - {Number(room.basePrice).toLocaleString("vi-VN")} VND/dem
        </p>
      ))}
      <button onClick={logout}>Dang xuat</button>
    </main>
  );
}

export default HomePage;
