import { useState, useEffect } from "react";
import client from "../../api/client";
import { format } from "date-fns";

const currency = new Intl.NumberFormat("vi-VN");

export default function PaymentHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client.get("/payments/history")
      .then((res) => setHistory(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-state card">Đang tải lịch sử giao dịch...</div>;

  return (
    <div className="payment-history-page">
      <h2 className="page-title">Lịch sử thanh toán</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Ngày giao dịch</th>
              <th>Mã giao dịch</th>
              <th>Phòng</th>
              <th>Số tiền</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {history.map((tx) => (
              <tr key={tx.id}>
                <td>{format(new Date(tx.createdAt), "dd/MM/yyyy HH:mm")}</td>
                <td><code>{tx.transactionCode}</code></td>
                <td>{tx.roomTypeName} ({tx.roomCode})</td>
                <td><strong>{currency.format(tx.amount)} VNĐ</strong></td>
                <td>
                  <span className={`badge badge-${tx.status}`}>{tx.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {history.length === 0 && (
          <div className="empty-state">Chưa có lịch sử giao dịch.</div>
        )}
      </div>
    </div>
  );
}
