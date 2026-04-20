import { useState, useEffect } from "react";
import client from "../../api/client";

export default function CustomerManager() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client.get("/manager/customers")
      .then(res => setCustomers(res.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="customer-manager">
      <h2 className="page-title">Khách Hàng Thân Thiết</h2>
      
      {loading ? <p>Đang tải...</p> : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Họ và Tên</th>
                <th>Email</th>
                <th>Hạng Thành Viên</th>
                <th>Số lần Book</th>
              </tr>
            </thead>
            <tbody>
              {customers.map(c => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 600 }}>{c.fullName}</td>
                  <td className="text-muted">{c.email}</td>
                  <td><span className="vip-badge" style={{ marginLeft: 0 }}>{c.vipLevel}</span></td>
                  <td><strong>{c.bookingCount}</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
