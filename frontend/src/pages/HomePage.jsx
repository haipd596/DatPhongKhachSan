import { useEffect, useMemo, useState } from "react";
import client from "../api/client";
import { useAuth } from "../auth/AuthContext";
import SupportChatbot from "../components/SupportChatbot";

const BOOKING_STATUS_TEXT = {
  HOLD: "Ðang gi?",
  CONFIRMED: "Ðã xác nh?n",
  CANCELLED: "Ðã h?y",
  EXPIRED: "H?t h?n"
};

function formatCurrency(value) {
  return Number(value || 0).toLocaleString("vi-VN") + " VND";
}

function formatDate(value) {
  return value ? new Date(value).toLocaleDateString("vi-VN") : "-";
}

function formatDateTime(value) {
  return value ? new Date(value).toLocaleString("vi-VN") : "-";
}

function holdRemaining(holdExpiresAt) {
  if (!holdExpiresAt) return "-";
  const diffMs = new Date(holdExpiresAt).getTime() - Date.now();
  if (diffMs <= 0) return "Ðã h?t";
  const min = Math.floor(diffMs / 60000);
  const sec = Math.floor((diffMs % 60000) / 1000);
  return `${min}m ${sec}s`;
}

function HomePage() {
  const { user, logout } = useAuth();
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [roomTypes, setRoomTypes] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [summary, setSummary] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [vipInfo, setVipInfo] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loadingKey, setLoadingKey] = useState("");

  useEffect(() => {
    const now = new Date();
    const inDate = new Date(now);
    const outDate = new Date(now);
    inDate.setDate(inDate.getDate() + 1);
    outDate.setDate(outDate.getDate() + 2);
    setCheckIn(inDate.toISOString().slice(0, 10));
    setCheckOut(outDate.toISOString().slice(0, 10));
  }, []);

  useEffect(() => {
    loadDefaultData();
    const timer = setInterval(() => {
      setBookings((prev) => [...prev]);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const confirmedBookings = useMemo(
    () => bookings.filter((item) => item.status === "CONFIRMED").length,
    [bookings]
  );

  const pendingHolds = useMemo(() => bookings.filter((item) => item.status === "HOLD").length, [bookings]);

  const loadDefaultData = async () => {
    try {
      setError("");
      const [typesRes, roomsRes, bookingsRes, vipRes, reviewRes] = await Promise.all([
        client.get("/rooms/types"),
        client.get("/rooms"),
        client.get("/bookings/my"),
        client.get("/customers/me/vip"),
        client.get("/reviews/hotel")
      ]);
      setRoomTypes(typesRes.data);
      setRooms(roomsRes.data);
      setBookings(bookingsRes.data);
      setVipInfo(vipRes.data);
      setReviews(reviewRes.data);
    } catch (err) {
      setError(err.response?.data?.message || "Không t?i du?c d? li?u trang khách hàng");
    }
  };

  const refreshBookingsAndVip = async () => {
    const [bookingsRes, vipRes] = await Promise.all([client.get("/bookings/my"), client.get("/customers/me/vip")]);
    setBookings(bookingsRes.data);
    setVipInfo(vipRes.data);
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
      setMessage(`Ðã c?p nh?t danh sách phòng tr?ng t? ${checkIn} d?n ${checkOut}`);
    } catch (err) {
      setError(err.response?.data?.message || "Không tìm du?c phòng tr?ng");
    }
  };

  const holdRoom = async (roomId) => {
    setError("");
    setMessage("");
    if (!checkIn || !checkOut) {
      setError("Vui lòng ch?n ngày nh?n và ngày tr? phòng tru?c khi gi? phòng.");
      return;
    }

    setLoadingKey(`hold-${roomId}`);
    try {
      const res = await client.post("/bookings/hold", {
        roomId,
        checkInDate: checkIn,
        checkOutDate: checkOut
      });
      setMessage(
        `Gi? phòng thành công cho booking #${res.data.id}. H?n gi? d?n ${formatDateTime(res.data.holdExpiresAt)}.`
      );
      await refreshBookingsAndVip();
    } catch (err) {
      setError(err.response?.data?.message || "Gi? phòng th?t b?i");
    } finally {
      setLoadingKey("");
    }
  };

  const payMock = async (bookingId) => {
    setError("");
    setMessage("");
    setLoadingKey(`pay-${bookingId}`);
    try {
      await client.post("/payments/mock-success", { bookingId });
      setMessage(`Thanh toán mô ph?ng thành công cho booking #${bookingId}.`);
      await refreshBookingsAndVip();
    } catch (err) {
      setError(err.response?.data?.message || "Thanh toán th?t b?i");
    } finally {
      setLoadingKey("");
    }
  };

  const cancelBooking = async (bookingId) => {
    setError("");
    setMessage("");
    setLoadingKey(`cancel-${bookingId}`);
    try {
      await client.post(`/bookings/${bookingId}/cancel`);
      setMessage(`Ðã h?y booking #${bookingId}.`);
      await refreshBookingsAndVip();
    } catch (err) {
      setError(err.response?.data?.message || "H?y booking th?t b?i");
    } finally {
      setLoadingKey("");
    }
  };

  const downloadPdf = async (bookingId) => {
    setError("");
    setLoadingKey(`pdf-${bookingId}`);
    try {
      const res = await client.get(`/bookings/${bookingId}/pdf?purpose=Gi?y+xác+nh?n+d?t+phòng`, {
        responseType: "blob"
      });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `booking-${bookingId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.response?.data?.message || "Không t?i du?c PDF");
    } finally {
      setLoadingKey("");
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      await client.post("/reviews", { rating: Number(reviewForm.rating), comment: reviewForm.comment.trim() });
      setReviewForm({ rating: 5, comment: "" });
      const reviewRes = await client.get("/reviews/hotel");
      setReviews(reviewRes.data);
      setMessage("Ðã g?i dánh giá d?ch v? thành công.");
    } catch (err) {
      setError(err.response?.data?.message || "Không g?i du?c dánh giá");
    }
  };

  return (
    <div className="page-shell">
      <header className="topbar">
        <div>
          <h1 className="brand-title">Rex Hotel Booking - C?ng khách hàng</h1>
          <p className="brand-sub">
            Xin chào {user.fullName} ({user.email}) | Vai trò: {user.role}
          </p>
        </div>
        <div className="topbar-actions">
          <button type="button" className="btn-outline" onClick={loadDefaultData}>
            Làm m?i d? li?u
          </button>
          <button type="button" onClick={logout}>
            Ðang xu?t
          </button>
        </div>
      </header>

      <section className="grid grid-3" style={{ marginTop: 16 }}>
        <article className="kpi">
          <div className="kpi-label">Booking dã xác nh?n</div>
          <div className="kpi-value">{confirmedBookings}</div>
        </article>
        <article className="kpi">
          <div className="kpi-label">Booking dang gi?</div>
          <div className="kpi-value">{pendingHolds}</div>
        </article>
        <article className="kpi">
          <div className="kpi-label">H?ng VIP hi?n t?i</div>
          <div className="kpi-value">{vipInfo?.vipLevel || user.vipLevel || "NORMAL"}</div>
        </article>
      </section>

      {vipInfo && (
        <p className="alert alert-warn">
          Uu dãi VIP: {Number(vipInfo.discountRate) * 100}% | T?ng s? booking thành công: {vipInfo.bookingCount}
        </p>
      )}
      {error && <p className="alert alert-error">{error}</p>}
      {message && <p className="alert alert-success">{message}</p>}

      <section className="grid grid-2" style={{ marginTop: 16 }}>
        <article className="card">
          <h2>Tìm phòng theo th?i gian</h2>
          <p className="card-sub">Lu?ng BE: `/rooms`, `/rooms/available-summary`, `/bookings/hold`</p>

          <form className="grid" onSubmit={searchAvailable}>
            <div className="form-row">
              <label>
                Ngày nh?n phòng
                <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} required />
              </label>
              <label>
                Ngày tr? phòng
                <input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} required />
              </label>
            </div>
            <div className="form-actions">
              <button type="submit">Tìm phòng tr?ng</button>
            </div>
          </form>

          {!!summary.length && (
            <div className="table-wrap" style={{ marginTop: 14 }}>
              <table>
                <thead>
                  <tr>
                    <th>Lo?i phòng</th>
                    <th>T?ng phòng kh? d?ng</th>
                    <th>Ðang b? gi?/d?t</th>
                    <th>Còn tr?ng</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.map((item) => (
                    <tr key={item.roomTypeId}>
                      <td>{item.roomTypeName}</td>
                      <td>{item.totalRooms}</td>
                      <td>{item.reservedRooms}</td>
                      <td>{item.availableRooms}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </article>

        <article className="card">
          <h2>Danh m?c lo?i phòng</h2>
          <p className="card-sub">Lu?ng BE: `/rooms/types`</p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Tên lo?i</th>
                  <th>Giá co b?n/dêm</th>
                  <th>S?c ch?a t?i da</th>
                  <th>Mô t?</th>
                </tr>
              </thead>
              <tbody>
                {roomTypes.map((type) => (
                  <tr key={type.id}>
                    <td>{type.name}</td>
                    <td>{formatCurrency(type.basePrice)}</td>
                    <td>{type.maxGuests} khách</td>
                    <td>{type.description || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </section>

      <section className="card" style={{ marginTop: 16 }}>
        <h2>Danh sách phòng s?n sàng d?t</h2>
        <p className="card-sub">Lu?ng BE: gi? phòng theo t?ng phòng c? th?</p>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Mã phòng</th>
                <th>Lo?i phòng</th>
                <th>T?ng</th>
                <th>Giá/dêm</th>
                <th>S?c ch?a</th>
                <th>Tr?ng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map((room) => (
                <tr key={room.id}>
                  <td>{room.code}</td>
                  <td>{room.roomTypeName}</td>
                  <td>{room.floorNumber}</td>
                  <td>{formatCurrency(room.basePrice)}</td>
                  <td>{room.maxGuests} khách</td>
                  <td>
                    <span className={`badge badge-${room.status}`}>{room.status}</span>
                  </td>
                  <td>
                    <button
                      type="button"
                      onClick={() => holdRoom(room.id)}
                      disabled={loadingKey === `hold-${room.id}`}
                    >
                      {loadingKey === `hold-${room.id}` ? "Ðang gi?..." : "Gi? phòng"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card" style={{ marginTop: 16 }}>
        <h2>L?ch s? booking c?a tôi</h2>
        <p className="card-sub">Lu?ng BE: thanh toán mô ph?ng, h?y booking, t?i PDF</p>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Mã booking</th>
                <th>Phòng</th>
                <th>Ngày ?</th>
                <th>Tr?ng thái</th>
                <th>S? ti?n</th>
                <th>H?n gi? còn l?i</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id}>
                  <td>#{booking.id}</td>
                  <td>
                    {booking.roomCode} - {booking.roomTypeName}
                  </td>
                  <td>
                    {formatDate(booking.checkInDate)} - {formatDate(booking.checkOutDate)}
                  </td>
                  <td>
                    <span className={`badge badge-${booking.status}`}>
                      {BOOKING_STATUS_TEXT[booking.status] || booking.status}
                    </span>
                  </td>
                  <td>{formatCurrency(booking.totalAmount)}</td>
                  <td>{booking.status === "HOLD" ? holdRemaining(booking.holdExpiresAt) : "-"}</td>
                  <td>
                    <div className="inline-actions">
                      {booking.status === "HOLD" && (
                        <button
                          type="button"
                          onClick={() => payMock(booking.id)}
                          disabled={loadingKey === `pay-${booking.id}`}
                        >
                          {loadingKey === `pay-${booking.id}` ? "Ðang x? lý..." : "Thanh toán mô ph?ng"}
                        </button>
                      )}
                      {(booking.status === "HOLD" || booking.status === "CONFIRMED") && (
                        <button
                          type="button"
                          className="btn-danger"
                          onClick={() => cancelBooking(booking.id)}
                          disabled={loadingKey === `cancel-${booking.id}`}
                        >
                          {loadingKey === `cancel-${booking.id}` ? "Ðang h?y..." : "H?y"}
                        </button>
                      )}
                      <button
                        type="button"
                        className="btn-outline"
                        onClick={() => downloadPdf(booking.id)}
                        disabled={loadingKey === `pdf-${booking.id}`}
                      >
                        {loadingKey === `pdf-${booking.id}` ? "Ðang t?i..." : "T?i PDF"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid grid-2" style={{ marginTop: 16 }}>
        <article className="card">
          <h2>Ðánh giá d?ch v? khách s?n</h2>
          <p className="card-sub">Lu?ng BE: `/reviews` và `/reviews/hotel`</p>

          <form className="grid" onSubmit={submitReview}>
            <label>
              S? sao
              <select
                value={reviewForm.rating}
                onChange={(e) => setReviewForm({ ...reviewForm, rating: e.target.value })}
              >
                <option value={5}>5 sao - R?t t?t</option>
                <option value={4}>4 sao - T?t</option>
                <option value={3}>3 sao - Khá</option>
                <option value={2}>2 sao - C?n c?i thi?n</option>
                <option value={1}>1 sao - Không hài lòng</option>
              </select>
            </label>
            <label>
              Nh?n xét
              <textarea
                value={reviewForm.comment}
                onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                placeholder="Chia s? tr?i nghi?m th?c t? c?a b?n"
                maxLength={500}
                required
              />
            </label>
            <button type="submit">G?i dánh giá</button>
          </form>

          <div className="table-wrap" style={{ marginTop: 14 }}>
            <table>
              <thead>
                <tr>
                  <th>Khách hàng</th>
                  <th>Ði?m</th>
                  <th>N?i dung</th>
                  <th>Th?i gian</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map((review) => (
                  <tr key={review.id}>
                    <td>{review.fullName}</td>
                    <td>{review.rating}/5</td>
                    <td>{review.comment}</td>
                    <td>{formatDateTime(review.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="card">
          <h2>Thông tin v? trí & h? tr?</h2>
          <p className="card-sub">B? sung lu?ng tu v?n ngu?i dùng nhanh cho bài demo d? án</p>

          <iframe
            title="B?n d? Rex Sài Gòn"
            width="100%"
            height="240"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            style={{ border: "1px solid #d8d3c8", borderRadius: 12 }}
            src="https://www.google.com/maps?q=Rex+Hotel+Saigon&output=embed"
          />

          <div style={{ marginTop: 14 }}>
            <SupportChatbot />
          </div>
        </article>
      </section>
    </div>
  );
}

export default HomePage;
