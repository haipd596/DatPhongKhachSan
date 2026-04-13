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
        const h = (item.value / max) * 110;
        const x = index * barW + 18;
        const y = 130 - h;
        return (
          <g key={item.label}>
            <rect x={x} y={y} width={barW - 34} height={h} fill={item.color} rx="6" />
            <text x={x + (barW - 34) / 2} y="146" textAnchor="middle" fontSize="10" fill="#475569">{item.label}</text>
            <text x={x + (barW - 34) / 2} y={y - 4} textAnchor="middle" fontSize="10" fill="#0f172a">{item.value}</text>
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
    <svg className="chart-svg" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Biểu đồ đường phân bố theo tầng">
      <line x1="30" y1="130" x2="340" y2="130" stroke="#cbd5e1" strokeWidth="1" />
      <line x1="30" y1="20" x2="30" y2="130" stroke="#cbd5e1" strokeWidth="1" />
      <polyline points={points} fill="none" stroke="#0f7d67" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      {data.map((item, idx) => {
        const x = 30 + idx * stepX;
        const y = 130 - (item.value / max) * 100;
        return (
          <g key={item.label}>
            <circle cx={x} cy={y} r="4" fill="#0f7d67" />
            <text x={x} y="145" textAnchor="middle" fontSize="10" fill="#475569">{item.label}</text>
          </g>
        );
      })}
    </svg>
  );
}

