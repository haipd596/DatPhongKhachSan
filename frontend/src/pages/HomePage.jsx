import { useEffect, useMemo, useState } from "react";
import client from "../api/client";
import { useAuth } from "../auth/AuthContext";
import SupportChatbot from "../components/SupportChatbot";

const BOOKING_STATUS_TEXT = {
  HOLD: "Đang giữ",
  CONFIRMED: "Đã xác nhận",
  CANCELLED: "Đã hủy",
  EXPIRED: "Hết hạn"
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
  if (diffMs <= 0) return "Đã hết";
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
    const timer = setInterval(() => setBookings((prev) => [...prev]), 1000);
    return () => clearInterval(timer);
  }, []);

  const statusStats = useMemo(() => {
    return bookings.reduce(
      (acc, item) => {
        acc[item.status] = (acc[item.status] || 0) + 1;
        return acc;
      },
      { HOLD: 0, CONFIRMED: 0, CANCELLED: 0, EXPIRED: 0 }
    );
  }, [bookings]);

  const avgRating = useMemo(() => {
    if (!reviews.length) return 0;
    return reviews.reduce((sum, item) => sum + Number(item.rating || 0), 0) / reviews.length;
  }, [reviews]);

  const nearestBookings = useMemo(() => {
    return [...bookings]
      .sort((a, b) => new Date(a.checkInDate) - new Date(b.checkInDate))
      .slice(0, 5);
  }, [bookings]);

  const availabilityRate = useMemo(() => {
    if (!summary.length) return 0;
    const total = summary.reduce((sum, item) => sum + Number(item.totalRooms || 0), 0);
    const available = summary.reduce((sum, item) => sum + Number(item.availableRooms || 0), 0);
    if (!total) return 0;
    return Math.round((available / total) * 100);
  }, [summary]);

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
      setError(err.response?.data?.message || "Không tải được dữ liệu trang khách hàng");
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
      setMessage(`Đã cập nhật dữ liệu phòng trống từ ${checkIn} đến ${checkOut}.`);
    } catch (err) {
      setError(err.response?.data?.message || "Không tìm được phòng trống");
    }
  };

  const holdRoom = async (roomId) => {
    setError("");
    setMessage("");
    if (!checkIn || !checkOut) {
      setError("Vui lòng chọn ngày nhận và ngày trả phòng trước khi giữ phòng.");
      return;
    }

    setLoadingKey(`hold-${roomId}`);
    try {
      const res = await client.post("/bookings/hold", {
        roomId,
        checkInDate: checkIn,
        checkOutDate: checkOut
      });
      setMessage(`Giữ phòng thành công cho booking #${res.data.id}, hạn giữ đến ${formatDateTime(res.data.holdExpiresAt)}.`);
      await refreshBookingsAndVip();
    } catch (err) {
      setError(err.response?.data?.message || "Giữ phòng thất bại");
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
      setMessage(`Thanh toán mô phỏng thành công cho booking #${bookingId}.`);
      await refreshBookingsAndVip();
    } catch (err) {
      setError(err.response?.data?.message || "Thanh toán thất bại");
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
      setMessage(`Đã hủy booking #${bookingId}.`);
      await refreshBookingsAndVip();
    } catch (err) {
      setError(err.response?.data?.message || "Hủy booking thất bại");
    } finally {
      setLoadingKey("");
    }
  };

  const downloadPdf = async (bookingId) => {
    setError("");
    setLoadingKey(`pdf-${bookingId}`);
    try {
      const res = await client.get(`/bookings/${bookingId}/pdf?purpose=Giấy+xác+nhận+đặt+phòng`, {
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
      setError(err.response?.data?.message || "Không tải được PDF");
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
      setMessage("Đã gửi đánh giá dịch vụ thành công.");
    } catch (err) {
      setError(err.response?.data?.message || "Không gửi được đánh giá");
    }
  };

  return (
    <div className="page-shell">
      <header className="topbar">
        <div>
          <h1 className="brand-title">Rex Hotel Booking - Trung tâm khách hàng</h1>
          <p className="brand-sub">Xin chào {user.fullName} ({user.email}) - vai trò: {user.role}</p>
        </div>
        <div className="topbar-actions">
          <button type="button" className="btn-outline" onClick={loadDefaultData}>Làm mới dữ liệu</button>
          <button type="button" onClick={logout}>Đăng xuất</button>
        </div>
      </header>

      <section className="hero-panel">
        <h2 className="hero-title">Không gian điều phối lưu trú cá nhân</h2>
        <p className="hero-sub">
          Bảng điều khiển này hiển thị trạng thái đặt phòng, mức ưu đãi VIP, mức độ khả dụng của khách sạn và các mốc lưu trú quan trọng để bạn ra quyết định nhanh hơn.
        </p>
        <div className="hero-grid">
          <div className="hero-chip">
            <div className="hero-chip-label">Hạng thành viên</div>
            <div className="hero-chip-value">{vipInfo?.vipLevel || user.vipLevel || "NORMAL"}</div>
          </div>
          <div className="hero-chip">
            <div className="hero-chip-label">Chiết khấu hiện tại</div>
            <div className="hero-chip-value">{Math.round(Number(vipInfo?.discountRate || 0) * 100)}%</div>
          </div>
          <div className="hero-chip">
            <div className="hero-chip-label">Booking đã xác nhận</div>
            <div className="hero-chip-value">{statusStats.CONFIRMED}</div>
          </div>
          <div className="hero-chip">
            <div className="hero-chip-label">Điểm đánh giá trung bình</div>
            <div className="hero-chip-value">{avgRating.toFixed(1)}/5</div>
          </div>
        </div>
      </section>

      {error && <p className="alert alert-error">{error}</p>}
      {message && <p className="alert alert-success">{message}</p>}

      <section className="split-layout">
        <div className="stack">
          <article className="card">
            <h2>Tổng quan booking</h2>
            <div className="metric-grid">
              <div className="metric-tile"><div className="metric-label">Đang giữ</div><div className="metric-value">{statusStats.HOLD}</div></div>
              <div className="metric-tile"><div className="metric-label">Đã xác nhận</div><div className="metric-value">{statusStats.CONFIRMED}</div></div>
              <div className="metric-tile"><div className="metric-label">Đã hủy</div><div className="metric-value">{statusStats.CANCELLED}</div></div>
              <div className="metric-tile"><div className="metric-label">Hết hạn</div><div className="metric-value">{statusStats.EXPIRED}</div></div>
            </div>
            <p className="card-sub">Thông tin này giúp bạn theo dõi chất lượng phiên đặt phòng và kịp xử lý booking HOLD.</p>
          </article>

          <article className="card">
            <h2>Tìm phòng theo thời gian</h2>
            <p className="card-sub">Tập trung vào dữ liệu khả dụng để chọn khung ngày tối ưu.</p>
            <form className="grid" onSubmit={searchAvailable}>
              <div className="form-row">
                <label>Ngày nhận phòng<input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} required /></label>
                <label>Ngày trả phòng<input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} required /></label>
              </div>
              <div className="form-actions"><button type="submit">Phân tích phòng trống</button></div>
            </form>
            {!!summary.length && (
              <>
                <div className="progress-row">
                  <div className="progress-head"><span>Tỷ lệ phòng còn trống toàn hệ thống</span><strong>{availabilityRate}%</strong></div>
                  <div className="progress-track"><div className="progress-fill" style={{ width: `${availabilityRate}%` }} /></div>
                </div>
                <div className="table-wrap">
                  <table>
                    <thead><tr><th>Loại phòng</th><th>Tổng phòng</th><th>Đang bị giữ/đặt</th><th>Còn trống</th></tr></thead>
                    <tbody>
                      {summary.map((item) => (
                        <tr key={item.roomTypeId}><td>{item.roomTypeName}</td><td>{item.totalRooms}</td><td>{item.reservedRooms}</td><td>{item.availableRooms}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </article>
        </div>

        <div className="stack">
          <article className="card">
            <h2>Lịch lưu trú gần nhất</h2>
            <p className="card-sub">Các mốc check-in sắp tới và trạng thái tương ứng.</p>
            <div className="timeline">
              {nearestBookings.map((item) => (
                <div className="timeline-item" key={item.id}>
                  <p className="timeline-title">Booking #{item.id} - {item.roomCode}</p>
                  <p className="timeline-meta">{formatDate(item.checkInDate)} đến {formatDate(item.checkOutDate)} | {BOOKING_STATUS_TEXT[item.status]}</p>
                </div>
              ))}
              {!nearestBookings.length && <p className="card-sub">Chưa có booking nào.</p>}
            </div>
          </article>

          <article className="card">
            <h2>Loại phòng và mức giá</h2>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Loại phòng</th><th>Giá cơ bản</th><th>Sức chứa</th><th>Mô tả</th></tr></thead>
                <tbody>
                  {roomTypes.map((type) => (
                    <tr key={type.id}><td>{type.name}</td><td>{formatCurrency(type.basePrice)}</td><td>{type.maxGuests} khách</td><td>{type.description || "-"}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
        </div>
      </section>

      <section className="card" style={{ marginTop: 14 }}>
        <h2>Danh sách phòng sẵn sàng đặt</h2>
        <p className="card-sub">Trực tiếp giữ phòng theo mã phòng khi đã xác định khung ngày phù hợp.</p>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Mã phòng</th><th>Loại phòng</th><th>Tầng</th><th>Giá/đêm</th><th>Sức chứa</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
            <tbody>
              {rooms.map((room) => (
                <tr key={room.id}>
                  <td>{room.code}</td><td>{room.roomTypeName}</td><td>{room.floorNumber}</td><td>{formatCurrency(room.basePrice)}</td><td>{room.maxGuests} khách</td>
                  <td><span className={`badge badge-${room.status}`}>{room.status}</span></td>
                  <td>
                    <button type="button" onClick={() => holdRoom(room.id)} disabled={loadingKey === `hold-${room.id}`}>
                      {loadingKey === `hold-${room.id}` ? "Đang giữ..." : "Giữ phòng"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card" style={{ marginTop: 14 }}>
        <h2>Lịch sử booking của tôi</h2>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Mã</th><th>Phòng</th><th>Ngày ở</th><th>Trạng thái</th><th>Tổng tiền</th><th>Hạn giữ còn lại</th><th>Thao tác</th></tr></thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id}>
                  <td>#{booking.id}</td>
                  <td>{booking.roomCode} - {booking.roomTypeName}</td>
                  <td>{formatDate(booking.checkInDate)} - {formatDate(booking.checkOutDate)}</td>
                  <td><span className={`badge badge-${booking.status}`}>{BOOKING_STATUS_TEXT[booking.status] || booking.status}</span></td>
                  <td>{formatCurrency(booking.totalAmount)}</td>
                  <td>{booking.status === "HOLD" ? holdRemaining(booking.holdExpiresAt) : "-"}</td>
                  <td>
                    <div className="inline-actions">
                      {booking.status === "HOLD" && (
                        <button type="button" onClick={() => payMock(booking.id)} disabled={loadingKey === `pay-${booking.id}`}>
                          {loadingKey === `pay-${booking.id}` ? "Đang xử lý..." : "Thanh toán mô phỏng"}
                        </button>
                      )}
                      {(booking.status === "HOLD" || booking.status === "CONFIRMED") && (
                        <button type="button" className="btn-danger" onClick={() => cancelBooking(booking.id)} disabled={loadingKey === `cancel-${booking.id}`}>
                          {loadingKey === `cancel-${booking.id}` ? "Đang hủy..." : "Hủy"}
                        </button>
                      )}
                      <button type="button" className="btn-outline" onClick={() => downloadPdf(booking.id)} disabled={loadingKey === `pdf-${booking.id}`}>
                        {loadingKey === `pdf-${booking.id}` ? "Đang tải..." : "Tải PDF"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid grid-2" style={{ marginTop: 14 }}>
        <article className="card">
          <h2>Đánh giá dịch vụ</h2>
          <form className="grid" onSubmit={submitReview}>
            <label>
              Số sao
              <select value={reviewForm.rating} onChange={(e) => setReviewForm({ ...reviewForm, rating: e.target.value })}>
                <option value={5}>5 sao - Rất tốt</option>
                <option value={4}>4 sao - Tốt</option>
                <option value={3}>3 sao - Khá</option>
                <option value={2}>2 sao - Cần cải thiện</option>
                <option value={1}>1 sao - Không hài lòng</option>
              </select>
            </label>
            <label>
              Nhận xét
              <textarea value={reviewForm.comment} onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })} maxLength={500} required />
            </label>
            <button type="submit">Gửi đánh giá</button>
          </form>
          <div className="table-wrap" style={{ marginTop: 12 }}>
            <table>
              <thead><tr><th>Khách hàng</th><th>Điểm</th><th>Nội dung</th><th>Thời gian</th></tr></thead>
              <tbody>
                {reviews.map((review) => (
                  <tr key={review.id}><td>{review.fullName}</td><td>{review.rating}/5</td><td>{review.comment}</td><td>{formatDateTime(review.createdAt)}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="card">
          <h2>Thông tin vị trí và hỗ trợ</h2>
          <iframe
            title="Bản đồ Rex Sài Gòn"
            width="100%"
            height="230"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            style={{ border: "1px solid #d9e0e7", borderRadius: 12 }}
            src="https://www.google.com/maps?q=Rex+Hotel+Saigon&output=embed"
          />
          <div style={{ marginTop: 12 }}><SupportChatbot /></div>
        </article>
      </section>
    </div>
  );
}

export default HomePage;
