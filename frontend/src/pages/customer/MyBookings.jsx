import { useState, useEffect } from "react";
import client from "../../api/client";
import { format } from "date-fns";

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  const fetchBookings = () => {
    setLoading(true);
    client.get("/bookings/me")
      .then(res => setBookings(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleVNPay = async (bookingId) => {
    setProcessingId(bookingId);
    try {
      const res = await client.post("/payments/vnpay/create", { bookingId });
      window.location.href = res.data.paymentUrl;
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi tạo thanh toán");
      setProcessingId(null);
    }
  };

  const handleCancel = async (bookingId) => {
    if (!window.confirm("Bạn có chắc chắn muốn hủy đặt phòng này? Chính sách hoàn tiền sẽ áp dụng.")) return;
    setProcessingId(bookingId);
    try {
      await client.post(`/bookings/${bookingId}/cancel`);
      alert("Hủy đặt phòng thành công");
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi hủy đặt phòng");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReviewClick = (bookingId) => {
    // Basic implementation for review popup (mocked logic or redirect)
    const rating = prompt("Đánh giá số sao (1-5):", "5");
    if (!rating) return;
    const comment = prompt("Lời nhận xét:", "Rất tuyệt!");
    if (!comment) return;
    
    client.post("/reviews", { rating: parseInt(rating), comment })
      .then(() => alert("Cảm ơn đánh giá của bạn!"))
      .catch(err => alert(err.response?.data?.message || "Lỗi đăng đánh giá"));
  };

  if (loading) return <div className="center-text">Đang tải...</div>;

  return (
    <div className="bookings-page">
      <h2 className="page-title">Booking của tôi</h2>

      <div className="stack" style={{ gap: 24 }}>
        {bookings.map(b => (
          <div key={b.id} className="glass-card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', marginBottom: 4, color: 'var(--primary-dark)' }}>{b.roomTypeName} (Phòng {b.roomCode})</h3>
                <p className="text-muted" style={{ fontSize: '0.9rem' }}>Mã Booking: #{b.id} • Đặt ngày: {format(new Date(b.createdAt), "dd/MM/yyyy")}</p>
              </div>
              <span className={`badge badge-${b.status}`}>{b.status}</span>
            </div>

            <div className="grid-3" style={{ marginBottom: 20, gap: 16 }}>
              <div>
                <p className="text-muted" style={{ fontSize: '0.85rem' }}>Check In</p>
                <p style={{ fontWeight: 600 }}>{format(new Date(b.checkInDate), "dd/MM/yyyy")}</p>
              </div>
              <div>
                <p className="text-muted" style={{ fontSize: '0.85rem' }}>Check Out</p>
                <p style={{ fontWeight: 600 }}>{format(new Date(b.checkOutDate), "dd/MM/yyyy")}</p>
              </div>
              <div>
                <p className="text-muted" style={{ fontSize: '0.85rem' }}>Tổng tiền</p>
                <p style={{ fontWeight: 700, color: 'var(--text-main)' }}>{new Intl.NumberFormat('vi-VN').format(b.totalAmount)} VNĐ</p>
              </div>
            </div>

            {b.status === "CANCELLED" && b.refundAmount > 0 && (
              <div className="alert alert-success" style={{ marginBottom: 20 }}>
                <strong>Hoàn tiền:</strong> {new Intl.NumberFormat('vi-VN').format(b.refundAmount)} VNĐ đã được ghi nhận.
              </div>
            )}

            <div className="actions" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {b.status === "HOLD" && (
                <>
                  <button 
                    className="btn" 
                    disabled={processingId === b.id} 
                    onClick={() => handleVNPay(b.id)}
                  >
                    Thanh Toán VNPay
                  </button>
                  <button 
                    className="btn btn-outline btn-danger" 
                    disabled={processingId === b.id} 
                    onClick={() => handleCancel(b.id)}
                  >
                    Hủy Đặt
                  </button>
                </>
              )}
              {b.status === "CONFIRMED" && (
                <button 
                  className="btn btn-outline btn-danger" 
                  disabled={processingId === b.id} 
                  onClick={() => handleCancel(b.id)}
                >
                  Hủy (Có tính phí)
                </button>
              )}
              {b.status === "CHECKED_OUT" && (
                <button 
                  className="btn btn-outline" 
                  onClick={() => handleReviewClick(b.id)}
                >
                  Đánh giá dịch vụ
                </button>
              )}
            </div>
          </div>
        ))}
        {bookings.length === 0 && (
          <div className="center-text text-muted" style={{ padding: 40 }}>Bạn chưa có ghi nhận đặt phòng nào.</div>
        )}
      </div>
    </div>
  );
}
