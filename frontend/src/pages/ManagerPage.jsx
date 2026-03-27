import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import client from "../api/client";

function ManagerPage() {
  const { user, logout } = useAuth();
  const [health, setHealth] = useState("");
  const [roomTypes, setRoomTypes] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [typeForm, setTypeForm] = useState({ name: "", basePrice: "", maxGuests: "", description: "" });
  const [roomForm, setRoomForm] = useState({ code: "", floorNumber: "", roomTypeId: "", status: "AVAILABLE" });
  const [error, setError] = useState("");
  const [dashboard, setDashboard] = useState(null);

  useEffect(() => {
    loadManagerData();
  }, []);

  const loadManagerData = async () => {
    try {
      const [healthRes, typesRes, roomsRes] = await Promise.all([
        client.get("/manager/health"),
        client.get("/manager/room-types"),
        client.get("/manager/rooms")
      ]);
      const dashboardRes = await client.get("/manager/dashboard");
      setHealth(healthRes.data.message);
      setRoomTypes(typesRes.data);
      setRooms(roomsRes.data);
      setDashboard(dashboardRes.data);
    } catch {
      setHealth("Khong truy cap duoc API manager");
    }
  };

  const createRoomType = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await client.post("/manager/room-types", {
        ...typeForm,
        basePrice: Number(typeForm.basePrice),
        maxGuests: Number(typeForm.maxGuests)
      });
      setTypeForm({ name: "", basePrice: "", maxGuests: "", description: "" });
      await loadManagerData();
    } catch (err) {
      setError(err.response?.data?.message || "Khong tao duoc loai phong");
    }
  };

  const createRoom = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await client.post("/manager/rooms", {
        ...roomForm,
        floorNumber: Number(roomForm.floorNumber),
        roomTypeId: Number(roomForm.roomTypeId)
      });
      setRoomForm({ code: "", floorNumber: "", roomTypeId: "", status: "AVAILABLE" });
      await loadManagerData();
    } catch (err) {
      setError(err.response?.data?.message || "Khong tao duoc phong");
    }
  };

  return (
    <main className="panel">
      <h1>Manager Dashboard (Milestone 5)</h1>
      <p>Xin chao {user.fullName}</p>
      <p>API status: {health}</p>
      {error && <p className="error">{error}</p>}
      {dashboard && (
        <div>
          <p>Tong phong: {dashboard.totalRooms}</p>
          <p>Phong san sang: {dashboard.availableRooms}</p>
          <p>Booking thanh cong: {dashboard.confirmedBookings}</p>
          <p>Doanh thu: {Number(dashboard.revenue).toLocaleString("vi-VN")} VND</p>
          <p>Diem danh gia TB: {Number(dashboard.avgRating).toFixed(2)}</p>
        </div>
      )}

      <h3>Tao loai phong</h3>
      <form className="auth-form" onSubmit={createRoomType}>
        <input
          value={typeForm.name}
          onChange={(e) => setTypeForm({ ...typeForm, name: e.target.value })}
          placeholder="Ten loai phong"
          required
        />
        <input
          type="number"
          value={typeForm.basePrice}
          onChange={(e) => setTypeForm({ ...typeForm, basePrice: e.target.value })}
          placeholder="Gia co ban"
          required
        />
        <input
          type="number"
          value={typeForm.maxGuests}
          onChange={(e) => setTypeForm({ ...typeForm, maxGuests: e.target.value })}
          placeholder="So khach toi da"
          required
        />
        <input
          value={typeForm.description}
          onChange={(e) => setTypeForm({ ...typeForm, description: e.target.value })}
          placeholder="Mo ta ngan"
        />
        <button type="submit">Them loai phong</button>
      </form>

      <h3>Tao phong</h3>
      <form className="auth-form" onSubmit={createRoom}>
        <input
          value={roomForm.code}
          onChange={(e) => setRoomForm({ ...roomForm, code: e.target.value })}
          placeholder="Ma phong (VD: D401)"
          required
        />
        <input
          type="number"
          value={roomForm.floorNumber}
          onChange={(e) => setRoomForm({ ...roomForm, floorNumber: e.target.value })}
          placeholder="Tang"
          required
        />
        <select
          value={roomForm.roomTypeId}
          onChange={(e) => setRoomForm({ ...roomForm, roomTypeId: e.target.value })}
          required
        >
          <option value="">Chon loai phong</option>
          {roomTypes.map((type) => (
            <option key={type.id} value={type.id}>
              {type.name}
            </option>
          ))}
        </select>
        <select value={roomForm.status} onChange={(e) => setRoomForm({ ...roomForm, status: e.target.value })}>
          <option value="AVAILABLE">AVAILABLE</option>
          <option value="MAINTENANCE">MAINTENANCE</option>
        </select>
        <button type="submit">Them phong</button>
      </form>

      <h3>Danh sach loai phong</h3>
      {roomTypes.map((type) => (
        <p key={type.id}>
          {type.name} - {Number(type.basePrice).toLocaleString("vi-VN")} VND - toi da {type.maxGuests} khach
        </p>
      ))}

      <h3>Danh sach phong</h3>
      {rooms.map((room) => (
        <p key={room.id}>
          {room.code} - {room.roomTypeName} - tang {room.floorNumber} - {room.status}
        </p>
      ))}
      <button onClick={logout}>Dang xuat</button>
    </main>
  );
}

export default ManagerPage;
