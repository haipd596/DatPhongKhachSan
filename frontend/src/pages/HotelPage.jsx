import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";

const AMENITIES = [
  { icon: "🏊", label: "Hồ bơi ngoài trời" },
  { icon: "📶", label: "WiFi miễn phí" },
  { icon: "🚗", label: "Xe đưa đón sân bay" },
  { icon: "🍳", label: "Buffet sáng" },
  { icon: "💪", label: "Phòng gym & Spa" },
  { icon: "🅿️", label: "Chỗ đậu xe" },
  { icon: "🚭", label: "Phòng không hút thuốc" },
  { icon: "🍸", label: "Quầy bar & Nhà hàng" },
  { icon: "♿", label: "Tiện nghi người khuyết tật" },
  { icon: "🔒", label: "Két an toàn" },
];

const NEARBY = {
  "Xung quanh có gì?": [
    { name: "Nhà thờ Đức Bà", dist: "0.8 km" },
    { name: "Bưu điện Trung tâm SG", dist: "0.9 km" },
    { name: "Phố đi bộ Nguyễn Huệ", dist: "50 m" },
    { name: "Chợ Bến Thành", dist: "1.2 km" },
    { name: "Bảo tàng Lịch sử TP.HCM", dist: "1.0 km" },
  ],
  "Nhà hàng & Quán cà phê": [
    { name: "Quán Ăn Ngon", dist: "200 m" },
    { name: "Highlands Coffee", dist: "150 m" },
    { name: "The Deck Saigon", dist: "1.5 km" },
  ],
  "Địa điểm tham quan": [
    { name: "Hội trường Thống Nhất", dist: "0.5 km" },
    { name: "Nhà hát Thành phố", dist: "0.3 km" },
    { name: "Bảo tàng Chiến tranh", dist: "1.4 km" },
  ],
  "Sân bay gần nhất": [
    { name: "Sân bay Tân Sơn Nhất", dist: "7 km" },
  ],
};

const RATING_CATEGORIES = [
  { label: "Nhân viên", score: 9.4 },
  { label: "Cơ sở vật chất", score: 9.0 },
  { label: "Vệ sinh", score: 9.2 },
  { label: "Thoải mái", score: 9.1 },
  { label: "Giá trị", score: 8.8 },
  { label: "Vị trí", score: 9.6 },
  { label: "WiFi miễn phí", score: 9.0 },
];

const HOTEL_IMAGES = [
  "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1200&q=80",
  "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200&q=80",
  "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1200&q=80",
  "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=1200&q=80",
  "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80",
];

const ROOM_FEATURE_ICONS = {
  hasTv: { icon: "📺", label: "TV màn hình phẳng" },
  hasWasher: { icon: "🫧", label: "Máy giặt" },
  hasBalcony: { icon: "🌅", label: "Ban công" },
  hasKitchen: { icon: "🍽️", label: "Bếp" },
};

function formatCurrency(v) {
  return Number(v || 0).toLocaleString("vi-VN") + "đ";
}

function StarRating({ score, max = 10 }) {
  const pct = (score / max) * 100;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ flex: 1, height: 6, background: "#e2e8f0", borderRadius: 99 }}>
        <div style={{ width: `${pct}%`, height: "100%", background: "linear-gradient(90deg,#1a6fc4,#003580)", borderRadius: 99 }} />
      </div>
      <span style={{ fontWeight: 700, fontSize: "0.9rem", minWidth: 28 }}>{score}</span>
    </div>
  );
}

