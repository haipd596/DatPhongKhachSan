import { useState, useEffect } from "react";
import client from "../../api/client";
import { format } from "date-fns";

export default function PaymentHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client.get("/payments/history")
      .then(res => setHistory(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="center-text">Đang tải...</div>;

  return (
    <div className="payment-history-page">
      <h2 className="page-title">Lịch Sử Giao Dịch</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Ngày GD</th>
              <th>Mã GD</th>
              <th>Phòng</th>
              <th>Số tiền (VNĐ)</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {history.map(tx => (
              <tr key={tx.id}>
                <td>{format(new Date(tx.createdAt), "dd/MM/yyyy HH:mm")}</td>
                <td><code style={{ fontSize: '0.8rem', color: 'var(--primary-dark)' }}>{tx.transactionCode}</code></td>
                <td>{tx.roomTypeName} ({tx.roomCode})</td>
                <td style={{ fontWeight: 600 }}>{new Intl.NumberFormat('vi-VN').format(tx.amount)}</td>
                <td>
                  <span className={`badge badge-${tx.status === 'SUCCESS' ? 'CONFIRMED' : tx.status === 'REFUNDED' ? 'CANCELLED' : tx.status}`}>{tx.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {history.length === 0 && (
          <div className="center-text text-muted" style={{ padding: 30 }}>Không có lịch sử giao dịch</div>
        )}
      </div>
    </div>
  );
}
