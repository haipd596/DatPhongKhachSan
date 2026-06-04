import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import client from "../../api/client";
import { format } from "date-fns";

const currency = new Intl.NumberFormat("vi-VN");

const AMENITY_MAP = [
  { key: "hasTv", icon: "📺", label: "TV màn hình phẳng" },
  { key: "hasWasher", icon: "🫧", label: "Máy giặt" },
  { key: "hasBalcony", icon: "🌅", label: "Ban công" },
  { key: "hasKitchen", icon: "🍽️", label: "Bếp" },
];

const EXTRA_SERVICES = [
  {
    key: "hasBreakfast",
    icon: "🍳",
    name: "Buffet sáng",
    desc: "Tính theo số đêm lưu trú",
    pricePerNight: 150000,
    oneTime: false,
  },
  {
    key: "hasTransfer",
    icon: "🚗",
    name: "Xe đưa đón sân bay",
    desc: "Phí 1 lần (2 chiều)",
    pricePerNight: 0,
    oneTime: true,
    fixedPrice: 300000,
  },
  {
    key: "hasPetCare",
    icon: "🐾",
    name: "Chăm sóc thú cưng",
    desc: "Tính theo số đêm lưu trú",
    pricePerNight: 100000,
    oneTime: false,
  },
];

function calcNights(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0;
  const d1 = new Date(checkIn);
  const d2 = new Date(checkOut);
  return Math.max(0, Math.round((d2 - d1) / (1000 * 60 * 60 * 24)));
}

function calcTotal(basePrice, nights, extras) {
  let extra = 0;
  EXTRA_SERVICES.forEach(svc => {
    if (extras[svc.key]) {
      extra += svc.oneTime ? svc.fixedPrice : svc.pricePerNight * nights;
    }
  });
  const base = basePrice * nights;
  const vat = base * 0.1;
  return { base, vat: Math.round(vat), extra, total: Math.round(base + vat + extra) };
}