export default function HotelPage() {
  const [activeImg, setActiveImg] = useState(0);
  const [roomTypes, setRoomTypes] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [hotelInfo, setHotelInfo] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const intervalRef = useRef(null);

  useEffect(() => {
    fetch("/api/hotel/info").then(r => r.ok ? r.json() : {}).then(d => setHotelInfo(d)).catch(() => {});
    fetch("/api/hotel/room-types").then(r => r.ok ? r.json() : []).then(d => setRoomTypes(d)).catch(() => {});
    fetch("/api/hotel/reviews").then(r => r.ok ? r.json() : []).then(d => setReviews(d)).catch(() => {});
  }, []);

  useEffect(() => {
    intervalRef.current = setInterval(() => setActiveImg(i => (i + 1) % HOTEL_IMAGES.length), 4000);
    return () => clearInterval(intervalRef.current);
  }, []);

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length * 2).toFixed(1)
    : "9.1";

  const ratingLabel = Number(avgRating) >= 9 ? "Tuyệt vời" : Number(avgRating) >= 8 ? "Rất tốt" : "Tốt";

  const NAV_TABS = [
    { id: "overview", label: "Tổng quan" },
    { id: "rooms", label: "Loại phòng & Giá" },
    { id: "facilities", label: "Tiện nghi" },
    { id: "rules", label: "Nội quy" },
    { id: "reviews", label: "Đánh giá khách" },
    { id: "map", label: "Vị trí" },
  ];

  return (
    <div className="hotel-public-page">
      {/* Topbar */}
      <header className="hotel-topbar">
        <div className="hotel-topbar-inner">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: "1.6rem" }}>🏨</span>
            <span className="hotel-topbar-brand">Rex Hotel Saigon</span>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <Link to="/login" className="htb-btn htb-btn-outline">Đăng nhập</Link>
            <Link to="/register" className="htb-btn htb-btn-primary">Đặt phòng ngay</Link>
          </div>
        </div>
      </header>

      {/* Hero Gallery */}
      <section className="hotel-hero">
        <div className="hotel-gallery-main">
          <img
            src={HOTEL_IMAGES[activeImg]}
            alt={`Ảnh khách sạn ${activeImg + 1}`}
            className="hotel-gallery-img"
            loading="lazy"
          />
          <div className="hotel-gallery-dots">
            {HOTEL_IMAGES.map((_, i) => (
              <button
                key={i}
                onClick={() => { setActiveImg(i); clearInterval(intervalRef.current); }}
                className={`gallery-dot ${i === activeImg ? "active" : ""}`}
                aria-label={`Ảnh ${i + 1}`}
              />
            ))}
          </div>
          <div className="hotel-gallery-thumbs">
            {HOTEL_IMAGES.slice(1, 5).map((src, i) => (
              <img
                key={i}
                src={src}
                alt=""
                className={`gallery-thumb ${i + 1 === activeImg ? "active" : ""}`}
                onClick={() => setActiveImg(i + 1)}
                loading="lazy"
              />
            ))}
            {HOTEL_IMAGES.length > 5 && (
              <div className="gallery-thumb gallery-more">+{HOTEL_IMAGES.length - 4} ảnh</div>
            )}
          </div>
        </div>

        {/* Side info card */}
        <aside className="hotel-side-card">
          <div className="hotel-stars">{"⭐".repeat(hotelInfo?.stars || 5)}</div>
          <h1 className="hotel-name">{hotelInfo?.name || "Rex Hotel Saigon"}</h1>
          <p className="hotel-addr">📍 {hotelInfo?.address || "141 Nguyễn Huệ, Q.1, TP.HCM"}</p>
          <a
            href="#map-section"
            onClick={() => setActiveTab("map")}
            className="hotel-map-link"
          >
            Vị trí tuyệt vời — xem bản đồ
          </a>

          <div className="hotel-rating-box">
            <div className="hotel-rating-score">{avgRating}</div>
            <div>
              <div className="hotel-rating-label">{ratingLabel}</div>
              <div className="hotel-rating-count">{reviews.length} đánh giá</div>
            </div>
          </div>

          <div className="hotel-quick-amenities">
            {AMENITIES.slice(0, 5).map(a => (
              <span key={a.label} className="hotel-amenity-chip">{a.icon} {a.label}</span>
            ))}
          </div>

          <Link to="/register" className="htb-btn htb-btn-primary full-w" style={{ marginTop: 16, display: "block", textAlign: "center", padding: "14px 0" }}>
            🛎 Đặt phòng ngay
          </Link>
          <Link to="/login" className="htb-btn htb-btn-outline full-w" style={{ marginTop: 8, display: "block", textAlign: "center", padding: "12px 0" }}>
            Đăng nhập để đặt phòng
          </Link>
        </aside>
      </section>

      {/* Sticky Nav Tabs */}
      <nav className="hotel-nav-tabs">
        {NAV_TABS.map(t => (
          <a
            key={t.id}
            href={`#${t.id}-section`}
            className={`hotel-nav-tab ${activeTab === t.id ? "active" : ""}`}
            onClick={() => setActiveTab(t.id)}
          >
            {t.label}
          </a>
        ))}
      </nav>

      <div className="hotel-content">
        {/* Overview */}
        <section id="overview-section" className="hotel-section">
          <h2 className="hotel-section-title">Giới thiệu về Rex Hotel Saigon</h2>
          <p className="hotel-desc">
            {hotelInfo?.description || "Rex Hotel Saigon tọa lạc ngay trung tâm thành phố, là biểu tượng lịch sử và sang trọng của Sài Gòn. Với hơn 60 năm lịch sử, khách sạn mang đến trải nghiệm đẳng cấp 5 sao cùng dịch vụ chuyên nghiệp."}
          </p>
          <div className="hotel-overview-grid">
            <div className="hotel-info-card">
              <span className="hotel-info-icon">📞</span>
              <div>
                <div className="hotel-info-label">Điện thoại</div>
                <div className="hotel-info-val">{hotelInfo?.phone || "+84 28 3829 2185"}</div>
              </div>
            </div>
            <div className="hotel-info-card">
              <span className="hotel-info-icon">✉️</span>
              <div>
                <div className="hotel-info-label">Email</div>
                <div className="hotel-info-val">{hotelInfo?.email || "info@rexhotelsaigon.com"}</div>
              </div>
            </div>
            <div className="hotel-info-card">
              <span className="hotel-info-icon">🕑</span>
              <div>
                <div className="hotel-info-label">Nhận phòng</div>
                <div className="hotel-info-val">Từ {hotelInfo?.checkIn || "14:00"}</div>
              </div>
            </div>
            <div className="hotel-info-card">
              <span className="hotel-info-icon">🕛</span>
              <div>
                <div className="hotel-info-label">Trả phòng</div>
                <div className="hotel-info-val">Đến {hotelInfo?.checkOut || "12:00"}</div>
              </div>
            </div>
          </div>
        </section>

        {/* Room Types */}
        <section id="rooms-section" className="hotel-section">
          <h2 className="hotel-section-title">Loại phòng & Giá</h2>
          <div className="hotel-rooms-grid">
            {roomTypes.map(rt => (
              <div key={rt.id} className="hotel-room-card">
                <div className="hotel-room-img-wrap">
                  <img
                    src={rt.images?.[0] || rt.imageUrl || "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=70"}
                    alt={rt.name}
                    className="hotel-room-img"
                    loading="lazy"
                  />
                </div>
                <div className="hotel-room-info">
                  <h3 className="hotel-room-name">{rt.name}</h3>
                  <p className="hotel-room-desc">{rt.description || "Phòng tiện nghi, hiện đại"}</p>
                  <div className="hotel-room-meta">
                    <span>👥 Tối đa {rt.maxGuests} người</span>
                  </div>
                  <div className="hotel-room-price">
                    <span className="hotel-room-price-val">{formatCurrency(rt.basePrice)}</span>
                    <span className="hotel-room-price-unit">/đêm</span>
                  </div>
                  <Link to="/register" className="htb-btn htb-btn-primary" style={{ marginTop: 12, display: "block", textAlign: "center" }}>
                    Đặt phòng
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Facilities */}
        <section id="facilities-section" className="hotel-section">
          <h2 className="hotel-section-title">Tiện nghi của Rex Hotel Saigon</h2>
          <p style={{ color: "#64748b", marginBottom: 24 }}>Tiện nghi tuyệt vời! Điểm đánh giá: <strong style={{ color: "#003580" }}>9.1</strong></p>
          <div className="hotel-amenities-grid">
            {AMENITIES.map(a => (
              <div key={a.label} className="hotel-amenity-item">
                <span className="hotel-amenity-icon">{a.icon}</span>
                <span>{a.label}</span>
              </div>
            ))}
          </div>
          <div className="hotel-amenity-detail-grid">
            {[
              { title: "Phòng tắm", items: ["Vòi tắm đứng", "Bồn tắm", "Khăn tắm", "Dép", "Giấy vệ sinh", "Dầu gội đầu"] },
              { title: "Phòng ngủ", items: ["Điều hòa nhiệt độ", "TV màn hình phẳng", "Bàn làm việc", "Két an toàn laptop", "Tủ quần áo"] },
              { title: "Đồ ăn & Thức uống", items: ["Nhà hàng", "Quầy bar", "Minibar", "Buffet sáng (có phí)", "Phục vụ tại phòng"] },
              { title: "Internet", items: ["WiFi miễn phí toàn khách sạn"] },
              { title: "Chỗ đậu xe", items: ["Chỗ đậu xe riêng (thu phí)", "Dịch vụ đỗ xe cho khách"] },
              { title: "Hồ bơi", items: ["Hồ bơi ngoài trời (miễn phí)", "Mở cửa quanh năm", "Hồ bơi trên sân thượng"] },
            ].map(cat => (
              <div key={cat.title} className="hotel-amenity-cat">
                <h4 className="hotel-amenity-cat-title">{cat.title}</h4>
                {cat.items.map(item => (
                  <div key={item} className="hotel-amenity-cat-item">
                    <span style={{ color: "#1a6fc4" }}>✓</span> {item}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </section>

        {/* Rules */}
        <section id="rules-section" className="hotel-section">
          <h2 className="hotel-section-title">Nội quy chung</h2>
          <p style={{ color: "#64748b", marginBottom: 20 }}>Rex Hotel nhận yêu cầu đặc biệt — gửi yêu cầu trong bước kế tiếp!</p>
          <div className="hotel-rules-list">
            {[
              {
                icon: "→", title: "Nhận phòng", lines: [
                  "Từ 14:00",
                  "Khách được yêu cầu xuất trình giấy tờ tùy thân có ảnh và thẻ tín dụng lúc nhận phòng",
                  "Vui lòng thông báo giờ đến trước"
                ]
              },
              {
                icon: "←", title: "Trả phòng", lines: ["Đến 12:00"]
              },
              {
                icon: "ℹ", title: "Hủy đặt phòng / Trả trước", lines: [
                  "Chính sách hủy và thanh toán trước sẽ khác nhau tùy từng loại chỗ nghỉ.",
                  "Xem chính sách áp dụng cho lựa chọn của bạn."
                ]
              },
              {
                icon: "👶", title: "Trẻ em và giường", lines: [
                  "Phù hợp cho tất cả trẻ em",
                  "Trẻ em từ 12 tuổi trở lên được tính giá như người lớn",
                  "0 – 1 tuổi: Có nôi/cũi nếu yêu cầu – Miễn phí",
                  "Từ 2 tuổi trở lên: Tính phí theo giường phụ"
                ]
              },
              {
                icon: "🐾", title: "Vật nuôi", lines: [
                  "Không cho phép mang vật nuôi",
                  "Có dịch vụ chăm sóc thú cưng (đặt trước)"
                ]
              },
              {
                icon: "🎉", title: "Tổ chức tiệc/sự kiện", lines: [
                  "Không cho phép tổ chức tiệc / sự kiện"
                ]
              },
            ].map(rule => (
              <div key={rule.title} className="hotel-rule-item">
                <div className="hotel-rule-icon">{rule.icon}</div>
                <div>
                  <div className="hotel-rule-title">{rule.title}</div>
                  {rule.lines.map(l => <p key={l} className="hotel-rule-line">{l}</p>)}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Reviews */}
        <section id="reviews-section" className="hotel-section">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <h2 className="hotel-section-title" style={{ marginBottom: 0 }}>Đánh giá từ khách hàng</h2>
            <Link to="/register" className="htb-btn htb-btn-primary">Xem phòng trống</Link>
          </div>

          <div className="hotel-rating-summary">
            <div className="hotel-rating-big">
              <div className="hotel-rating-big-score">{avgRating}</div>
              <div className="hotel-rating-big-label">{ratingLabel}</div>
              <div className="hotel-rating-big-count">{reviews.length} đánh giá</div>
            </div>
            <div className="hotel-rating-cats">
              <p style={{ fontWeight: 700, marginBottom: 12 }}>Đánh giá theo danh mục:</p>
              {RATING_CATEGORIES.map(cat => (
                <div key={cat.label} className="hotel-rating-cat-row">
                  <span className="hotel-rating-cat-name">{cat.label}</span>
                  <StarRating score={cat.score} />
                </div>
              ))}
            </div>
          </div>

          <div className="hotel-reviews-grid">
            {reviews.slice(0, 6).map(r => (
              <div key={r.id} className="hotel-review-card">
                <div className="hotel-review-header">
                  <div className="hotel-review-avatar">
                    {(r.fullName || "K").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="hotel-review-name">{r.fullName}</div>
                  </div>
                </div>
                <div className="hotel-review-stars">{"⭐".repeat(r.rating)}</div>
                <p className="hotel-review-text">"{r.comment}"</p>
                <Link to="#" className="hotel-review-more">Xem thêm</Link>
              </div>
            ))}
          </div>
        </section>

        {/* Map + Nearby */}
        <section id="map-section" className="hotel-section">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <h2 className="hotel-section-title" style={{ marginBottom: 0 }}>Xung quanh khách sạn</h2>
            <Link to="/register" className="htb-btn htb-btn-primary">Xem phòng trống</Link>
          </div>
          <p style={{ color: "#64748b", marginBottom: 20 }}>Khách thích khu vực này vì:</p>

          <div className="hotel-map-nearby">
            <iframe
              title="Bản đồ Rex Hotel Saigon"
              src="https://www.google.com/maps?q=Rex+Hotel+Saigon,+141+Nguyen+Hue,+Ho+Chi+Minh+City&output=embed"
              width="100%"
              height="380"
              style={{ border: "none", borderRadius: 12 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />

            <div className="hotel-nearby-grid">
              {Object.entries(NEARBY).map(([cat, places]) => (
                <div key={cat} className="hotel-nearby-cat">
                  <h4 className="hotel-nearby-cat-title">{cat}</h4>
                  {places.map(p => (
                    <div key={p.name} className="hotel-nearby-row">
                      <span>{p.name}</span>
                      <span className="hotel-nearby-dist">{p.dist}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <p style={{ fontSize: "0.8rem", color: "#94a3b8", marginTop: 12 }}>
            * Các số liệu hiển thị là khoảng cách đi bộ hoặc xe ước tính ngắn nhất, khoảng cách thực tế có thể khác.
          </p>
        </section>
      </div>

      {/* Footer CTA */}
      <div className="hotel-footer-cta">
        <h2>Sẵn sàng trải nghiệm đẳng cấp 5 sao?</h2>
        <p>Đặt phòng ngay hôm nay để nhận ưu đãi tốt nhất</p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 20 }}>
          <Link to="/register" className="htb-btn htb-btn-primary" style={{ padding: "14px 32px", fontSize: "1.05rem" }}>
            Đăng ký & Đặt phòng
          </Link>
          <Link to="/login" className="htb-btn htb-btn-outline" style={{ padding: "14px 32px", fontSize: "1.05rem", color: "#fff", borderColor: "rgba(255,255,255,0.6)" }}>
            Đã có tài khoản
          </Link>
        </div>
      </div>
    </div>
  );
}
