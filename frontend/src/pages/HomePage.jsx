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

const STATUS_COLORS = {
  HOLD: "#f59e0b",
  CONFIRMED: "#10b981",
  CANCELLED: "#ef4444",
  EXPIRED: "#8b5cf6"
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
  if (diffMs <= 0) return "Đã hết hạn";
  const min = Math.floor(diffMs / 60000);
  const sec = Math.floor((diffMs % 60000) / 1000);
  return `${min}m ${sec}s`;
}

function BarChart({ data }) {
  const width = 360;
  const height = 160;
  const max = Math.max(1, ...data.map((d) => d.value));
  const barW = width / Math.max(1, data.length);

  return (
    <svg className="chart-svg" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Biểu đồ cột trạng thái booking">
      {data.map((item, index) => {
        const ratio = item.value / max;
        const h = Math.max(ratio * 110, 2);
        const x = index * barW + 18;
        const y = 130 - h;
        return (
          <g key={item.label}>
            <rect x={x} y={y} width={barW - 34} height={h} fill={item.color} rx="4" />
            <text x={x + (barW - 34) / 2} y="146" textAnchor="middle" fontSize="10" fill="#6b7280" fontWeight="600">
              {item.label}
            </text>
            <text x={x + (barW - 34) / 2} y={y - 6} textAnchor="middle" fontSize="10" fill="#1f2937" fontWeight="bold">
              {item.value}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function LineChart({ data }) {
  const width = 360;
  const height = 160;
  const max = Math.max(1, ...data.map((d) => d.value));
  const stepX = data.length > 1 ? 300 / (data.length - 1) : 0;

  const points = data
    .map((item, idx) => {
      const x = 30 + idx * stepX;
      const y = 130 - (item.value / max) * 100;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg className="chart-svg" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Biểu đồ xu hướng booking theo tháng">
      <line x1="30" y1="130" x2="340" y2="130" stroke="#e5e7eb" strokeWidth="1" />
      <line x1="30" y1="20" x2="30" y2="130" stroke="#e5e7eb" strokeWidth="1" />
      <polyline points={points} fill="none" stroke="#d4af37" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
      {data.map((item, idx) => {
        const x = 30 + idx * stepX;
        const y = 130 - (item.value / max) * 100;
        return (
          <g key={item.label}>
            <circle cx={x} cy={y} r="5" fill="#14b8a6" stroke="#fff" strokeWidth="2" />
            <text x={x} y="146" textAnchor="middle" fontSize="10" fill="#6b7280" fontWeight="600">
              {item.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
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
  const [activeTab, setActiveTab] = useState("tong-quan");

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

  const statusStats = useMemo(
    () =>
      bookings.reduce(
        (acc, item) => {
          acc[item.status] = (acc[item.status] || 0) + 1;
          return acc;
        },
        { HOLD: 0, CONFIRMED: 0, CANCELLED: 0, EXPIRED: 0 }
      ),
    [bookings]
  );

  const avgRating = useMemo(() => {
    if (!reviews.length) return 0;
    return reviews.reduce((sum, item) => sum + Number(item.rating || 0), 0) / reviews.length;
  }, [reviews]);

  const nearestBookings = useMemo(
    () => [...bookings].sort((a, b) => new Date(a.checkInDate) - new Date(b.checkInDate)).slice(0, 5),
    [bookings]
  );

  const availabilityRate = useMemo(() => {
    if (!summary.length) return 0;
    const total = summary.reduce((sum, item) => sum + Number(item.totalRooms || 0), 0);
    const available = summary.reduce((sum, item) => sum + Number(item.availableRooms || 0), 0);
    if (!total) return 0;
    return Math.round((available / total) * 100);
  }, [summary]);

  const monthlyBookingTrend = useMemo(() => {
    const now = new Date();
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      months.push({
        key,
        label: `T${d.getMonth() + 1}`,
        value: 0
      });
    }
    bookings.forEach((booking) => {
      const source = booking.createdAt || booking.checkInDate;
      if (!source) return;
      const d = new Date(source);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const target = months.find((m) => m.key === key);
      if (target) target.value += 1;
    });
    return months;
  }, [bookings]);

  const bookingStatusChart = useMemo(
    () => [
      { label: "HOLD", value: statusStats.HOLD, color: STATUS_COLORS.HOLD },
      { label: "CONFIRMED", value: statusStats.CONFIRMED, color: STATUS_COLORS.CONFIRMED },
      { label: "CANCELLED", value: statusStats.CANCELLED, color: STATUS_COLORS.CANCELLED },
      { label: "EXPIRED", value: statusStats.EXPIRED, color: STATUS_COLORS.EXPIRED }
    ],
    [statusStats]
  );

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
      setMessage(`Đã cập nhật biểu đồ phòng với thông số mới.`);
    } catch (err) {
      setError(err.response?.data?.message || "Không tìm được phòng trống");
    }
  };

  const holdRoom = async (roomId) => {
    setError("");
    setMessage("");
    if (!checkIn || !checkOut) {
      setError("Thiết lập khoảng thời gian trước khi yêu cầu giữ phòng.");
      return;
    }

    setLoadingKey(`hold-${roomId}`);
    try {
      const res = await client.post("/bookings/hold", {
        roomId,
        checkInDate: checkIn,
        checkOutDate: checkOut
      });
      setMessage(`Thành công thiết lập yêu cầu giữ phòng [Mã: #${res.data.id}]. Hạn chót: ${formatDateTime(res.data.holdExpiresAt)}.`);
      await refreshBookingsAndVip();
    } catch (err) {
      setError(err.response?.data?.message || "Yêu cầu thất bại do tình trạng phòng kẹt");
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
      setMessage(`Xác thực tài khoản thành công cho lộ trình #${bookingId}.`);
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
      setMessage(`Đã huy bỏ lộ trình #${bookingId}.`);
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
      setError(err.response?.data?.message || "Trích xuất tài liệu thất bại");
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
      setMessage("Tri ân phản hồi của Quý hội viên.");
    } catch (err) {
      setError(err.response?.data?.message || "Đánh giá chưa hội đủ điều kiện (Cần checkout)");
    }
  };

  const menu = [
    { id: 'tong-quan', label: 'Dashboard Hội Viên', icon: <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/> },
    { id: 'tim-phong', label: 'Đặc Quyền Cư Trú', icon: <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/> },
    { id: 'booking', label: 'Hồ Sơ Đặt Chỗ', icon: <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/> },
    { id: 'danh-gia', label: 'Chia Sẻ Cảm Nhận', icon: <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/> }
  ];

  return (
    <div className="page-shell">
      <header className="topbar no-print">
        <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
          <svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor">
            <path d="M2.25 18a.75.75 0 0 0 0 1.5c5.4 0 10.6 0 19.5 0a.75.75 0 0 0 0-1.5H2.25Zm0-2.25v-8.5a.75.75 0 0 1 1.25-.56l4.28 3.86 3.49-7.31a.75.75 0 0 1 1.35 0l3.49 7.31 4.28-3.86a.75.75 0 0 1 1.25.56v8.5H2.25Z" />
          </svg>
          <div>
            <h1 className="brand-title">RexHotel</h1>
            <p className="brand-sub">Khu vực hội viên • {user.fullName}</p>
          </div>
        </div>
        <div className="topbar-actions">
          <button type="button" className="btn btn-outline" onClick={loadDefaultData}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/></svg>
            Tải Lại
          </button>
          <button type="button" className="btn btn-outline" onClick={() => window.print()}>
            Xuất Báo Cáo
          </button>
          <button type="button" className="btn" onClick={logout}>Đăng xuất</button>
        </div>
      </header>

      {/* Cập nhật Hero Section Premium */}
      <section className="hero-panel" style={{ borderRadius: '0 0 var(--radius-lg) var(--radius-lg)' }}>
        <h2 className="hero-title">Định Hình Không Gian Của Sự Hoàn Mỹ</h2>
        <p className="hero-sub" style={{ opacity: 0.9 }}>
          Chào mừng hội viên hạng <span className="vip-badge">{vipInfo?.vipLevel || user.vipLevel || "NORMAL"}</span><br/>
          Trải nghiệm đẳng cấp cùng ưu đãi chiết khấu {Math.round(Number(vipInfo?.discountRate || 0) * 100)}% trọn đời.
        </p>
        <div className="hero-grid">
          <div className="hero-chip">
            <div className="hero-chip-label">Lượt lưu trú tích luỹ</div>
            <div className="hero-chip-value">{user.bookingCount || statusStats.CONFIRMED}</div>
          </div>
          <div className="hero-chip">
            <div className="hero-chip-label">Đang chờ xác minh</div>
            <div className="hero-chip-value">{statusStats.HOLD}</div>
          </div>
          <div className="hero-chip">
            <div className="hero-chip-label">Chấm điểm Review TB</div>
            <div className="hero-chip-value">{avgRating.toFixed(1)}/5</div>
          </div>
        </div>
      </section>

      <div className="workspace">
        <aside className="sidebar no-print">
          <h3>Menu Hội Viên</h3>
          <div className="side-list">
            {menu.map(m => (
              <a key={m.id} className={`side-link ${activeTab === m.id ? 'active' : ''}`} href={`#${m.id}`} onClick={() => setActiveTab(m.id)}>
                <svg viewBox="0 0 24 24">{m.icon}</svg>
                {m.label}
              </a>
            ))}
          </div>
        </aside>

        <main className="content-stack">
          {error && <div className="alert alert-error">
             <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
             {error}
          </div>}
          {message && <div className="alert alert-success">
             <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
             {message}
          </div>}

          <section id="tong-quan" className="split-layout">
            <div className="stack">
              <article className="card">
                <h2>Trạng Thái Hiện Tại</h2>
                <div className="metric-grid">
                  <div className="metric-tile"><div className="metric-label">Đang Giữ</div><div className="metric-value">{statusStats.HOLD}</div></div>
                  <div className="metric-tile"><div className="metric-label">Xác Nhận</div><div className="metric-value">{statusStats.CONFIRMED}</div></div>
                  <div className="metric-tile"><div className="metric-label">Thất Bại/Hủy</div><div className="metric-value">{statusStats.CANCELLED}</div></div>
                  <div className="metric-tile"><div className="metric-label">Quá Hạn</div><div className="metric-value">{statusStats.EXPIRED}</div></div>
                </div>

                <div className="chart-grid" style={{ marginTop: 24 }}>
                  <div className="chart-box">
                    <p className="chart-title">Tỷ Trọng Hồ Sơ</p>
                    <BarChart data={bookingStatusChart} />
                  </div>
                  <div className="chart-box">
                    <p className="chart-title">Nhu Cầu 6 Tháng Của Tôi</p>
                    <LineChart data={monthlyBookingTrend} />
                  </div>
                </div>
              </article>

              <article id="tim-phong" className="card">
                <h2>Bộ Phân Tích Hiện Trạng Phòng</h2>
                <form className="grid" onSubmit={searchAvailable}>
                  <div className="form-row">
                    <label>Bắt đầu từ<input type="date" className="form-control" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} required /></label>
                    <label>Kết thúc vào<input type="date" className="form-control" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} required /></label>
                  </div>
                  <div className="form-actions"><button type="submit" className="btn">Thiết Lập Bộ Đếm</button></div>
                </form>
                {!!summary.length && (
                  <div style={{ marginTop: 24 }}>
                    <div className="progress-row">
                      <div className="progress-head"><span>Mức Độ Hoạt Động Của Hệ Thống</span><strong>{availabilityRate}% Sẵn Sàng</strong></div>
                      <div className="progress-track"><div className="progress-fill" style={{ width: `${availabilityRate}%` }} /></div>
                    </div>
                    <div className="table-wrap">
                      <table>
                        <thead><tr><th>Hạng Phòng</th><th>Quỹ Phòng</th><th>Đang Giao Dịch</th><th>Có Thể Chọn</th></tr></thead>
                        <tbody>{summary.map((item) => <tr key={item.roomTypeId}><td>{item.roomTypeName}</td><td>{item.totalRooms}</td><td><span style={{color: 'var(--danger)', fontWeight: 'bold'}}>{item.reservedRooms}</span></td><td><span style={{color: 'var(--success)', fontWeight: 'bold'}}>{item.availableRooms}</span></td></tr>)}</tbody>
                      </table>
                    </div>
                  </div>
                )}
              </article>
            </div>

            <div className="stack">
               <article className="card">
                 <h2>Khảo Sát Danh Mục Lưu Trú</h2>
                  <div className="table-wrap">
                    <table>
                      <thead><tr><th>Khu Vực Phân Tầng/Mã</th><th>Hạng</th><th>Giá Niêm Yết / Đêm</th><th>Hành Động</th></tr></thead>
                      <tbody>
                        {rooms.map((room) => (
                          <tr key={room.id}>
                            <td>
                              <div style={{display: 'flex', flexDirection: 'column'}}>
                                <span style={{fontWeight: 700, color: 'var(--primary)', fontSize: '1.1rem'}}>{room.code}</span>
                                <span style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>Tại tầng {room.floorNumber}</span>
                              </div>
                            </td>
                            <td>
                               <div>{room.roomTypeName}</div>
                               <span className={`badge badge-${room.status}`}>{room.status}</span>
                            </td>
                            <td>
                               <div style={{ color: 'var(--gold-dark)', fontWeight: 'bold', fontSize: '1.05rem'}}>{formatCurrency(room.basePrice)}</div>
                               <div style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>Sức chứa: {room.maxGuests} khách</div>
                            </td>
                            <td>
                               <button type="button" className="btn btn-outline" style={{padding: '8px 16px', fontSize: '0.8rem'}} onClick={() => holdRoom(room.id)} disabled={loadingKey === `hold-${room.id}` || room.status !== 'AVAILABLE'}>
                                  {loadingKey === `hold-${room.id}` ? "Đang xử lý..." : "Chiếm Chỗ"}
                               </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
               </article>
            </div>
          </section>

          <section id="booking" className="card">
            <h2>Hồ Sơ Đặt Chỗ Cá Nhân</h2>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Mã GD</th><th>Phân Loại</th><th>Thời Gian Yêu Cầu</th><th>Hiện Trạng</th><th>Giá Trị</th><th>Đồng Hồ Đếm Ngược</th><th>Tiện Ích</th></tr></thead>
                <tbody>
                  {bookings.map((booking) => (
                    <tr key={booking.id}>
                      <td style={{fontWeight: 600}}>#{booking.id}</td>
                      <td>
                         <div style={{fontWeight: 600}}>{booking.roomCode}</div>
                         <div style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>{booking.roomTypeName}</div>
                      </td>
                      <td>
                         <div style={{marginBottom: 4}}>{formatDate(booking.checkInDate)}</div>
                         <div>{formatDate(booking.checkOutDate)}</div>
                      </td>
                      <td><span className={`badge badge-${booking.status}`}>{BOOKING_STATUS_TEXT[booking.status] || booking.status}</span></td>
                      <td style={{fontWeight: 'bold', color: 'var(--primary)'}}>{formatCurrency(booking.totalAmount)}</td>
                      <td>
                         <span style={{color: 'var(--warning)', fontWeight: 'bold'}}>
                           {booking.status === "HOLD" ? holdRemaining(booking.holdExpiresAt) : "-"}
                         </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          {booking.status === "HOLD" && <button type="button" className="btn" style={{padding: '6px 12px', fontSize: '0.75rem'}} onClick={() => payMock(booking.id)} disabled={loadingKey === `pay-${booking.id}`}>{loadingKey === `pay-${booking.id}` ? "..." : "Xác Thực VIP"}</button>}
                          {(booking.status === "HOLD" || booking.status === "CONFIRMED") && <button type="button" className="btn btn-danger" style={{padding: '6px 12px', fontSize: '0.75rem'}} onClick={() => cancelBooking(booking.id)} disabled={loadingKey === `cancel-${booking.id}`}>{loadingKey === `cancel-${booking.id}` ? "..." : "Hủy Hoàn Tiền"}</button>}
                          <button type="button" className="btn btn-outline" style={{padding: '6px 12px', fontSize: '0.75rem'}} onClick={() => downloadPdf(booking.id)} disabled={loadingKey === `pdf-${booking.id}`}>{loadingKey === `pdf-${booking.id}` ? "..." : "Bản In PDF"}</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="grid grid-2">
            <article id="danh-gia" className="card">
              <h2>Kênh Cảm Nhận Khách Hàng</h2>
              <form className="grid" onSubmit={submitReview} style={{ background: 'var(--bg-color)', padding: 20, borderRadius: 10}}>
                <label className="form-label">Thang điểm hài lòng
                  <select className="form-control" style={{marginTop: 8}} value={reviewForm.rating} onChange={(e) => setReviewForm({ ...reviewForm, rating: e.target.value })}>
                    <option value={5}>⭐⭐⭐⭐⭐ Tuyệt hảo</option>
                    <option value={4}>⭐⭐⭐⭐ Tốt</option>
                    <option value={3}>⭐⭐⭐ Tạm Được</option>
                    <option value={2}>⭐⭐ Tệ</option>
                    <option value={1}>⭐ Rất Tệ</option>
                  </select>
                </label>
                <label className="form-label">Lời nhắn gửi
                   <textarea className="form-control" style={{marginTop: 8, minHeight: 100}} value={reviewForm.comment} onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })} maxLength={500} required placeholder="Xin hãy cho chúng tôi biết cảm nhận của bạn..."/>
                </label>
                <button type="submit" className="btn">Ghi Nhận Phản Hồi</button>
              </form>
              <div className="timeline" style={{ marginTop: 24, padding: '0 12px' }}>
                {reviews.map((review) => (
                  <div className="timeline-item" key={review.id}>
                    <p className="timeline-title">{review.fullName} <span style={{color: 'var(--gold)', marginLeft: 8}}>{"★".repeat(review.rating)}</span></p>
                    <p style={{fontStyle: 'italic', marginBottom: 8}}>{review.comment}</p>
                    <p className="timeline-meta">{formatDateTime(review.createdAt)}</p>
                  </div>
                ))}
              </div>
            </article>

            <article className="card" style={{display: 'flex', flexDirection: 'column'}}>
              <h2>Bản Đồ Kết Nối & Trung Tâm Hỗ Trợ</h2>
              <iframe title="Bản đồ Rex Sài Gòn" width="100%" height="300" loading="lazy" referrerPolicy="no-referrer-when-downgrade" style={{ border: "1px solid var(--border)", borderRadius: "var(--radius-md)", flex: 1, marginBottom: 20 }} src="https://www.google.com/maps?q=Rex+Hotel+Saigon&output=embed" />
              <div><SupportChatbot /></div>
            </article>
          </section>

          <section id="bao-cao" className="card print-only">
            <h2>Báo cáo tóm tắt khách hàng</h2>
            <div className="report-grid">
              <div className="report-item"><strong>Khách hàng</strong><p>{user.fullName} - {user.email}</p></div>
              <div className="report-item"><strong>Hạng định danh</strong><p>{vipInfo?.vipLevel || "NORMAL"} ({Math.round(Number(vipInfo?.discountRate || 0) * 100)}%)</p></div>
              <div className="report-item"><strong>Giao dịch thành công</strong><p>{statusStats.CONFIRMED}</p></div>
            </div>
          </section>

        </main>
      </div>
    </div>
  );
}

export default HomePage;
