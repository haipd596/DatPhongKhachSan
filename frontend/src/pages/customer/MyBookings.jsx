import { useState, useEffect } from "react";
import client from "../../api/client";
import { format } from "date-fns";

const currency = new Intl.NumberFormat("vi-VN");

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  const fetchBookings = () => {
    setLoading(true);
    client.get("/bookings/me")
      .then((res) => setBookings(res.data))
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
      alert(err.response?.data?.message || "Không tạo được giao dịch thanh toán");
      setProcessingId(null);
    }
  };

  const handleCancel = async (bookingId) => {
    if (!window.confirm("Bạn có chắc chắn muốn hủy đặt phòng này? Chính sách hoàn tiền sẽ được áp dụng.")) return;
    setProcessingId(bookingId);
    try {
      await client.post(`/bookings/${bookingId}/cancel`);
      alert("Hủy đặt phòng thành công");
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.message || "Không hủy được đặt phòng");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReviewClick = (bookingId) => {
    const rating = prompt("Đánh giá số sao (1-5):", "5");
    if (!rating) return;
    const comment = prompt("Nhận xét của bạn:", "Dịch vụ tốt, phòng sạch sẽ.");
    if (!comment) return;

    client.post("/reviews", { bookingId, rating: parseInt(rating, 10), comment })
      .then(() => alert("Cảm ơn đánh giá của bạn"))
      .catch((err) => alert(err.response?.data?.message || "Không gửi được đánh giá"));
  };

  if (loading) return <div className="loading-state card">Đang tải danh sách đặt phòng...</div>;

  return (
    <div className="bookings-page">
      <h2 className="page-title">Đặt phòng của tôi</h2>

      <div className="stack">
        {bookings.map((booking) => (
          <article key={booking.id} className="booking-card card">
            <div className="booking-card-head">
              <div>
                <h3 style={{ marginBottom: 4 }}>{booking.roomTypeName} - Phòng {booking.roomCode}</h3>
                <p className="text-muted" style={{ marginBottom: 0 }}>
                  Mã đặt phòng #{booking.id} · Ngày tạo {format(new Date(booking.createdAt), "dd/MM/yyyy")}
                </p>
              </div>
              <span className={`badge badge-${booking.status}`}>{booking.status}</span>
            </div>

            <div className="grid-3" style={{ marginTop: 20 }}>
              <div>
                <p className="text-muted" style={{ marginBottom: 4 }}>Ngày nhận phòng</p>
                <strong>{format(new Date(booking.checkInDate), "dd/MM/yyyy")}</strong>
              </div>
              <div>
                <p className="text-muted" style={{ marginBottom: 4 }}>Ngày trả phòng</p>
                <strong>{format(new Date(booking.checkOutDate), "dd/MM/yyyy")}</strong>
              </div>
              <div>
                <p className="text-muted" style={{ marginBottom: 4 }}>Tổng tiền</p>
                <strong>{currency.format(booking.totalAmount)} VNĐ</strong>
              </div>
            </div>

            {booking.status === "CANCELLED" && booking.refundAmount > 0 && (
              <div className="alert alert-success" style={{ marginTop: 18, marginBottom: 0 }}>
                Số tiền hoàn dự kiến: {currency.format(booking.refundAmount)} VNĐ.
              </div>
            )}

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 20 }}>
              {booking.status === "HOLD" && (
                <>
                  <button className="btn" disabled={processingId === booking.id} onClick={() => handleVNPay(booking.id)}>
                    Thanh toán VNPay
                  </button>
                  <button className="btn btn-outline btn-danger" disabled={processingId === booking.id} onClick={() => handleCancel(booking.id)}>
                    Hủy đặt phòng
                  </button>
                </>
              )}
              {booking.status === "CONFIRMED" && (
                <button className="btn btn-outline btn-danger" disabled={processingId === booking.id} onClick={() => handleCancel(booking.id)}>
                  Hủy theo chính sách
                </button>
              )}
              {booking.status === "CHECKED_OUT" && (
                <button className="btn btn-outline" onClick={() => handleReviewClick(booking.id)}>
                  Đánh giá dịch vụ
                </button>
              )}
            </div>
          </article>
        ))}

        {bookings.length === 0 && (
          <div className="empty-state card">Bạn chưa có đặt phòng nào. Hãy tìm phòng để bắt đầu.</div>
        )}
      </div>
    </div>
  );
}
