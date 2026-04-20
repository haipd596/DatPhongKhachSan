import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import client from "../api/client";

function formatCurrency(value) {
  return Number(value || 0).toLocaleString("vi-VN") + " VND";
}

function BarChart({ data }) {
  const width = 360;
  const height = 160;
  const max = Math.max(1, ...data.map((d) => d.value));
  const barW = width / Math.max(1, data.length);

  return (
    <svg className="chart-svg" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Biểu đồ cột vận hành">
      {data.map((item, index) => {
        const ratio = item.value / max;
        const h = Math.max(ratio * 110, 2);
        const x = index * barW + 18;
        const y = 130 - h;
        return (
          <g key={item.label}>
            <rect x={x} y={y} width={barW - 34} height={h} fill={item.color || "#059669"} rx="6" />
            <text x={x + (barW - 34) / 2} y="146" textAnchor="middle" fontSize="10" fill="#475569" fontWeight="600">{item.label}</text>
            <text x={x + (barW - 34) / 2} y={y - 6} textAnchor="middle" fontSize="10" fill="#0f172a" fontWeight="bold">{String(item.value).length > 6 ? item.value / 1000000 + 'M' : item.value}</text>
          </g>
        );
      })}
    </svg>
  );
}

function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;
  return (
    <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'center' }}>
      <button className="btn btn-outline" onClick={() => onPageChange(page - 1)} disabled={page === 0}>Trước</button>
      <span style={{ display: 'flex', alignItems: 'center', fontWeight: 'bold' }}>Trang {page + 1} / {totalPages}</span>
      <button className="btn btn-outline" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages - 1}>Sau</button>
    </div>
  );
}

