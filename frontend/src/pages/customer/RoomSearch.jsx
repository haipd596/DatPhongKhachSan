import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import client from "../../api/client";
import { format } from "date-fns";

const currency = new Intl.NumberFormat("vi-VN");

export default function RoomSearch() {
  const navigate = useNavigate();
  const [params, setParams] = useState({
    checkIn: format(new Date(), "yyyy-MM-dd"),
    checkOut: format(new Date(Date.now() + 86400000), "yyyy-MM-dd"),
    roomTypeId: "",
    minPrice: "",
    maxPrice: "",
    maxGuests: ""
  });

  const [roomTypes, setRoomTypes] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [holding, setHolding] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    client.get("/rooms/types").then((res) => setRoomTypes(res.data)).catch(() => setRoomTypes([]));
    handleSearch();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const q = new URLSearchParams();
      Object.keys(params).forEach((key) => {
        if (params[key]) q.append(key, params[key]);
      });
      const res = await client.get(`/rooms?${q.toString()}`);
      const grouped = res.data.reduce((acc, room) => {
        if (!acc[room.roomTypeId]) {
          acc[room.roomTypeId] = { ...room, availableRooms: [] };
        }
        acc[room.roomTypeId].availableRooms.push(room);
        return acc;
      }, {});
      setRooms(Object.values(grouped));
    } catch (err) {
      setError("Không tải được danh sách phòng. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleHoldRoom = async (roomId) => {
    setHolding(roomId);
    setError("");
    try {
      await client.post("/bookings/hold", {
        roomId,
        checkInDate: params.checkIn,
        checkOutDate: params.checkOut
      });
      navigate("/customer/bookings");
    } catch (err) {
      setError(err.response?.data?.message || "Không giữ được phòng đã chọn");
    } finally {
      setHolding(null);
    }
  };

  return (
    <div className="room-search-page">
      <h2 className="page-title">Tìm phòng trống</h2>

      <div className="card" style={{ marginBottom: 24 }}>
        <form onSubmit={handleSearch} className="grid-3">
          <div className="form-group">
            <label className="form-label">Ngày nhận phòng</label>
            <input type="date" className="form-control" value={params.checkIn} onChange={(e) => setParams({ ...params, checkIn: e.target.value })} required />
          </div>
          <div className="form-group">
            <label className="form-label">Ngày trả phòng</label>
            <input type="date" className="form-control" value={params.checkOut} onChange={(e) => setParams({ ...params, checkOut: e.target.value })} required />
          </div>
          <div className="form-group">
            <label className="form-label">Loại phòng</label>
            <select className="form-control" value={params.roomTypeId} onChange={(e) => setParams({ ...params, roomTypeId: e.target.value })}>
              <option value="">Tất cả loại phòng</option>
              {roomTypes.map((rt) => <option key={rt.id} value={rt.id}>{rt.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Giá từ (VNĐ)</label>
            <input type="number" className="form-control" placeholder="0" value={params.minPrice} onChange={(e) => setParams({ ...params, minPrice: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Giá đến (VNĐ)</label>
            <input type="number" className="form-control" placeholder="Không giới hạn" value={params.maxPrice} onChange={(e) => setParams({ ...params, maxPrice: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Số khách</label>
            <input type="number" className="form-control" placeholder="1" value={params.maxGuests} onChange={(e) => setParams({ ...params, maxGuests: e.target.value })} />
          </div>
          <button type="submit" className="btn full-width" disabled={loading} style={{ gridColumn: "1 / -1" }}>
            {loading ? "Đang tìm kiếm..." : "Tìm kiếm phòng"}
          </button>
        </form>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="results-grid grid-2">
        {rooms.map((type) => {
          const firstRoom = type.availableRooms[0];
          return (
            <article key={type.roomTypeId} className="room-card card">
              <div
                className="room-card-image"
                style={{ backgroundImage: `url(${type.imageUrl || "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=900&q=80"})` }}
              />
              <div className="room-card-body">
                <div className="room-card-head">
                  <div>
                    <h3 style={{ marginBottom: 6 }}>{type.roomTypeName}</h3>
                    <p className="text-muted" style={{ marginBottom: 0 }}>
                      Tối đa {type.maxGuests} khách · {currency.format(type.basePrice)} VNĐ/đêm
                    </p>
                  </div>
                  <span className="badge badge-AVAILABLE">Còn {type.availableRooms.length} phòng</span>
                </div>
                <button
                  className="btn full-width"
                  disabled={holding === firstRoom.id}
                  onClick={() => handleHoldRoom(firstRoom.id)}
                  style={{ marginTop: 22 }}
                >
                  {holding === firstRoom.id ? "Đang giữ phòng..." : `Giữ phòng ${firstRoom.code}`}
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {rooms.length === 0 && !loading && (
        <div className="empty-state card">Không tìm thấy phòng trống phù hợp với tiêu chí của bạn.</div>
      )}
    </div>
  );
}
