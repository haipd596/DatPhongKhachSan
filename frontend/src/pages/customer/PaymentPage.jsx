import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import client from "../../api/client";

const currency = new Intl.NumberFormat("vi-VN");

function calcNights(checkInDate, checkOutDate) {
  if (!checkInDate || !checkOutDate) return 0;
  const start = new Date(checkInDate);
  const end = new Date(checkOutDate);
  return Math.max(0, Math.round((end - start) / (1000 * 60 * 60 * 24)));
}

function formatDate(value) {
  return value ? new Date(value).toLocaleDateString("vi-VN") : "-";
}

function formatDateTime(value) {
  return value ? new Date(value).toLocaleString("vi-VN") : "-";
}

export default function PaymentPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    client.get(`/bookings/${bookingId}`)
      .then((res) => setBooking(res.data))
      .catch((err) => setError(err.response?.data?.message || "Không tải được thông tin thanh toán"))
      .finally(() => setLoading(false));
  }, [bookingId]);

  const summary = useMemo(() => {
    if (!booking) return null;
    const nights = calcNights(booking.checkInDate, booking.checkOutDate);
    const total = Number(booking.totalAmount || 0);
    const extraFee = Number(booking.extraFee || 0);
    const roomTotalWithVat = Math.max(total - extraFee, 0);
    const roomAmount = Math.round(roomTotalWithVat / 1.1);
    const vatAmount = roomTotalWithVat - roomAmount;
    const listedBaseAmount = Number(booking.roomBasePrice || 0) * nights;
    return { nights, total, extraFee, roomTotalWithVat, roomAmount, vatAmount, listedBaseAmount };
  }, [booking]);

  const handlePay = async () => {
    setProcessing(true);
    setError("");
    try {
      const res = await client.post("/payments/vnpay/create", { bookingId: Number(bookingId) });
      window.location.href = res.data.paymentUrl;
    } catch (err) {
      setError(err.response?.data?.message || "Không tạo được giao dịch thanh toán");
      setProcessing(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm("Bạn có chắc chắn muốn hủy giữ phòng này?")) return;
    setProcessing(true);
    try {
      await client.post(`/bookings/${bookingId}/cancel`);
      navigate("/customer/bookings");
    } catch (err) {
      setError(err.response?.data?.message || "Không hủy được đặt phòng");
      setProcessing(false);
    }
  };

  if (loading) return <div className="loading-state card">Đang tải thông tin thanh toán...</div>;

  if (error && !booking) {
    return (
      <div className="payment-page">
        <div className="alert alert-error">{error}</div>
        <Link to="/customer/bookings" className="btn btn-outline">Quay lại đặt phòng của tôi</Link>
      </div>
    );
  }

  if (!booking || !summary) return null;

  const isPayable = booking.status === "HOLD";

  return (
    <div className="payment-page">
      <div className="payment-title-row">
        <div>
          <h2 className="page-title">Thanh toán đặt phòng</h2>
          <p className="text-muted">Mã đặt phòng #{booking.id} · Hạn giữ phòng: {formatDateTime(booking.holdExpiresAt)}</p>
        </div>
        <span className={`badge badge-${booking.status}`}>{booking.status}</span>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="payment-layout">
        <section className="card payment-room-panel">
          <h3>{booking.roomTypeName} - Phòng {booking.roomCode}</h3>
          <div className="payment-stay-grid">
            <div>
              <p className="text-muted">Ngày nhận phòng</p>
              <strong>{formatDate(booking.checkInDate)}</strong>
            </div>
            <div>
              <p className="text-muted">Ngày trả phòng</p>
              <strong>{formatDate(booking.checkOutDate)}</strong>
            </div>
            <div>
              <p className="text-muted">Số đêm</p>
              <strong>{summary.nights} đêm</strong>
            </div>
          </div>

          <div className="payment-services">
            <h4>Dịch vụ đã chọn</h4>
            <div className="payment-service-list">
              {booking.hasBreakfast && <span className="service-chip">Buffet sáng</span>}
              {booking.hasTransfer && <span className="service-chip">Xe đưa đón</span>}
              {booking.hasPetCare && <span className="service-chip">Chăm sóc thú cưng</span>}
              {!booking.hasBreakfast && !booking.hasTransfer && !booking.hasPetCare && (
                <span className="text-muted">Không chọn dịch vụ bổ sung</span>
              )}
            </div>
          </div>

          <div className="payment-actions">
            <button className="btn" disabled={!isPayable || processing} onClick={handlePay}>
              {processing ? "Đang tạo giao dịch..." : "Thanh toán VNPay"}
            </button>
            {isPayable && (
              <button className="btn btn-outline btn-danger" disabled={processing} onClick={handleCancel}>
                Hủy giữ phòng
              </button>
            )}
            <Link to="/customer/bookings" className="btn btn-outline">Xem đặt phòng của tôi</Link>
          </div>
        </section>

        <aside className="card payment-summary-panel">
          <h3>Chi tiết chi phí</h3>
          <div className="payment-line">
            <span>Giá niêm yết ({summary.nights} đêm)</span>
            <strong>{currency.format(summary.listedBaseAmount)} VNĐ</strong>
          </div>
          <div className="payment-line">
            <span>Giá phòng sau ưu đãi</span>
            <strong>{currency.format(summary.roomAmount)} VNĐ</strong>
          </div>
          <div className="payment-line">
            <span>VAT 10%</span>
            <strong>{currency.format(summary.vatAmount)} VNĐ</strong>
          </div>
          <div className="payment-line">
            <span>Dịch vụ bổ sung</span>
            <strong>{currency.format(summary.extraFee)} VNĐ</strong>
          </div>
          <div className="payment-total-line">
            <span>Tổng thanh toán</span>
            <strong>{currency.format(summary.total)} VNĐ</strong>
          </div>
        </aside>
      </div>
    </div>
  );
}
