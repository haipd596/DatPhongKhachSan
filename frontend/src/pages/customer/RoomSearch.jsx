import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import client from "../../api/client";
import { format } from "date-fns";

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
    client.get("/rooms/types").then(res => setRoomTypes(res.data));
    handleSearch(); // autosearch on mount
  }, []); // eslint-disable-line

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const q = new URLSearchParams();
      Object.keys(params).forEach(k => {
        if (params[k]) q.append(k, params[k]);
      });
      const res = await client.get(`/rooms?${q.toString()}`);
      // Group by roomType to show beautiful cards rather than flat list
      const grouped = res.data.reduce((acc, room) => {
        if (!acc[room.roomTypeId]) {
          acc[room.roomTypeId] = {
            ...room, // has roomTypeName, basePrice, imageUrl, maxGuests
            availableRooms: []
          };
        }
        acc[room.roomTypeId].availableRooms.push(room);
        return acc;
      }, {});
      setRooms(Object.values(grouped));
    } catch (err) {
      setError("Lỗi tải danh sách phòng");
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
      setError(err.response?.data?.message || "Lỗi giữ phòng");
    } finally {
      setHolding(null);
    }
  };

  return (
    <div className="room-search-page">
      <h2 className="page-title">Tìm Phòng Trống</h2>
      
      <div className="glass-card" style={{ padding: 24, marginBottom: 32 }}>
        <form onSubmit={handleSearch} className="grid-3" style={{ gap: 16 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Check In</label>
            <input type="date" className="form-control" value={params.checkIn} onChange={e => setParams({...params, checkIn: e.target.value})} required />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Check Out</label>
            <input type="date" className="form-control" value={params.checkOut} onChange={e => setParams({...params, checkOut: e.target.value})} required />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Loại phòng</label>
            <select className="form-control" value={params.roomTypeId} onChange={e => setParams({...params, roomTypeId: e.target.value})}>
              <option value="">Tất cả</option>
              {roomTypes.map(rt => <option key={rt.id} value={rt.id}>{rt.name}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Giá từ (VNĐ)</label>
            <input type="number" className="form-control" placeholder="0" value={params.minPrice} onChange={e => setParams({...params, minPrice: e.target.value})} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Giá đến (VNĐ)</label>
            <input type="number" className="form-control" placeholder="Vô hạn" value={params.maxPrice} onChange={e => setParams({...params, maxPrice: e.target.value})} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Khách tối thiểu</label>
            <input type="number" className="form-control" placeholder="1" value={params.maxGuests} onChange={e => setParams({...params, maxGuests: e.target.value})} />
          </div>
          <div className="form-group" style={{ gridColumn: '1 / -1', marginTop: 8 }}>
            <button type="submit" className="btn full-width" disabled={loading}>
              {loading ? "Đang tìm kiếm..." : "Tìm Kiếm"}
            </button>
          </div>
        </form>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="results-grid grid-2">
        {rooms.map(type => (
          <div key={type.roomTypeId} className="glass-card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ height: 200, background: '#e2e8f0', backgroundImage: `url(${type.imageUrl || 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800&q=80'})`, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
            <div style={{ padding: 24, display: 'flex', flexDirection: 'column', flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <h3 style={{ fontSize: '1.25rem', color: 'var(--primary-dark)', margin: 0 }}>{type.roomTypeName}</h3>
                <span className="badge badge-CONFIRMED">Còn {type.availableRooms.length} phòng</span>
              </div>
              <p className="text-muted" style={{ fontSize: '0.9rem', marginBottom: 24 }}>Tối đa {type.maxGuests} khách • {new Intl.NumberFormat('vi-VN').format(type.basePrice)} VNĐ/đêm</p>
              
              <div style={{ marginTop: 'auto' }}>
                <button 
                  className="btn full-width"
                  disabled={holding === type.availableRooms[0].id}
                  onClick={() => handleHoldRoom(type.availableRooms[0].id)}
                >
                  {holding === type.availableRooms[0].id ? "Đang giữ..." : `Đặt phòng (Chọn ${type.availableRooms[0].code})`}
                </button>
              </div>
            </div>
          </div>
        ))}
        {rooms.length === 0 && !loading && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
            Không tìm thấy phòng trống phù hợp với tiêu chí của bạn.
          </div>
        )}
      </div>
    </div>
  );
}
