import { useState, useEffect } from "react";
import client from "../../api/client";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client.get("/manager/dashboard")
      .then(res => setData(res.data))
      .catch((e) => console.log(e))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Đang tải thống kê...</div>;
  if (!data) return <div>Lỗi tải thống kê</div>;

  // Max revenue for bar chart scaling
  const maxRevenue = Math.max(...data.revenueByMonth.map(m => m.revenue));

  return (
    <div className="dashboard">
      <div className="grid-4" style={{ marginBottom: 32 }}>
        <div className="stat-card">
          <h3 className="stat-title">Doanh Thu</h3>
          <p className="stat-value">{new Intl.NumberFormat('vi-VN').format(data.totalRevenue)}đ</p>
        </div>
        <div className="stat-card">
          <h3 className="stat-title">Booking Thành Công</h3>
          <p className="stat-value">{data.confirmedBookings}</p>
        </div>
        <div className="stat-card">
          <h3 className="stat-title">Phòng Trống</h3>
          <p className="stat-value">{data.availableRooms} / {data.totalRooms}</p>
        </div>
        <div className="stat-card">
          <h3 className="stat-title">Đánh giá chung</h3>
          <p className="stat-value" style={{ color: 'var(--accent)' }}>{data.avgRating.toFixed(1)} ★</p>
        </div>
      </div>

      <div className="grid-2">
        <div className="glass-card" style={{ padding: 24 }}>
          <h3 style={{ marginBottom: 16 }}>Doanh thu theo tháng ({new Date().getFullYear()})</h3>
          <div style={{ display: 'flex', alignItems: 'flex-end', height: 200, gap: 8 }}>
            {data.revenueByMonth.map(m => {
              const heightPct = maxRevenue > 0 ? (m.revenue / maxRevenue) * 100 : 0;
              return (
                <div key={m.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: '100%', borderTopLeftRadius: 4, borderTopRightRadius: 4, background: 'var(--primary)', height: `${heightPct}%`, minHeight: 4, transition: 'height 0.3s' }} title={`${new Intl.NumberFormat('vi-VN').format(m.revenue)}đ`}></div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>T{m.month}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="glass-card" style={{ padding: 24 }}>
          <h3 style={{ marginBottom: 16 }}>Trạng thái Đặt Phòng</h3>
          <div className="stack" style={{ gap: 12 }}>
            {Object.entries(data.bookingsByStatus).map(([status, count]) => {
              const total = Object.values(data.bookingsByStatus).reduce((a, b) => a + b, 0);
              const pct = total > 0 ? (count / total) * 100 : 0;
              return (
                <div key={status}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: '0.85rem' }}>
                    <span className="text-muted">{status}</span>
                    <strong>{count}</strong>
                  </div>
                  <div style={{ width: '100%', height: 8, background: 'var(--border)', borderRadius: 4 }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: 'var(--primary)', borderRadius: 4 }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