function ManagerPage() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("tong-quan");
  const [health, setHealth] = useState("");
  const [dashboard, setDashboard] = useState(null);
  
  // Data cho Rooms & Types (van giu nguyên)
  const [roomTypes, setRoomTypes] = useState([]);
  const [rooms, setRooms] = useState([]);

  // Dữ liệu Tính năng đạt điểm cao
  const [revenueStats, setRevenueStats] = useState([]);
  
  // Pagination Fetch states
  const [customersData, setCustomersData] = useState({ content: [], totalPages: 1, number: 0 });
  const [bookingsData, setBookingsData] = useState({ content: [], totalPages: 1, number: 0 });
  
  // Form states cho Room
  const [typeForm, setTypeForm] = useState({ name: "", basePrice: "", maxGuests: "", description: "" });
  const [roomForm, setRoomForm] = useState({ code: "", floorNumber: "", roomTypeId: "", status: "AVAILABLE" });
  const [editingTypeId, setEditingTypeId] = useState(null);
  const [editingRoomId, setEditingRoomId] = useState(null);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loadingKey, setLoadingKey] = useState("");

  useEffect(() => {
    loadManagerData();
    loadCustomers(0);
    loadBookings(0);
    loadRevenue(new Date().getFullYear());
  }, []);

  const loadManagerData = async () => {
    try {
      setError("");
      const [healthRes, dashRes, typesRes, roomsRes] = await Promise.all([
        client.get("/manager/health"),
        client.get("/manager/dashboard"),
        client.get("/manager/room-types"),
        client.get("/manager/rooms")
      ]);
      setHealth(healthRes.data.message || "Manager API OK");
      setDashboard(dashRes.data);
      setRoomTypes(typesRes.data);
      setRooms(roomsRes.data);
    } catch (err) {
      setError(err.response?.data?.message || "Không tải được dữ liệu vận hành");
    }
  };

  const loadCustomers = async (page) => {
    try {
      const res = await client.get(`/manager/customers?page=${page}&size=5`);
      setCustomersData(res.data);
    } catch (err) {
      setError("Không tải được danh sách hội viên");
    }
  };

  const loadBookings = async (page) => {
    try {
      const res = await client.get(`/manager/bookings?page=${page}&size=5`);
      setBookingsData(res.data);
    } catch (err) {
      setError("Không tải được danh sách đơn đặt phòng");
    }
  };

  const loadRevenue = async (year) => {
    try {
      const res = await client.get(`/manager/dashboard/revenue?year=${year}`);
      setRevenueStats(res.data);
    } catch (err) {
      setError("Không tải được báo cáo tài chính");
    }
  };

  const revenueChartData = useMemo(() => {
    if (!revenueStats.length) return [{ label: "Chưa có", value: 0 }];
    return revenueStats.map(r => ({
      label: `T${r.month}`,
      value: r.totalRevenue,
      color: "#d4af37" // Vàng royal
    }));
  }, [revenueStats]);

  const bookingAction = async (id, action) => {
    setError("");
    setMessage("");
    setLoadingKey(`booking-${action}-${id}`);
    try {
      await client.post(`/manager/bookings/${id}/${action}`);
      setMessage(`Thao tác ${action} đơn #${id} thành công.`);
      loadBookings(bookingsData.number);
    } catch (err) {
      setError(err.response?.data?.message || `Thao tác thất bại`);
    } finally {
      setLoadingKey("");
    }
  };

  // ... (Giu nguyen cac ham submitRoomType, submitRoom nhu cu de rut gon code, ban van co the mo giong HomePage neu can)
  const submitRoomType = async (e) => {
    e.preventDefault();
    setLoadingKey("room-type-submit");
    const payload = { ...typeForm, basePrice: Number(typeForm.basePrice), maxGuests: Number(typeForm.maxGuests) };
    try {
      if (editingTypeId) {
        await client.put(`/manager/room-types/${editingTypeId}`, payload);
      } else {
        await client.post("/manager/room-types", payload);
      }
      setTypeForm({ name: "", basePrice: "", maxGuests: "", description: "" });
      setEditingTypeId(null);
      loadManagerData();
    } catch (err) {} finally { setLoadingKey(""); }
  };

  const submitRoom = async (e) => {
    e.preventDefault();
    setLoadingKey("room-submit");
    const payload = { ...roomForm, floorNumber: Number(roomForm.floorNumber), roomTypeId: Number(roomForm.roomTypeId) };
    try {
      if (editingRoomId) {
        await client.put(`/manager/rooms/${editingRoomId}`, payload);
      } else {
        await client.post("/manager/rooms", payload);
      }
      setRoomForm({ code: "", floorNumber: "", roomTypeId: "", status: "AVAILABLE" });
      setEditingRoomId(null);
      loadManagerData();
    } catch (err) {} finally { setLoadingKey(""); }
  };

  const editRoomType = (t) => { setEditingTypeId(t.id); setTypeForm({ name: t.name, basePrice: t.basePrice, maxGuests: t.maxGuests, description: t.description || "" }); };
  const editRoom = (r) => { setEditingRoomId(r.id); setRoomForm({ code: r.code, floorNumber: r.floorNumber, roomTypeId: r.roomTypeId, status: r.status }); };

  const menu = [
    { id: 'tong-quan', label: 'Dashboard Giám Đốc' },
    { id: 'quan-ly-doanh-thu', label: 'Thống kê & Đơn Hàng' },
    { id: 'quan-ly-hoi-vien', label: 'Quản lý Hội Viên' },
    { id: 'quan-ly-phong', label: 'Cơ Sở Vật Chất' },
  ];

  return (
    <div className="page-shell">
      <header className="topbar no-print">
        <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
          <svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor">
            <path d="M2.25 18a.75.75 0 0 0 0 1.5c5.4 0 10.6 0 19.5 0a.75.75 0 0 0 0-1.5H2.25Zm0-2.25v-8.5a.75.75 0 0 1 1.25-.56l4.28 3.86 3.49-7.31a.75.75 0 0 1 1.35 0l3.49 7.31 4.28-3.86a.75.75 0 0 1 1.25.56v8.5H2.25Z" />
          </svg>
          <div>
            <h1 className="brand-title">RexHotel Administration</h1>
            <p className="brand-sub">Hệ thống Điều hành | {user.fullName}</p>
          </div>
        </div>
        <div className="topbar-actions">
          <button type="button" className="btn btn-outline" onClick={() => window.location.reload()}>Làm mới dữ liệu</button>
          <button type="button" className="btn btn-outline" onClick={() => window.print()}>In báo cáo PDF</button>
          <button type="button" className="btn" onClick={logout}>Đăng xuất</button>
        </div>
      </header>

      <section className="hero-panel" style={{ borderRadius: '0 0 var(--radius-lg) var(--radius-lg)' }}>
        <h2 className="hero-title">Trạm Điều Hành Tổng (HUD)</h2>
        <p className="hero-sub" style={{ opacity: 0.9 }}>Số liệu cập nhật thời gian thực. Sẵn sàng báo cáo Hội đồng quản trị.</p>
        <div className="hero-grid">
          <div className="hero-chip"><div className="hero-chip-label">Sức chứa</div><div className="hero-chip-value">{dashboard?.totalRooms ?? 0} Phòng</div></div>
          <div className="hero-chip"><div className="hero-chip-label">Đang Giao dịch</div><div className="hero-chip-value">{dashboard?.confirmedBookings ?? 0}</div></div>
          <div className="hero-chip"><div className="hero-chip-label">Tổng doanh thu</div><div className="hero-chip-value text-gold" style={{color: 'var(--gold)'}}>{formatCurrency(dashboard?.revenue)}</div></div>
        </div>
      </section>

      <div className="workspace">
        <aside className="sidebar no-print">
          <h3>Điều hướng nhanh</h3>
          <div className="side-list">
            {menu.map(m => (
              <a key={m.id} className={`side-link ${activeTab === m.id ? 'active' : ''}`} href={`#${m.id}`} onClick={() => setActiveTab(m.id)}>
                {m.label}
              </a>
            ))}
          </div>
        </aside>

        <main className="content-stack">
          {error && <div className="alert alert-error">{error}</div>}
          {message && <div className="alert alert-success">{message}</div>}

          <section id="tong-quan" className="split-layout">
            <div className="stack">
              <article className="card">
                <h2>Phân tích Doanh Thu Cấp Quản Lý (Năm nay)</h2>
                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: 16}}>
                   <p style={{fontSize: '0.9rem', color: '#64748b'}}>Đây là chỉ số quan trọng dùng để theo dõi sự tăng trưởng doanh số hàng tháng.</p>
                </div>
                <div className="chart-box">
                  <BarChart data={revenueChartData} />
                </div>
              </article>
            </div>
          </section>

          <section id="quan-ly-doanh-thu" className="card">
            <h2>Giao Dịch Đặt Chỗ Gần Đây</h2>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Mã Số</th><th>Hội Viên</th><th>Phân Loại</th><th>Thời Gian</th><th>Hiện Trạng</th><th>Giá Trị</th><th>Điều Phối</th></tr></thead>
                <tbody>
                  {bookingsData.content.map((b) => (
                    <tr key={b.id}>
                      <td style={{fontWeight: 'bold'}}>#{b.id}</td>
                      <td>
                         <div style={{fontWeight: 600}}>{b.customerName}</div>
                         <div style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>{b.customerEmail} ({b.vipLevel})</div>
                      </td>
                      <td>{b.roomCode} ({b.roomTypeName})</td>
                      <td>{b.checkInDate} ➡️ {b.checkOutDate}</td>
                      <td><span className={`badge badge-${b.status}`}>{b.status}</span></td>
                      <td style={{color: 'var(--primary)', fontWeight: 'bold'}}>{formatCurrency(b.totalAmount)}</td>
                      <td>
                         <div style={{display: 'flex', gap: 6}}>
                           {(b.status === 'CONFIRMED' || b.status === 'HOLD') && <button className="btn" style={{padding: '4px 8px', fontSize: '11px'}} onClick={() => bookingAction(b.id, 'check-in')}>Check-In</button>}
                           {b.status === 'CHECKED_IN' && <button className="btn btn-outline" style={{padding: '4px 8px', fontSize: '11px', color: 'var(--gold-dark)', borderColor: 'var(--gold)'}} onClick={() => bookingAction(b.id, 'check-out')}>Check-Out</button>}
                         </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={bookingsData.number} totalPages={bookingsData.totalPages} onPageChange={loadBookings} />
          </section>

          <section id="quan-ly-hoi-vien" className="card">
            <h2>Quản trị Khách hàng theo Xếp hạng Số lượng Booking</h2>
            <div className="table-wrap">
              <table>
                <thead><tr><th>ID</th><th>Họ Tên</th><th>Định Danh Kỹ Thuật Số</th><th>Hạng Uy Tín</th><th>Tổng Yêu Cầu</th></tr></thead>
                <tbody>
                  {customersData.content.map((c) => (
                    <tr key={c.id}>
                      <td>#{c.id}</td>
                      <td style={{fontWeight: 600}}>{c.fullName}</td>
                      <td>{c.email}</td>
                      <td><span className="badge badge-GOLD_MEMBER" style={{background: 'var(--gold-light)', color: 'var(--gold-dark)'}}>{c.vipLevel}</span></td>
                      <td style={{fontWeight: 'bold', fontSize: '1.2rem', textAlign: 'center'}}>{c.bookingCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={customersData.number} totalPages={customersData.totalPages} onPageChange={loadCustomers} />
          </section>

          <section id="quan-ly-phong" className="grid grid-2">
            {/* GIUU NGUYEN PHAN FORM QUAN LY PHONG */}
            <article className="card">
              <h2>{editingTypeId ? `Cập nhật hạng phòng #${editingTypeId}` : "Thêm mới Hạng Phòng"}</h2>
              <form className="grid" onSubmit={submitRoomType}>
                <label className="form-label">Tên hạng<input className="form-control" value={typeForm.name} onChange={(e) => setTypeForm({ ...typeForm, name: e.target.value })} required /></label>
                <div className="form-row">
                  <label className="form-label">Niêm yết (VND)<input className="form-control" type="number" min="1" value={typeForm.basePrice} onChange={(e) => setTypeForm({ ...typeForm, basePrice: e.target.value })} required /></label>
                  <label className="form-label">Khách tối đa<input className="form-control" type="number" min="1" value={typeForm.maxGuests} onChange={(e) => setTypeForm({ ...typeForm, maxGuests: e.target.value })} required /></label>
                </div>
                <button type="submit" className="btn full-width">{editingTypeId ? "Cập nhật hạng" : "Mở Hạng Mới"}</button>
              </form>
            </article>

            <article className="card">
              <h2>{editingRoomId ? `Cập nhật buồng phòng #${editingRoomId}` : "Khởi tạo Buồng phòng"}</h2>
              <form className="grid" onSubmit={submitRoom}>
                <div className="form-row">
                  <label className="form-label">Mã Buồng<input className="form-control" value={roomForm.code} onChange={(e) => setRoomForm({ ...roomForm, code: e.target.value.toUpperCase() })} required /></label>
                  <label className="form-label">Tầng<input className="form-control" type="number" min="1" value={roomForm.floorNumber} onChange={(e) => setRoomForm({ ...roomForm, floorNumber: e.target.value })} required /></label>
                </div>
                <div className="form-row">
                  <label className="form-label">Gắn Hạng
                    <select className="form-control" value={roomForm.roomTypeId} onChange={(e) => setRoomForm({ ...roomForm, roomTypeId: e.target.value })} required>
                      <option value="">Chọn...</option>
                      {roomTypes.map((type) => <option key={type.id} value={type.id}>{type.name}</option>)}
                    </select>
                  </label>
                </div>
                <button type="submit" className="btn full-width">{editingRoomId ? "Cập nhật buồng" : "Mở Buồng"}</button>
              </form>
            </article>
          </section>

          <section className="card">
             <h2>Danh muc Hạng và Buồng Phòng</h2>
             <div className="grid grid-2">
                 <div className="table-wrap">
                    <table>
                      <thead><tr><th>Tên hạng</th><th>Giá</th><th>Sức chứa</th><th>Sửa</th></tr></thead>
                      <tbody>
                        {roomTypes.map((type) => (
                          <tr key={type.id}>
                            <td>{type.name}</td><td>{formatCurrency(type.basePrice)}</td><td>{type.maxGuests}</td>
                            <td><button className="btn btn-outline" style={{padding: '4px', fontSize: 11}} onClick={() => editRoomType(type)}>Sửa</button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                 </div>
                 <div className="table-wrap">
                    <table>
                      <thead><tr><th>Buồng</th><th>Tầng</th><th>Trạng Thái</th><th>Sửa</th></tr></thead>
                      <tbody>
                        {rooms.map((room) => (
                          <tr key={room.id}>
                            <td>{room.code}</td><td>{room.floorNumber}</td><td>{room.status}</td>
                            <td><button className="btn btn-outline" style={{padding: '4px', fontSize: 11}} onClick={() => editRoom(room)}>Sửa</button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                 </div>
             </div>
          </section>

        </main>
      </div>
    </div>
  );
}

export default ManagerPage;