function ManagerPage() {
  const { user, logout } = useAuth();

  const [health, setHealth] = useState("");
  const [dashboard, setDashboard] = useState(null);
  const [roomTypes, setRoomTypes] = useState([]);
  const [rooms, setRooms] = useState([]);

  const [typeForm, setTypeForm] = useState({ name: "", basePrice: "", maxGuests: "", description: "" });
  const [roomForm, setRoomForm] = useState({ code: "", floorNumber: "", roomTypeId: "", status: "AVAILABLE" });

  const [editingTypeId, setEditingTypeId] = useState(null);
  const [editingRoomId, setEditingRoomId] = useState(null);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loadingKey, setLoadingKey] = useState("");

  useEffect(() => {
    loadManagerData();
  }, []);

  const roomStatusCount = useMemo(
    () =>
      rooms.reduce(
        (acc, room) => {
          acc[room.status] = (acc[room.status] || 0) + 1;
          return acc;
        },
        { AVAILABLE: 0, MAINTENANCE: 0 }
      ),
    [rooms]
  );

  const availableRate = useMemo(() => {
    const total = rooms.length;
    if (!total) return 0;
    return Math.round((roomStatusCount.AVAILABLE / total) * 100);
  }, [rooms, roomStatusCount]);

  const topRoomTypes = useMemo(() => {
    const map = roomTypes.map((type) => ({
      id: type.id,
      name: type.name,
      count: rooms.filter((room) => room.roomTypeId === type.id).length
    }));
    return map.sort((a, b) => b.count - a.count).slice(0, 4);
  }, [roomTypes, rooms]);

  const roomStatusChart = useMemo(
    () => [
      { label: "AVAILABLE", value: roomStatusCount.AVAILABLE, color: "#059669" },
      { label: "MAINT", value: roomStatusCount.MAINTENANCE, color: "#dc2626" }
    ],
    [roomStatusCount]
  );

  const floorTrend = useMemo(() => {
    const floorMap = new Map();
    rooms.forEach((room) => {
      const key = Number(room.floorNumber);
      floorMap.set(key, (floorMap.get(key) || 0) + 1);
    });
    return [...floorMap.entries()]
      .sort((a, b) => a[0] - b[0])
      .slice(0, 8)
      .map(([floor, count]) => ({ label: `T${floor}`, value: count }));
  }, [rooms]);

  const loadManagerData = async () => {
    try {
      setError("");
      const [healthRes, dashboardRes, typesRes, roomsRes] = await Promise.all([
        client.get("/manager/health"),
        client.get("/manager/dashboard"),
        client.get("/manager/room-types"),
        client.get("/manager/rooms")
      ]);
      setHealth(healthRes.data.message || "Manager API OK");
      setDashboard(dashboardRes.data);
      setRoomTypes(typesRes.data);
      setRooms(roomsRes.data);
    } catch (err) {
      setError(err.response?.data?.message || "Không tải được dữ liệu quản trị");
    }
  };

  const resetTypeForm = () => {
    setTypeForm({ name: "", basePrice: "", maxGuests: "", description: "" });
    setEditingTypeId(null);
  };

  const resetRoomForm = () => {
    setRoomForm({ code: "", floorNumber: "", roomTypeId: "", status: "AVAILABLE" });
    setEditingRoomId(null);
  };

  const submitRoomType = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    const payload = {
      ...typeForm,
      basePrice: Number(typeForm.basePrice),
      maxGuests: Number(typeForm.maxGuests)
    };

    setLoadingKey("room-type-submit");
    try {
      if (editingTypeId) {
        await client.put(`/manager/room-types/${editingTypeId}`, payload);
        setMessage("Cập nhật loại phòng thành công.");
      } else {
        await client.post("/manager/room-types", payload);
        setMessage("Tạo loại phòng thành công.");
      }
      resetTypeForm();
      await loadManagerData();
    } catch (err) {
      setError(err.response?.data?.message || "Không lưu được loại phòng");
    } finally {
      setLoadingKey("");
    }
  };

  const submitRoom = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    const payload = {
      ...roomForm,
      floorNumber: Number(roomForm.floorNumber),
      roomTypeId: Number(roomForm.roomTypeId)
    };

    setLoadingKey("room-submit");
    try {
      if (editingRoomId) {
        await client.put(`/manager/rooms/${editingRoomId}`, payload);
        setMessage("Cập nhật phòng thành công.");
      } else {
        await client.post("/manager/rooms", payload);
        setMessage("Tạo phòng thành công.");
      }
      resetRoomForm();
      await loadManagerData();
    } catch (err) {
      setError(err.response?.data?.message || "Không lưu được phòng");
    } finally {
      setLoadingKey("");
    }
  };

  const editRoomType = (type) => {
    setEditingTypeId(type.id);
    setTypeForm({
      name: type.name,
      basePrice: type.basePrice,
      maxGuests: type.maxGuests,
      description: type.description || ""
    });
  };

  const editRoom = (room) => {
    setEditingRoomId(room.id);
    setRoomForm({
      code: room.code,
      floorNumber: room.floorNumber,
      roomTypeId: room.roomTypeId,
      status: room.status
    });
  };

  const removeRoomType = async (id) => {
    setError("");
    setMessage("");
    setLoadingKey(`type-delete-${id}`);
    try {
      await client.delete(`/manager/room-types/${id}`);
      setMessage(`Đã xóa loại phòng #${id}.`);
      if (editingTypeId === id) resetTypeForm();
      await loadManagerData();
    } catch (err) {
      setError(err.response?.data?.message || "Không xóa được loại phòng");
    } finally {
      setLoadingKey("");
    }
  };

  const removeRoom = async (id) => {
    setError("");
    setMessage("");
    setLoadingKey(`room-delete-${id}`);
    try {
      await client.delete(`/manager/rooms/${id}`);
      setMessage(`Đã xóa phòng #${id}.`);
      if (editingRoomId === id) resetRoomForm();
      await loadManagerData();
    } catch (err) {
      setError(err.response?.data?.message || "Không xóa được phòng");
    } finally {
      setLoadingKey("");
    }
  };

  return (
    <div className="page-shell">
      <header className="topbar no-print">
        <div>
          <h1 className="brand-title">Rex Hotel Booking - Trung tâm vận hành</h1>
          <p className="brand-sub">{user.fullName} ({user.email}) | API: {health || "Đang kiểm tra"}</p>
        </div>
        <div className="topbar-actions">
          <button type="button" className="btn-outline" onClick={loadManagerData}>Làm mới dữ liệu</button>
          <button type="button" className="btn-outline" onClick={() => window.print()}>In báo cáo PDF</button>
          <button type="button" onClick={logout}>Đăng xuất</button>
        </div>
      </header>

      <section id="tong-quan" className="hero-panel">
        <h2 className="hero-title">Bức tranh toàn cảnh vận hành khách sạn</h2>
        <p className="hero-sub">Hiển thị ngay các chỉ số công suất phòng, booking xác nhận và doanh thu để phục vụ thuyết trình đồ án bảo vệ.</p>
        <div className="hero-grid">
          <div className="hero-chip"><div className="hero-chip-label">Tổng phòng</div><div className="hero-chip-value">{dashboard?.totalRooms ?? 0}</div></div>
          <div className="hero-chip"><div className="hero-chip-label">Khả dụng</div><div className="hero-chip-value">{dashboard?.availableRooms ?? 0}</div></div>
          <div className="hero-chip"><div className="hero-chip-label">Booking xác nhận</div><div className="hero-chip-value">{dashboard?.confirmedBookings ?? 0}</div></div>
          <div className="hero-chip"><div className="hero-chip-label">Doanh thu</div><div className="hero-chip-value">{formatCurrency(dashboard?.revenue)}</div></div>
        </div>
      </section>

      {error && <p className="alert alert-error">{error}</p>}
      {message && <p className="alert alert-success">{message}</p>}

      <div className="workspace">
        <aside className="sidebar no-print">
          <h3>Điều hướng nhanh</h3>
          <div className="side-list">
            <a className="side-link" href="#tong-quan">Tổng quan</a>
            <a className="side-link" href="#phan-tich">Biểu đồ vận hành</a>
            <a className="side-link" href="#quan-ly-loai">Quản lý loại phòng</a>
            <a className="side-link" href="#quan-ly-phong">Quản lý phòng</a>
            <a className="side-link" href="#danh-sach-loai">Danh sách loại phòng</a>
            <a className="side-link" href="#danh-sach-phong">Danh sách phòng</a>
            <a className="side-link" href="#bao-cao">Bản in báo cáo</a>
          </div>
        </aside>

        <main className="content-stack">
          <section id="phan-tich" className="split-layout">
            <div className="stack">
              <article className="card">
                <h2>Phân tích vận hành</h2>
                <div className="metric-grid">
                  <div className="metric-tile"><div className="metric-label">Điểm đánh giá TB</div><div className="metric-value">{dashboard ? Number(dashboard.avgRating).toFixed(2) : "0.00"}</div></div>
                  <div className="metric-tile"><div className="metric-label">AVAILABLE</div><div className="metric-value">{roomStatusCount.AVAILABLE}</div></div>
                  <div className="metric-tile"><div className="metric-label">MAINTENANCE</div><div className="metric-value">{roomStatusCount.MAINTENANCE}</div></div>
                  <div className="metric-tile"><div className="metric-label">Tỷ lệ sẵn sàng</div><div className="metric-value">{availableRate}%</div></div>
                </div>
                <div className="progress-row">
                  <div className="progress-head"><span>Mức sẵn sàng phòng toàn khách sạn</span><strong>{availableRate}%</strong></div>
                  <div className="progress-track"><div className="progress-fill" style={{ width: `${availableRate}%` }} /></div>
                </div>
                <div className="chart-grid">
                  <div className="chart-box">
                    <p className="chart-title">Cơ cấu trạng thái phòng</p>
                    <BarChart data={roomStatusChart} />
                  </div>
                  <div className="chart-box">
                    <p className="chart-title">Phân bố phòng theo tầng</p>
                    <LineChart data={floorTrend.length ? floorTrend : [{ label: "T1", value: 0 }]} />
                  </div>
                </div>
              </article>
            </div>

            <div className="stack">
              <article className="card">
                <h2>Top loại phòng theo quy mô</h2>
                <div className="timeline">
                  {topRoomTypes.map((item) => (
                    <div key={item.id} className="timeline-item">
                      <p className="timeline-title">{item.name}</p>
                      <p className="timeline-meta">Số phòng hiện có: {item.count}</p>
                    </div>
                  ))}
                  {!topRoomTypes.length && <p className="card-sub">Chưa có dữ liệu loại phòng.</p>}
                </div>
              </article>
            </div>
          </section>

          <section className="grid grid-2">
            <article id="quan-ly-loai" className="card">
              <h2>{editingTypeId ? `Cập nhật loại phòng #${editingTypeId}` : "Tạo loại phòng mới"}</h2>
              <form className="grid" onSubmit={submitRoomType}>
                <label>Tên loại phòng<input value={typeForm.name} onChange={(e) => setTypeForm({ ...typeForm, name: e.target.value })} required /></label>
                <div className="form-row">
                  <label>Giá cơ bản (VND)<input type="number" min="1" value={typeForm.basePrice} onChange={(e) => setTypeForm({ ...typeForm, basePrice: e.target.value })} required /></label>
                  <label>Số khách tối đa<input type="number" min="1" value={typeForm.maxGuests} onChange={(e) => setTypeForm({ ...typeForm, maxGuests: e.target.value })} required /></label>
                </div>
                <label>Mô tả<textarea value={typeForm.description} onChange={(e) => setTypeForm({ ...typeForm, description: e.target.value })} /></label>
                <div className="form-actions">
                  <button type="submit" disabled={loadingKey === "room-type-submit"}>{loadingKey === "room-type-submit" ? "Đang lưu..." : editingTypeId ? "Cập nhật loại phòng" : "Tạo loại phòng"}</button>
                  {editingTypeId && <button type="button" className="btn-outline" onClick={resetTypeForm}>Hủy chỉnh sửa</button>}
                </div>
              </form>
            </article>

            <article id="quan-ly-phong" className="card">
              <h2>{editingRoomId ? `Cập nhật phòng #${editingRoomId}` : "Tạo phòng mới"}</h2>
              <form className="grid" onSubmit={submitRoom}>
                <div className="form-row">
                  <label>Mã phòng<input value={roomForm.code} onChange={(e) => setRoomForm({ ...roomForm, code: e.target.value.toUpperCase() })} required /></label>
                  <label>Tầng<input type="number" min="1" value={roomForm.floorNumber} onChange={(e) => setRoomForm({ ...roomForm, floorNumber: e.target.value })} required /></label>
                </div>
                <div className="form-row">
                  <label>Loại phòng
                    <select value={roomForm.roomTypeId} onChange={(e) => setRoomForm({ ...roomForm, roomTypeId: e.target.value })} required>
                      <option value="">Chọn loại phòng</option>
                      {roomTypes.map((type) => <option key={type.id} value={type.id}>{type.name}</option>)}
                    </select>
                  </label>
                  <label>Trạng thái
                    <select value={roomForm.status} onChange={(e) => setRoomForm({ ...roomForm, status: e.target.value })}>
                      <option value="AVAILABLE">AVAILABLE</option>
                      <option value="MAINTENANCE">MAINTENANCE</option>
                    </select>
                  </label>
                </div>
                <div className="form-actions">
                  <button type="submit" disabled={loadingKey === "room-submit"}>{loadingKey === "room-submit" ? "Đang lưu..." : editingRoomId ? "Cập nhật phòng" : "Tạo phòng"}</button>
                  {editingRoomId && <button type="button" className="btn-outline" onClick={resetRoomForm}>Hủy chỉnh sửa</button>}
                </div>
              </form>
            </article>
          </section>

          <section id="danh-sach-loai" className="card">
            <h2>Danh sách loại phòng</h2>
            <div className="table-wrap">
              <table>
                <thead><tr><th>ID</th><th>Tên loại</th><th>Giá cơ bản</th><th>Sức chứa</th><th>Mô tả</th><th>Thao tác</th></tr></thead>
                <tbody>
                  {roomTypes.map((type) => (
                    <tr key={type.id}>
                      <td>{type.id}</td><td>{type.name}</td><td>{formatCurrency(type.basePrice)}</td><td>{type.maxGuests} khách</td><td>{type.description || "-"}</td>
                      <td>
                        <div className="inline-actions">
                          <button type="button" className="btn-outline" onClick={() => editRoomType(type)}>Sửa</button>
                          <button type="button" className="btn-danger" onClick={() => removeRoomType(type.id)} disabled={loadingKey === `type-delete-${type.id}`}>{loadingKey === `type-delete-${type.id}` ? "Đang xóa..." : "Xóa"}</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section id="danh-sach-phong" className="card">
            <h2>Danh sách phòng</h2>
            <div className="table-wrap">
              <table>
                <thead><tr><th>ID</th><th>Mã phòng</th><th>Tầng</th><th>Loại phòng</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
                <tbody>
                  {rooms.map((room) => (
                    <tr key={room.id}>
                      <td>{room.id}</td><td>{room.code}</td><td>{room.floorNumber}</td><td>{room.roomTypeName}</td><td><span className={`badge badge-${room.status}`}>{room.status}</span></td>
                      <td>
                        <div className="inline-actions">
                          <button type="button" className="btn-outline" onClick={() => editRoom(room)}>Sửa</button>
                          <button type="button" className="btn-danger" onClick={() => removeRoom(room.id)} disabled={loadingKey === `room-delete-${room.id}`}>{loadingKey === `room-delete-${room.id}` ? "Đang xóa..." : "Xóa"}</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section id="bao-cao" className="card print-only">
            <h2>Báo cáo tóm tắt quản trị</h2>
            <div className="report-grid">
              <div className="report-item"><strong>Quản trị viên</strong><p>{user.fullName} - {user.email}</p></div>
              <div className="report-item"><strong>Tổng phòng / Khả dụng</strong><p>{dashboard?.totalRooms ?? 0} / {dashboard?.availableRooms ?? 0}</p></div>
              <div className="report-item"><strong>Doanh thu xác nhận</strong><p>{formatCurrency(dashboard?.revenue)}</p></div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default ManagerPage;
