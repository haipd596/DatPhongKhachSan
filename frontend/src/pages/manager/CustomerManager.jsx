import { useState, useEffect } from "react";
import client from "../../api/client";

export default function CustomerManager() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client.get("/manager/customers")
      .then((res) => setCustomers(Array.isArray(res.data) ? res.data : res.data.content || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="customer-manager">
      <h2 className="page-title">Khách hàng thân thiết</h2>

      {loading ? <div className="loading-state card">Đang tải danh sách khách hàng...</div> : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Họ và tên</th>
                <th>Email</th>
                <th>Hạng thành viên</th>
                <th>Số lần đặt</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id}>
                  <td><strong>{customer.fullName}</strong></td>
                  <td className="text-muted">{customer.email}</td>
                  <td><span className="vip-badge">{customer.vipLevel}</span></td>
                  <td><strong>{customer.bookingCount}</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
          {customers.length === 0 && <div className="empty-state">Chưa có khách hàng nào.</div>}
        </div>
      )}
    </div>
  );
}
