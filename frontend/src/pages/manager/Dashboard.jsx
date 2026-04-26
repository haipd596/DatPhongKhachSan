import { useState, useEffect } from "react";
import client from "../../api/client";

const currency = new Intl.NumberFormat("vi-VN");

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client.get("/manager/dashboard")
      .then((res) => setData(res.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-state card">Đang tải thống kê...</div>;
  if (!data) return <div className="alert alert-error">Không tải được dữ liệu thống kê.</div>;

  const revenueByMonth = data.revenueByMonth || [];
  const maxRevenue = Math.max(...revenueByMonth.map((m) => m.revenue), 0);
  const bookingsByStatus = data.bookingsByStatus || {};
  const bookingTotal = Object.values(bookingsByStatus).reduce((sum, value) => sum + value, 0);

  return (
    <div className="dashboard">
      <h2 className="page-title">Tổng quan vận hành</h2>

      <div className="grid-4" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <h3 className="stat-title">Doanh thu</h3>
          <p className="stat-value">{currency.format(data.totalRevenue)} VNĐ</p>
        </div>
        <div className="stat-card">
          <h3 className="stat-title">Booking thành công</h3>
          <p className="stat-value">{data.confirmedBookings}</p>
        </div>
        <div className="stat-card">
          <h3 className="stat-title">Phòng trống</h3>
          <p className="stat-value">{data.availableRooms} / {data.totalRooms}</p>
        </div>
        <div className="stat-card">
          <h3 className="stat-title">Đánh giá trung bình</h3>
          <p className="stat-value">{Number(data.avgRating || 0).toFixed(1)} / 5</p>
        </div>
      </div>

      <div className="grid-2">
        <section className="card">
          <h3 className="section-title">Doanh thu theo tháng ({new Date().getFullYear()})</h3>
          <div className="chart-bars">
            {revenueByMonth.map((month) => {
              const heightPct = maxRevenue > 0 ? (month.revenue / maxRevenue) * 100 : 0;
              return (
                <div className="chart-bar-item" key={month.month} title={`${currency.format(month.revenue)} VNĐ`}>
                  <div className="chart-bar" style={{ height: `${heightPct}%` }} />
                  <span className="text-muted">T{month.month}</span>
                </div>
              );
            })}
          </div>
        </section>

        <section className="card">
          <h3 className="section-title">Trạng thái đặt phòng</h3>
          {Object.entries(bookingsByStatus).map(([status, count]) => {
            const pct = bookingTotal > 0 ? (count / bookingTotal) * 100 : 0;
            return (
              <div className="progress-row" key={status}>
                <div className="progress-head">
                  <span className="text-muted">{status}</span>
                  <strong>{count}</strong>
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
          {bookingTotal === 0 && <div className="empty-state">Chưa có dữ liệu đặt phòng.</div>}
        </section>
      </div>
    </div>
  );
}
