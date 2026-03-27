import { useEffect, useState } from "react";
import client from "../api/client";
import { useAuth } from "../auth/AuthContext";

function HomePage() {
  const { user, logout } = useAuth();
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [rooms, setRooms] = useState([]);
  const [summary, setSummary] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loadingId, setLoadingId] = useState(null);

  useEffect(() => {
    loadDefaultData();
  }, []);

  const loadDefaultData = async () => {
    const [roomsRes, bookingsRes] = await Promise.all([client.get("/rooms"), client.get("/bookings/my")]);
    setRooms(roomsRes.data);
    setBookings(bookingsRes.data);
  };

  const searchAvailable = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
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

  const holdRoom = async (roomId) => {
    setError("");
    setMessage("");
    if (!checkIn || !checkOut) {
      setError("Hay chon ngay check-in/check-out truoc khi giu phong");
      return;
    }
    setLoadingId(roomId);
    try {
      const res = await client.post("/bookings/hold", { roomId, checkInDate: checkIn, checkOutDate: checkOut });
      setMessage(`Da giu phong #${res.data.id} den ${new Date(res.data.holdExpiresAt).toLocaleString("vi-VN")}`);
      const bookingsRes = await client.get("/bookings/my");
      setBookings(bookingsRes.data);
    } catch (err) {
      setError(err.response?.data?.message || "Giu phong that bai");
    } finally {
      setLoadingId(null);
    }
  };

  const payMock = async (bookingId) => {
    setError("");
    setMessage("");
    setLoadingId(bookingId);
    try {
      await client.post("/payments/mock-success", { bookingId });
      setMessage(`Thanh toan mo phong thanh cong cho booking #${bookingId}`);
      const bookingsRes = await client.get("/bookings/my");
      setBookings(bookingsRes.data);
    } catch (err) {
      setError(err.response?.data?.message || "Thanh toan that bai");
    } finally {
      setLoadingId(null);
    }
  };

  const cancelBooking = async (bookingId) => {
    setError("");
    setMessage("");
    setLoadingId(bookingId);
    try {
      await client.post(`/bookings/${bookingId}/cancel`);
      setMessage(`Da huy booking #${bookingId}`);
      const bookingsRes = await client.get("/bookings/my");
      setBookings(bookingsRes.data);
    } catch (err) {
      setError(err.response?.data?.message || "Huy booking that bai");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <main className="panel">
      <h1>Rex Sai Gon Booking - Customer Portal</h1>
      <p>Xin chao {user.fullName}</p>
      <p>Email: {user.email}</p>
      <p>Vai tro: {user.role}</p>
      <p>Hang VIP: {user.vipLevel}</p>

      <h3>Tim phong theo thoi diem</h3>
      <form className="auth-form" onSubmit={searchAvailable}>
        <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} required />
        <input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} required />
        <button type="submit">Tim phong trong</button>
      </form>

      {error && <p className="error">{error}</p>}
      {message && <p className="success">{message}</p>}

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
        <div className="line-item" key={room.id}>
          <p>
            {room.code} - {room.roomTypeName} - {Number(room.basePrice).toLocaleString("vi-VN")} VND/dem
          </p>
          <button onClick={() => holdRoom(room.id)} disabled={loadingId === room.id}>
            {loadingId === room.id ? "Dang giu..." : "Giu phong"}
          </button>
        </div>
      ))}

      <h3>Lich su booking cua toi</h3>
      {bookings.map((booking) => (
        <div className="line-item" key={booking.id}>
          <p>
            #{booking.id} - {booking.roomCode} - {booking.status} - {Number(booking.totalAmount).toLocaleString("vi-VN")} VND
          </p>
          {booking.status === "HOLD" && (
            <button onClick={() => payMock(booking.id)} disabled={loadingId === booking.id}>
              Thanh toan mo phong
            </button>
          )}
          {(booking.status === "HOLD" || booking.status === "CONFIRMED") && (
            <button onClick={() => cancelBooking(booking.id)} disabled={loadingId === booking.id}>
              Huy
            </button>
          )}
        </div>
      ))}

      <button onClick={logout}>Dang xuat</button>
    </main>
  );
}

export default HomePage;
