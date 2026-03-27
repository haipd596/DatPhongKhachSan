import { useEffect, useState } from "react";
import client from "../api/client";
import { useAuth } from "../auth/AuthContext";
import SupportChatbot from "../components/SupportChatbot";

function HomePage() {
  const { user, logout } = useAuth();
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [rooms, setRooms] = useState([]);
  const [summary, setSummary] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [vipInfo, setVipInfo] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loadingId, setLoadingId] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });

  useEffect(() => {
    loadDefaultData();
  }, []);

  const loadDefaultData = async () => {
    const [roomsRes, bookingsRes, vipRes] = await Promise.all([
      client.get("/rooms"),
      client.get("/bookings/my"),
      client.get("/customers/me/vip")
    ]);
    setRooms(roomsRes.data);
    setBookings(bookingsRes.data);
    setVipInfo(vipRes.data);
    const reviewRes = await client.get("/reviews/hotel");
    setReviews(reviewRes.data);
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
      const vipRes = await client.get("/customers/me/vip");
      setVipInfo(vipRes.data);
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
      const vipRes = await client.get("/customers/me/vip");
      setVipInfo(vipRes.data);
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

  const downloadPdf = async (bookingId) => {
    setError("");
    try {
      const res = await client.get(`/bookings/${bookingId}/pdf?purpose=Giay+xac+nhan`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `booking-${bookingId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.response?.data?.message || "Khong tai duoc PDF");
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      await client.post("/reviews", { rating: Number(reviewForm.rating), comment: reviewForm.comment });
      setReviewForm({ rating: 5, comment: "" });
      const reviewRes = await client.get("/reviews/hotel");
      setReviews(reviewRes.data);
      setMessage("Da gui danh gia dich vu");
    } catch (err) {
      setError(err.response?.data?.message || "Khong gui duoc danh gia");
    }
  };

  return (
    <main className="panel">
      <h1>Rex Sai Gon Booking - Customer Portal</h1>
      <p>Xin chao {user.fullName}</p>
      <p>Email: {user.email}</p>
      <p>Vai tro: {user.role}</p>
      <p>Hang VIP: {user.vipLevel}</p>
      {vipInfo && (
        <p>
          So lan dat thanh cong: {vipInfo.bookingCount} - Uu dai hien tai: {Number(vipInfo.discountRate) * 100}%
        </p>
      )}

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
          <button onClick={() => downloadPdf(booking.id)}>Tai PDF</button>
          {(booking.status === "HOLD" || booking.status === "CONFIRMED") && (
            <button onClick={() => cancelBooking(booking.id)} disabled={loadingId === booking.id}>
              Huy
            </button>
          )}
        </div>
      ))}

      <h3>Danh gia chat luong phuc vu</h3>
      <form className="auth-form" onSubmit={submitReview}>
        <select
          value={reviewForm.rating}
          onChange={(e) => setReviewForm({ ...reviewForm, rating: e.target.value })}
        >
          <option value={5}>5 sao</option>
          <option value={4}>4 sao</option>
          <option value={3}>3 sao</option>
          <option value={2}>2 sao</option>
          <option value={1}>1 sao</option>
        </select>
        <input
          value={reviewForm.comment}
          onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
          placeholder="Nhan xet cua ban"
          required
        />
        <button type="submit">Gui danh gia</button>
      </form>
      {reviews.map((review) => (
        <p key={review.id}>
          {review.fullName}: {review.rating} sao - {review.comment}
        </p>
      ))}

      <h3>Ban do khach san</h3>
      <iframe
        title="Rex map"
        width="100%"
        height="240"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        src="https://www.google.com/maps?q=Rex+Hotel+Saigon&output=embed"
      />

      <SupportChatbot />

      <button onClick={logout}>Dang xuat</button>
    </main>
  );
}

export default HomePage;
