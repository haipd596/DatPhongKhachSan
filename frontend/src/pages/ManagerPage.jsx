import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import client from "../api/client";

function formatCurrency(value) {
  return Number(value || 0).toLocaleString("vi-VN") + " VND";
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
      setError(err.response?.data?.message || "Không t?i du?c d? li?u qu?n tr?");
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
        setMessage("C?p nh?t lo?i phòng thành công.");
      } else {
        await client.post("/manager/room-types", payload);
        setMessage("T?o lo?i phòng thành công.");
      }
      resetTypeForm();
      await loadManagerData();
    } catch (err) {
      setError(err.response?.data?.message || "Không luu du?c lo?i phòng");
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
        setMessage("C?p nh?t phòng thành công.");
      } else {
        await client.post("/manager/rooms", payload);
        setMessage("T?o phòng thành công.");
      }
      resetRoomForm();
      await loadManagerData();
    } catch (err) {
      setError(err.response?.data?.message || "Không luu du?c phòng");
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
      setMessage(`Ðã xóa lo?i phòng #${id}.`);
      if (editingTypeId === id) resetTypeForm();
      await loadManagerData();
    } catch (err) {
      setError(err.response?.data?.message || "Không xóa du?c lo?i phòng");
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
      setMessage(`Ðã xóa phòng #${id}.`);
      if (editingRoomId === id) resetRoomForm();
      await loadManagerData();
    } catch (err) {
      setError(err.response?.data?.message || "Không xóa du?c phòng");
    } finally {
      setLoadingKey("");
    }
  };

  return (
    <div className="page-shell">
      <header className="topbar">
        <div>
          <h1 className="brand-title">Rex Hotel Booking - C?ng qu?n tr?</h1>
          <p className="brand-sub">
            Xin chào {user.fullName} ({user.email}) | Tr?ng thái API: {health || "Ðang ki?m tra..."}
          </p>
        </div>
        <div className="topbar-actions">
          <button type="button" className="btn-outline" onClick={loadManagerData}>
            Làm m?i d? li?u
          </button>
          <button type="button" onClick={logout}>
            Ðang xu?t
          </button>
        </div>
      </header>

      {error && <p className="alert alert-error">{error}</p>}
      {message && <p className="alert alert-success">{message}</p>}

      <section className="grid grid-3" style={{ marginTop: 16 }}>
        <article className="kpi">
          <div className="kpi-label">T?ng s? phòng</div>
          <div className="kpi-value">{dashboard?.totalRooms ?? "-"}</div>
        </article>
        <article className="kpi">
          <div className="kpi-label">Phòng kh? d?ng</div>
          <div className="kpi-value">{dashboard?.availableRooms ?? "-"}</div>
        </article>
        <article className="kpi">
          <div className="kpi-label">Booking dã xác nh?n</div>
          <div className="kpi-value">{dashboard?.confirmedBookings ?? "-"}</div>
        </article>
        <article className="kpi">
          <div className="kpi-label">Doanh thu dã xác nh?n</div>
          <div className="kpi-value">{formatCurrency(dashboard?.revenue)}</div>
        </article>
        <article className="kpi">
          <div className="kpi-label">Ði?m dánh giá trung bình</div>
          <div className="kpi-value">{dashboard ? Number(dashboard.avgRating).toFixed(2) : "-"}</div>
        </article>
      </section>

      <section className="grid grid-2" style={{ marginTop: 16 }}>
        <article className="card">
          <h2>{editingTypeId ? `C?p nh?t lo?i phòng #${editingTypeId}` : "T?o lo?i phòng m?i"}</h2>
          <p className="card-sub">Lu?ng BE: `/manager/room-types` (POST/PUT/DELETE)</p>

          <form className="grid" onSubmit={submitRoomType}>
            <label>
              Tên lo?i phòng
              <input
                value={typeForm.name}
                onChange={(e) => setTypeForm({ ...typeForm, name: e.target.value })}
                placeholder="Standard / Deluxe / Suite"
                required
              />
            </label>
            <div className="form-row">
              <label>
                Giá co b?n (VND)
                <input
                  type="number"
                  min="1"
                  value={typeForm.basePrice}
                  onChange={(e) => setTypeForm({ ...typeForm, basePrice: e.target.value })}
                  required
                />
              </label>
              <label>
                S? khách t?i da
                <input
                  type="number"
                  min="1"
                  value={typeForm.maxGuests}
                  onChange={(e) => setTypeForm({ ...typeForm, maxGuests: e.target.value })}
                  required
                />
              </label>
            </div>
            <label>
              Mô t?
              <textarea
                value={typeForm.description}
                onChange={(e) => setTypeForm({ ...typeForm, description: e.target.value })}
                placeholder="Mô t? ng?n v? ti?n nghi và d?nh v? lo?i phòng"
              />
            </label>
            <div className="form-actions">
              <button type="submit" disabled={loadingKey === "room-type-submit"}>
                {loadingKey === "room-type-submit"
                  ? "Ðang luu..."
                  : editingTypeId
                    ? "C?p nh?t lo?i phòng"
                    : "T?o lo?i phòng"}
              </button>
              {editingTypeId && (
                <button type="button" className="btn-outline" onClick={resetTypeForm}>
                  H?y ch?nh s?a
                </button>
              )}
            </div>
          </form>
        </article>

        <article className="card">
          <h2>{editingRoomId ? `C?p nh?t phòng #${editingRoomId}` : "T?o phòng m?i"}</h2>
          <p className="card-sub">Lu?ng BE: `/manager/rooms` (POST/PUT/DELETE)</p>

          <form className="grid" onSubmit={submitRoom}>
            <div className="form-row">
              <label>
                Mã phòng
                <input
                  value={roomForm.code}
                  onChange={(e) => setRoomForm({ ...roomForm, code: e.target.value.toUpperCase() })}
                  placeholder="D401"
                  required
                />
              </label>
              <label>
                T?ng
                <input
                  type="number"
                  min="1"
                  value={roomForm.floorNumber}
                  onChange={(e) => setRoomForm({ ...roomForm, floorNumber: e.target.value })}
                  required
                />
              </label>
            </div>
            <div className="form-row">
              <label>
                Lo?i phòng
                <select
                  value={roomForm.roomTypeId}
                  onChange={(e) => setRoomForm({ ...roomForm, roomTypeId: e.target.value })}
                  required
                >
                  <option value="">Ch?n lo?i phòng</option>
                  {roomTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Tr?ng thái
                <select
                  value={roomForm.status}
                  onChange={(e) => setRoomForm({ ...roomForm, status: e.target.value })}
                  required
                >
                  <option value="AVAILABLE">AVAILABLE</option>
                  <option value="MAINTENANCE">MAINTENANCE</option>
                </select>
              </label>
            </div>
            <div className="form-actions">
              <button type="submit" disabled={loadingKey === "room-submit"}>
                {loadingKey === "room-submit" ? "Ðang luu..." : editingRoomId ? "C?p nh?t phòng" : "T?o phòng"}
              </button>
              {editingRoomId && (
                <button type="button" className="btn-outline" onClick={resetRoomForm}>
                  H?y ch?nh s?a
                </button>
              )}
            </div>
          </form>
        </article>
      </section>

      <section className="card" style={{ marginTop: 16 }}>
        <h2>Danh sách lo?i phòng</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Tên lo?i</th>
                <th>Giá co b?n</th>
                <th>S?c ch?a</th>
                <th>Mô t?</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {roomTypes.map((type) => (
                <tr key={type.id}>
                  <td>{type.id}</td>
                  <td>{type.name}</td>
                  <td>{formatCurrency(type.basePrice)}</td>
                  <td>{type.maxGuests} khách</td>
                  <td>{type.description || "-"}</td>
                  <td>
                    <div className="inline-actions">
                      <button type="button" className="btn-outline" onClick={() => editRoomType(type)}>
                        S?a
                      </button>
                      <button
                        type="button"
                        className="btn-danger"
                        onClick={() => removeRoomType(type.id)}
                        disabled={loadingKey === `type-delete-${type.id}`}
                      >
                        {loadingKey === `type-delete-${type.id}` ? "Ðang xóa..." : "Xóa"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card" style={{ marginTop: 16 }}>
        <h2>Danh sách phòng</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Mã phòng</th>
                <th>T?ng</th>
                <th>Lo?i phòng</th>
                <th>Tr?ng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map((room) => (
                <tr key={room.id}>
                  <td>{room.id}</td>
                  <td>{room.code}</td>
                  <td>{room.floorNumber}</td>
                  <td>{room.roomTypeName}</td>
                  <td>
                    <span className={`badge badge-${room.status}`}>{room.status}</span>
                  </td>
                  <td>
                    <div className="inline-actions">
                      <button type="button" className="btn-outline" onClick={() => editRoom(room)}>
                        S?a
                      </button>
                      <button
                        type="button"
                        className="btn-danger"
                        onClick={() => removeRoom(room.id)}
                        disabled={loadingKey === `room-delete-${room.id}`}
                      >
                        {loadingKey === `room-delete-${room.id}` ? "Ðang xóa..." : "Xóa"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default ManagerPage;