// ── Modal xem chi tiết phòng ────────────────────────────────
function RoomDetailModal({ type, room, checkIn, checkOut, onClose, onHold }) {
  const [activeImg, setActiveImg] = useState(0);
  const images = type.images?.length ? type.images : type.imageUrl ? [type.imageUrl] : ["https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=70"];
  const nights = calcNights(checkIn, checkOut);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth: 760 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{type.roomTypeName || type.name} — Phòng {room.code}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          {/* Gallery */}
          <div style={{ position: "relative", marginBottom: 20, borderRadius: 10, overflow: "hidden" }}>
            <img
              src={images[activeImg]}
              alt=""
              style={{ width: "100%", height: 300, objectFit: "cover", display: "block" }}
              onError={e => e.target.src = "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=70"}
            />
          </div>
          {images.length > 1 && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
              {images.map((src, i) => (
                <img key={i} src={src} alt="" onClick={() => setActiveImg(i)}
                  style={{ width: 72, height: 52, objectFit: "cover", borderRadius: 6, cursor: "pointer", border: i === activeImg ? "2px solid #003580" : "2px solid transparent", transition: "border-color 0.15s" }}
                  onError={e => e.target.style.display = "none"}
                />
              ))}
            </div>
          )}

          {/* Thông tin */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 20 }}>
            <div>
              <p style={{ fontWeight: 800, color: "#003580", marginBottom: 8 }}>Thông tin phòng</p>
              <p style={{ color: "#64748b", marginBottom: 6 }}>{type.description || "Phòng tiện nghi, hiện đại."}</p>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
                {room.bedDouble > 0 && <span className="amenity-chip">🛏 {room.bedDouble} giường đôi</span>}
                {room.bedSingle > 0 && <span className="amenity-chip">🛌 {room.bedSingle} giường đơn</span>}
                <span className="amenity-chip">👥 Tối đa {type.maxGuests} người</span>
                <span className="amenity-chip">🏢 Tầng {room.floorNumber}</span>
              </div>
            </div>
            <div>
              <p style={{ fontWeight: 800, color: "#003580", marginBottom: 8 }}>Tiện nghi</p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {AMENITY_MAP.map(a => room[a.key] && (
                  <span key={a.key} className="amenity-chip">{a.icon} {a.label}</span>
                ))}
                {!AMENITY_MAP.some(a => room[a.key]) && <span style={{ color: "#94a3b8", fontSize: "0.88rem" }}>Chưa có thông tin tiện nghi</span>}
              </div>
            </div>
          </div>

          <div style={{ background: "#f8fafc", borderRadius: 10, padding: 16, marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#64748b" }}>Giá {nights} đêm</span>
              <strong>{currency.format(type.basePrice * nights)} VNĐ</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#64748b" }}>Thuế VAT 10%</span>
              <span>{currency.format(Math.round(type.basePrice * nights * 0.1))} VNĐ</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #e2e8f0", marginTop: 10, paddingTop: 10 }}>
              <strong>Tổng (chưa DV bổ sung)</strong>
              <strong style={{ color: "#003580" }}>{currency.format(Math.round(type.basePrice * nights * 1.1))} VNĐ</strong>
            </div>
          </div>

          <button className="btn full-width" style={{ fontSize: "1rem", padding: "14px 0" }} onClick={onHold}>
            🛎 Giữ phòng này
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Modal dịch vụ bổ sung ────────────────────────────────────
function ExtraServicesModal({ selectedRoom, selectedType, checkIn, checkOut, onClose, onConfirm }) {
  const [extras, setExtras] = useState({ hasBreakfast: false, hasTransfer: false, hasPetCare: false });
  const nights = calcNights(checkIn, checkOut);
  const { base, vat, extra, total } = calcTotal(selectedType.basePrice, nights, extras);

  const toggle = (key) => setExtras(prev => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth: 520 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>🛎 Dịch vụ bổ sung</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <p style={{ color: "#64748b", marginBottom: 20 }}>
            Giữ phòng <strong>{selectedRoom.code}</strong> ({selectedType.roomTypeName}) · {nights} đêm
          </p>

          {EXTRA_SERVICES.map(svc => (
            <label
              key={svc.key}
              className={`service-option ${extras[svc.key] ? "selected" : ""}`}
              onClick={() => toggle(svc.key)}
            >
              <input
                type="checkbox"
                checked={extras[svc.key]}
                onChange={() => toggle(svc.key)}
                onClick={e => e.stopPropagation()}
              />
              <span style={{ fontSize: "1.4rem" }}>{svc.icon}</span>
              <span className="service-option-label">
                <div className="service-option-name">{svc.name}</div>
                <div className="service-option-desc">{svc.desc}</div>
              </span>
              <span className="service-option-price">
                +{currency.format(svc.oneTime ? svc.fixedPrice : svc.pricePerNight * nights)}đ
              </span>
            </label>
          ))}

          {/* Tổng tiền */}
          <div style={{ background: "#f8fafc", borderRadius: 10, padding: 16, marginTop: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ color: "#64748b" }}>Giá phòng ({nights} đêm)</span>
              <span>{currency.format(base)} đ</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ color: "#64748b" }}>Thuế VAT 10%</span>
              <span>{currency.format(vat)} đ</span>
            </div>
            {extra > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ color: "#64748b" }}>Dịch vụ bổ sung</span>
                <span style={{ color: "#003580" }}>+{currency.format(extra)} đ</span>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #e2e8f0", paddingTop: 10, marginTop: 6 }}>
              <strong style={{ fontSize: "1rem" }}>Tổng dự kiến</strong>
              <strong style={{ fontSize: "1.1rem", color: "#003580" }}>{currency.format(total)} đ</strong>
            </div>
          </div>

          <button
            className="btn full-width"
            style={{ marginTop: 16, fontSize: "1rem", padding: "14px 0" }}
            onClick={() => onConfirm(extras)}
          >
            Xác nhận giữ phòng
          </button>
          <button
            className="btn btn-outline full-width"
            style={{ marginTop: 8 }}
            onClick={() => onConfirm({ hasBreakfast: false, hasTransfer: false, hasPetCare: false })}
          >
            Bỏ qua, chỉ giữ phòng
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────
export default function RoomSearch() {
  const navigate = useNavigate();
  const [params, setParams] = useState({
    checkIn: format(new Date(), "yyyy-MM-dd"),
    checkOut: format(new Date(Date.now() + 86400000), "yyyy-MM-dd"),
    roomTypeId: "",
    minPrice: "",
    maxPrice: "",
    maxGuests: ""
  });

  const [roomTypes, setRoomTypes] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [holding, setHolding] = useState(null);
  const [error, setError] = useState("");

  // Modal state
  const [detailModal, setDetailModal] = useState(null); // { type, room }
  const [serviceModal, setServiceModal] = useState(null); // { type, room }

  useEffect(() => {
    client.get("/rooms/types").then(res => setRoomTypes(res.data)).catch(() => setRoomTypes([]));
    handleSearch();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const q = new URLSearchParams();
      Object.keys(params).forEach(key => { if (params[key]) q.append(key, params[key]); });
      const res = await client.get(`/rooms?${q.toString()}`);
      const grouped = res.data.reduce((acc, room) => {
        if (!acc[room.roomTypeId]) acc[room.roomTypeId] = { ...room, availableRooms: [] };
        acc[room.roomTypeId].availableRooms.push(room);
        return acc;
      }, {});
      setRooms(Object.values(grouped));
    } catch {
      setError("Không tải được danh sách phòng. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  // Mở modal chọn dịch vụ bổ sung trước khi giữ phòng
  const openServiceModal = (type, room) => {
    setDetailModal(null);
    setServiceModal({ type, room });
  };

  const handleConfirmHold = async (room, extras) => {
    setServiceModal(null);
    setHolding(room.id);
    setError("");
    try {
      const res = await client.post("/bookings/hold", {
        roomId: room.id,
        checkInDate: params.checkIn,
        checkOutDate: params.checkOut,
        guests: params.maxGuests ? Number(params.maxGuests) : 1,
        ...extras,
      });
      navigate(`/customer/payment/${res.data.id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Không giữ được phòng đã chọn");
    } finally {
      setHolding(null);
    }
  };

  return (
    <div className="room-search-page">
      <h2 className="page-title">Tìm phòng trống</h2>

      <div className="card" style={{ marginBottom: 24 }}>
        <form onSubmit={handleSearch} className="grid-3">
          <div className="form-group">
            <label className="form-label">Ngày nhận phòng</label>
            <input type="date" className="form-control" value={params.checkIn} onChange={e => setParams({ ...params, checkIn: e.target.value })} required />
          </div>
          <div className="form-group">
            <label className="form-label">Ngày trả phòng</label>
            <input type="date" className="form-control" value={params.checkOut} onChange={e => setParams({ ...params, checkOut: e.target.value })} required />
          </div>
          <div className="form-group">
            <label className="form-label">Loại phòng</label>
            <select className="form-control" value={params.roomTypeId} onChange={e => setParams({ ...params, roomTypeId: e.target.value })}>
              <option value="">Tất cả loại phòng</option>
              {roomTypes.map(rt => <option key={rt.id} value={rt.id}>{rt.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Giá từ (VNĐ)</label>
            <input type="number" className="form-control" placeholder="0" value={params.minPrice} onChange={e => setParams({ ...params, minPrice: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Giá đến (VNĐ)</label>
            <input type="number" className="form-control" placeholder="Không giới hạn" value={params.maxPrice} onChange={e => setParams({ ...params, maxPrice: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Số khách</label>
            <input type="number" className="form-control" placeholder="1" value={params.maxGuests} onChange={e => setParams({ ...params, maxGuests: e.target.value })} />
          </div>
          <button type="submit" className="btn full-width" disabled={loading} style={{ gridColumn: "1 / -1" }}>
            {loading ? "Đang tìm kiếm..." : "Tìm kiếm phòng"}
          </button>
        </form>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="results-grid grid-2">
        {rooms.map(type => {
          const firstRoom = type.availableRooms[0];
          const coverImg = type.images?.[0] || type.imageUrl || "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=900&q=80";
          return (
            <article key={type.roomTypeId} className="room-card card">
              <div className="room-card-image" style={{ backgroundImage: `url(${coverImg})` }} />
              <div className="room-card-body">
                <div className="room-card-head">
                  <div>
                    <h3 style={{ marginBottom: 6 }}>{type.roomTypeName}</h3>
                    <p className="text-muted" style={{ marginBottom: 8 }}>
                      Tối đa {type.maxGuests} khách · {currency.format(type.basePrice)} VNĐ/đêm
                    </p>
                    {/* Tiện nghi */}
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {AMENITY_MAP.map(a => firstRoom[a.key] && (
                        <span key={a.key} title={a.label} style={{ fontSize: "1rem" }}>{a.icon}</span>
                      ))}
                      {firstRoom.bedDouble > 0 && <span title={`${firstRoom.bedDouble} giường đôi`} className="amenity-chip" style={{ padding: "2px 8px", fontSize: "0.75rem" }}>🛏 {firstRoom.bedDouble}</span>}
                      {firstRoom.bedSingle > 0 && <span title={`${firstRoom.bedSingle} giường đơn`} className="amenity-chip" style={{ padding: "2px 8px", fontSize: "0.75rem" }}>🛌 {firstRoom.bedSingle}</span>}
                    </div>
                  </div>
                  <span className="badge badge-AVAILABLE">Còn {type.availableRooms.length}</span>
                </div>

                <div style={{ display: "flex", gap: 8, marginTop: 22 }}>
                  <button
                    className="btn btn-outline"
                    style={{ flex: 1 }}
                    onClick={() => setDetailModal({ type, room: firstRoom })}
                  >
                    Xem chi tiết
                  </button>
                  <button
                    className="btn"
                    style={{ flex: 1 }}
                    disabled={holding === firstRoom.id}
                    onClick={() => openServiceModal(type, firstRoom)}
                  >
                    {holding === firstRoom.id ? "Đang giữ..." : "Giữ phòng"}
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {rooms.length === 0 && !loading && (
        <div className="empty-state card">Không tìm thấy phòng trống phù hợp với tiêu chí của bạn.</div>
      )}

      {/* Modal chi tiết phòng */}
      {detailModal && (
        <RoomDetailModal
          type={detailModal.type}
          room={detailModal.room}
          checkIn={params.checkIn}
          checkOut={params.checkOut}
          onClose={() => setDetailModal(null)}
          onHold={() => openServiceModal(detailModal.type, detailModal.room)}
        />
      )}

      {/* Modal dịch vụ bổ sung */}
      {serviceModal && (
        <ExtraServicesModal
          selectedRoom={serviceModal.room}
          selectedType={serviceModal.type}
          checkIn={params.checkIn}
          checkOut={params.checkOut}
          onClose={() => setServiceModal(null)}
          onConfirm={extras => handleConfirmHold(serviceModal.room, extras)}
        />
      )}
    </div>
  );
}
