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
      .then((res) => setBookings(Array.isArray(res.data) ? res.data : res.data.content || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBookings();
  }, [filters.status, filters.checkIn]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCheckIn = async (id) => {
    try {
      await client.post(`/manager/bookings/${id}/check-in`);
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.message || "Không thể check-in");
    }
  };

  const handleCheckOut = async (id) => {
    try {
      await client.post(`/manager/bookings/${id}/check-out`);
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.message || "Không thể check-out");
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchBookings();
  };

  return (
    <div className="booking-manager">
      <h2 className="page-title">Quản lý đặt phòng</h2>

      <div className="card" style={{ marginBottom: 24 }}>
        <form onSubmit={handleSearchSubmit} className="grid-4">
          <div className="form-group">
            <label className="form-label">Email khách hàng</label>
            <input type="text" className="form-control" placeholder="Tìm theo email" value={filters.email} onChange={(e) => setFilters({ ...filters, email: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Trạng thái</label>
            <select className="form-control" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
              <option value="">Tất cả</option>
              <option value="HOLD">HOLD</option>
              <option value="CONFIRMED">CONFIRMED</option>
              <option value="CHECKED_IN">CHECKED_IN</option>
              <option value="CHECKED_OUT">CHECKED_OUT</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Từ ngày nhận phòng</label>
            <input type="date" className="form-control" value={filters.checkIn} onChange={(e) => setFilters({ ...filters, checkIn: e.target.value })} />
          </div>
          <div className="form-group" style={{ alignSelf: "end" }}>
            <button type="submit" className="btn full-width">Tìm kiếm</button>
          </div>
        </form>
      </div>

      {loading ? <div className="loading-state card">Đang tải danh sách đặt phòng...</div> : (
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
              {bookings.map((booking) => (
                <tr key={booking.id}>
                  <td>#{booking.id}</td>
                  <td>
                    <strong>{booking.customerName}</strong>
                    <div className="text-muted" style={{ fontSize: "0.84rem" }}>{booking.customerEmail}</div>
                  </td>
                  <td>{booking.roomCode} ({booking.roomTypeName})</td>
                  <td>{format(new Date(booking.checkInDate), "dd/MM")} - {format(new Date(booking.checkOutDate), "dd/MM/yyyy")}</td>
                  <td><span className={`badge badge-${booking.status}`}>{booking.status}</span></td>
                  <td>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {booking.status === "CONFIRMED" && (
                        <button className="btn btn-sm" onClick={() => handleCheckIn(booking.id)}>Check-in</button>
                      )}
                      {booking.status === "CHECKED_IN" && (
                        <button className="btn btn-outline btn-sm" onClick={() => handleCheckOut(booking.id)}>Check-out</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {bookings.length === 0 && <div className="empty-state">Không có đặt phòng phù hợp.</div>}
        </div>
      )}
    </div>
  );
}
