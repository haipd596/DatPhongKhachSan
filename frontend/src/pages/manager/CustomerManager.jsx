import { useState, useEffect } from "react";
import client from "../../api/client";

export default function CustomerManager() {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    client.get("/manager/customers")
      .then((res) => setCustomers(Array.isArray(res.data) ? res.data : res.data.content || []))
      .finally(() => setLoading(false));
  }, []);

  const openDetail = async (customer) => {
    setSelectedCustomer(customer);
    setDetailLoading(true);
    setError("");
    try {
      const res = await client.get(`/manager/customers/${customer.id}`);
      setSelectedCustomer(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Không tải được chi tiết khách hàng");
    } finally {
      setDetailLoading(false);
    }
  };

  const formatDate = (value) => value ? new Date(value).toLocaleDateString("vi-VN") : "Chưa cập nhật";
  const shortText = (value) => value || "Chưa cập nhật";

  return (
    <div className="customer-manager">
      <h2 className="page-title">Khách hàng thân thiết</h2>
      {error && <div className="alert alert-error">{error}</div>}

      {loading ? <div className="loading-state card">Đang tải danh sách khách hàng...</div> : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Họ và tên</th>
                <th>Email</th>
                <th>Số điện thoại</th>
                <th>Giới tính</th>
                <th>Hạng thành viên</th>
                <th>Số lần đặt</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id}>
                  <td><strong>{customer.fullName}</strong></td>
                  <td className="text-muted">{customer.email}</td>
                  <td>{shortText(customer.phone)}</td>
                  <td>{shortText(customer.gender)}</td>
                  <td><span className="vip-badge">{customer.vipLevel}</span></td>
                  <td><strong>{customer.bookingCount}</strong></td>
                  <td>
                    <button className="btn btn-sm btn-outline" onClick={() => openDetail(customer)}>
                      Xem chi tiết
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {customers.length === 0 && <div className="empty-state">Chưa có khách hàng nào.</div>}
        </div>
      )}

      {selectedCustomer && (
        <div className="modal-overlay" onClick={() => setSelectedCustomer(null)}>
          <div className="modal-box customer-detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Chi tiết khách hàng</h3>
              <button className="modal-close" onClick={() => setSelectedCustomer(null)}>x</button>
            </div>
            <div className="modal-body">
              {detailLoading ? (
                <div className="loading-state">Đang tải chi tiết...</div>
              ) : (
                <>
                  <div className="customer-detail-head">
                    <div className="profile-avatar">
                      {selectedCustomer.avatarUrl
                        ? <img src={selectedCustomer.avatarUrl} alt={selectedCustomer.fullName} />
                        : <span>{(selectedCustomer.fullName || "K").charAt(0).toUpperCase()}</span>}
                    </div>
                    <div>
                      <h3>{selectedCustomer.fullName}</h3>
                      <p className="text-muted">{selectedCustomer.email}</p>
                      <span className="vip-badge">{selectedCustomer.vipLevel}</span>
                    </div>
                  </div>

                  <div className="customer-detail-grid">
                    <div>
                      <span>Số điện thoại</span>
                      <strong>{shortText(selectedCustomer.phone)}</strong>
                    </div>
                    <div>
                      <span>Giới tính</span>
                      <strong>{shortText(selectedCustomer.gender)}</strong>
                    </div>
                    <div>
                      <span>Ngày sinh</span>
                      <strong>{formatDate(selectedCustomer.dateOfBirth)}</strong>
                    </div>
                    <div>
                      <span>Số lần đặt phòng</span>
                      <strong>{selectedCustomer.bookingCount}</strong>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
