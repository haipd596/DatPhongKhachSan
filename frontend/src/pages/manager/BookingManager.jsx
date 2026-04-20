import { useState, useEffect } from "react";
import client from "../../api/client";
import { format } from "date-fns";

export default function BookingManager() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: "", checkIn: "", email: "" });

  const fetchBookings = () => {
    setLoading(true);
    const q = new URLSearchParams();
    if (filters.status) q.append("status", filters.status);
    if (filters.checkIn) q.append("checkIn", filters.checkIn);
    if (filters.email) q.append("email", filters.email);

    client.get(`/manager/bookings?${q.toString()}`)
      .then(res => setBookings(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBookings();
  }, [filters.status, filters.checkIn]); // fetch tu dong khi select status hoac date

  const handleCheckIn = async (id) => {
    try {
      await client.post(`/manager/bookings/${id}/check-in`);
      fetchBookings();
    } catch (err) { alert(err.response?.data?.message); }
  }

  const handleCheckOut = async (id) => {
    try {
      await client.post(`/manager/bookings/${id}/check-out`);
      fetchBookings();
    } catch (err) { alert(err.response?.data?.message); }
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchBookings();
  };

  return (
    <div className="booking-manager">
      <h2 className="page-title">Quản lý Đặt phòng</h2>

      <div className="glass-card" style={{ padding: 20, marginBottom: 24 }}>
        <form onSubmit={handleSearchSubmit} className="grid-4" style={{ gap: 12, alignItems: 'end' }}>
          <div>
            <label className="form-label">Email Khách</label>
            <input type="text" className="form-control" placeholder="Tìm theo email" value={filters.email} onChange={e => setFilters({...filters, email: e.target.value})} />
          </div>
          <div>
            <label className="form-label">Trạng thái</label>
            <select className="form-control" value={filters.status} onChange={e => setFilters({...filters, status: e.target.value})}>
              <option value="">Tất cả</option>
              <option value="HOLD">HOLD</option>
              <option value="CONFIRMED">CONFIRMED</option>
              <option value="CHECKED_IN">CHECKED_IN</option>
            </select>
          </div>
          <div>
            <label className="form-label">Sau ngày Check In</label>
            <input type="date" className="form-control" value={filters.checkIn} onChange={e => setFilters({...filters, checkIn: e.target.value})} />
          </div>
          <div>
            <button type="submit" className="btn full-width">Tìm Kiếm</button>
          </div>
        </form>
      </div>

      {loading ? <p>Đang tải...</p> : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Mã</th>
                <th>Khách hàng</th>
                <th>Phòng</th>
                <th>Thời gian</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map(b => (
                <tr key={b.id}>
                  <td>#{b.id}</td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{b.customerName}</div>
                    <div className="text-muted" style={{ fontSize: '0.8rem' }}>{b.customerEmail}</div>
                  </td>
                  <td>{b.roomCode} ({b.roomTypeName})</td>
                  <td style={{ fontSize: '0.85rem' }}>
                    {format(new Date(b.checkInDate), "dd/MM")} - {format(new Date(b.checkOutDate), "dd/MM/yyyy")}
                  </td>
                  <td><span className={`badge badge-${b.status}`}>{b.status}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {b.status === 'CONFIRMED' && (
                        <button className="btn" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => handleCheckIn(b.id)}>Check-In</button>
                      )}
                      {b.status === 'CHECKED_IN' && (
                        <button className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => handleCheckOut(b.id)}>Check-Out</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
