import { useState, useEffect, useRef } from "react";
import client from "../../api/client";

const currency = new Intl.NumberFormat("vi-VN");

const EMPTY_TYPE = { name: "", basePrice: "", maxGuests: 2, description: "", imageUrl: "", images: [] };
const EMPTY_ROOM = { code: "", floorNumber: 1, roomTypeId: "", status: "AVAILABLE", hasTv: false, hasWasher: false, hasBalcony: false, hasKitchen: false, bedDouble: 0, bedSingle: 1 };

export default function RoomManager() {
  const [types, setTypes] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("types");

  // Loại phòng form
  const [typeForm, setTypeForm] = useState(EMPTY_TYPE);
  const [editTypeId, setEditTypeId] = useState(null);
  const [typeMsg, setTypeMsg] = useState("");
  const [typeErr, setTypeErr] = useState("");
  const [imageInputMode, setImageInputMode] = useState("url"); // "url" | "upload"
  const [pendingImages, setPendingImages] = useState([]); // list URL strings
  const fileRef = useRef(null);

  // Phòng form
  const [roomForm, setRoomForm] = useState(EMPTY_ROOM);
  const [editRoomId, setEditRoomId] = useState(null);
  const [roomMsg, setRoomMsg] = useState("");
  const [roomErr, setRoomErr] = useState("");

  const loadData = () => {
    setLoading(true);
    Promise.all([
      client.get("/manager/room-types"),
      client.get("/manager/rooms")
    ]).then(([resTypes, resRooms]) => {
      setTypes(resTypes.data);
      setRooms(resRooms.data);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, []);

  // ─── Loại phòng ───────────────────────────────────────
  const handleTypeSubmit = async (e) => {
    e.preventDefault();
    setTypeErr(""); setTypeMsg("");
    try {
      const payload = {
        ...typeForm,
        basePrice: Number(typeForm.basePrice),
        maxGuests: Number(typeForm.maxGuests),
        images: pendingImages.filter(u => u.trim()),
      };
      if (editTypeId) {
        await client.put(`/manager/room-types/${editTypeId}`, payload);
        setTypeMsg("✅ Cập nhật loại phòng thành công!");
      } else {
        await client.post("/manager/room-types", payload);
        setTypeMsg("✅ Thêm loại phòng thành công!");
      }
      setTypeForm(EMPTY_TYPE); setPendingImages([]); setEditTypeId(null);
      loadData();
    } catch (err) {
      setTypeErr(err.response?.data?.message || "Lỗi thao tác loại phòng");
    }
  };

  const editType = (type) => {
    setEditTypeId(type.id);
    setTypeForm({
      name: type.name,
      basePrice: type.basePrice,
      maxGuests: type.maxGuests,
      description: type.description || "",
      imageUrl: type.imageUrl || "",
    });
    setPendingImages(type.images || []);
    setActiveTab("types");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteType = async (id) => {
    if (!window.confirm("Bạn chắc chắn muốn xóa loại phòng này?")) return;
    setTypeErr("");
    try {
      await client.delete(`/manager/room-types/${id}`);
      setTypeMsg("✅ Đã xóa loại phòng");
      loadData();
    } catch (err) {
      setTypeErr(err.response?.data?.message || "Không thể xóa");
    }
  };

  const handleImageUpload = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await client.post("/customers/upload/image", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setPendingImages(prev => [...prev, res.data.url]);
      setTypeMsg("✅ Upload ảnh thành công");
    } catch (err) {
      setTypeErr("Lỗi upload ảnh: " + (err.response?.data?.message || err.message));
    }
  };

  const addImageUrl = () => {
    const url = typeForm.imageUrl?.trim();
    if (!url) return;
    setPendingImages(prev => [...prev, url]);
    setTypeForm(f => ({ ...f, imageUrl: "" }));
  };

  // ─── Phòng ───────────────────────────────────────────
  const handleRoomSubmit = async (e) => {
    e.preventDefault();
    setRoomErr(""); setRoomMsg("");
    try {
      const payload = {
        ...roomForm,
        floorNumber: Number(roomForm.floorNumber),
        roomTypeId: Number(roomForm.roomTypeId),
        bedDouble: Number(roomForm.bedDouble),
        bedSingle: Number(roomForm.bedSingle),
      };
      if (editRoomId) {
        await client.put(`/manager/rooms/${editRoomId}`, payload);
        setRoomMsg("✅ Cập nhật phòng thành công!");
      } else {
        await client.post("/manager/rooms", payload);
        setRoomMsg("✅ Thêm phòng thành công!");
      }
      setRoomForm(EMPTY_ROOM); setEditRoomId(null);
      loadData();
    } catch (err) {
      setRoomErr(err.response?.data?.message || "Lỗi thao tác phòng");
    }
  };

  const editRoom = (room) => {
    setEditRoomId(room.id);
    setRoomForm({
      code: room.code,
      floorNumber: room.floorNumber,
      roomTypeId: room.roomTypeId,
      status: room.status,
      hasTv: room.hasTv || false,
      hasWasher: room.hasWasher || false,
      hasBalcony: room.hasBalcony || false,
      hasKitchen: room.hasKitchen || false,
      bedDouble: room.bedDouble || 0,
      bedSingle: room.bedSingle || 1,
    });
    setActiveTab("rooms");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteRoom = async (id) => {
    if (!window.confirm("Bạn chắc chắn muốn xóa phòng này?")) return;
    setRoomErr("");
    try {
      await client.delete(`/manager/rooms/${id}`);
      setRoomMsg("✅ Đã xóa phòng");
      loadData();
    } catch (err) {
      setRoomErr(err.response?.data?.message || "Không thể xóa");
    }
  };

  if (loading) return <div className="loading-state card">Đang tải...</div>;

  return (
    <div>
      <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
        <button className={`btn ${activeTab === "types" ? "" : "btn-outline"}`} onClick={() => setActiveTab("types")}>
          🏷 Loại phòng ({types.length})
        </button>
        <button className={`btn ${activeTab === "rooms" ? "" : "btn-outline"}`} onClick={() => setActiveTab("rooms")}>
          🏠 Phòng ({rooms.length})
        </button>
      </div>

      {/* ─── LOẠI PHÒNG ─── */}
      {activeTab === "types" && (
        <div>
          {/* Form */}
          <div className="card" style={{ marginBottom: 24 }}>
            <h3 style={{ marginBottom: 18, color: "var(--primary-strong)" }}>
              {editTypeId ? "✏️ Sửa loại phòng" : "➕ Thêm loại phòng mới"}
            </h3>
            {typeErr && <div className="alert alert-error">{typeErr}</div>}
            {typeMsg && <div className="alert alert-success">{typeMsg}</div>}
            <form onSubmit={handleTypeSubmit}>
              <div className="grid-2" style={{ gap: 16, marginBottom: 16 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Tên loại phòng *</label>
                  <input className="form-control" value={typeForm.name} onChange={e => setTypeForm(f => ({ ...f, name: e.target.value }))} required placeholder="VD: Deluxe, Suite..." />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Giá gốc / đêm (VNĐ) *</label>
                  <input className="form-control" type="number" min="1" value={typeForm.basePrice} onChange={e => setTypeForm(f => ({ ...f, basePrice: e.target.value }))} required />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Số khách tối đa *</label>
                  <input className="form-control" type="number" min="1" max="20" value={typeForm.maxGuests} onChange={e => setTypeForm(f => ({ ...f, maxGuests: e.target.value }))} required />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Mô tả</label>
                  <input className="form-control" value={typeForm.description} onChange={e => setTypeForm(f => ({ ...f, description: e.target.value }))} placeholder="Mô tả ngắn về loại phòng" />
                </div>
              </div>

              {/* Ảnh */}
              <div className="form-group">
                <label className="form-label">Ảnh loại phòng</label>
                <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                  <button type="button" className={`btn btn-sm ${imageInputMode === "url" ? "" : "btn-outline"}`} onClick={() => setImageInputMode("url")}>🔗 Nhập URL</button>
                  <button type="button" className={`btn btn-sm ${imageInputMode === "upload" ? "" : "btn-outline"}`} onClick={() => setImageInputMode("upload")}>📁 Upload file</button>
                </div>
                {imageInputMode === "url" ? (
                  <div style={{ display: "flex", gap: 8 }}>
                    <input className="form-control" value={typeForm.imageUrl || ""} onChange={e => setTypeForm(f => ({ ...f, imageUrl: e.target.value }))} placeholder="https://... (URL hình ảnh)" style={{ flex: 1 }} />
                    <button type="button" className="btn btn-outline" onClick={addImageUrl}>Thêm</button>
                  </div>
                ) : (
                  <div>
                    <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => { if (e.target.files?.[0]) handleImageUpload(e.target.files[0]); }} />
                    <button type="button" className="btn btn-outline" onClick={() => fileRef.current?.click()}>Chọn & Upload ảnh</button>
                  </div>
                )}
                {pendingImages.length > 0 && (
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
                    {pendingImages.map((url, i) => (
                      <div key={i} style={{ position: "relative" }}>
                        <img src={url} alt="" style={{ width: 80, height: 56, objectFit: "cover", borderRadius: 6, border: "1px solid var(--border)" }} onError={e => e.target.style.display = "none"} />
                        <button type="button" onClick={() => setPendingImages(prev => prev.filter((_, j) => j !== i))} style={{ position: "absolute", top: -6, right: -6, width: 18, height: 18, borderRadius: "50%", background: "var(--danger)", color: "#fff", border: "none", cursor: "pointer", fontSize: 11, lineHeight: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}>✕</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button type="submit" className="btn">{editTypeId ? "Cập nhật" : "Thêm mới"}</button>
                {editTypeId && <button type="button" className="btn btn-outline" onClick={() => { setEditTypeId(null); setTypeForm(EMPTY_TYPE); setPendingImages([]); }}>Hủy sửa</button>}
              </div>
            </form>
          </div>

          {/* Danh sách */}
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Ảnh</th>
                  <th>Tên loại</th>
                  <th>Giá gốc</th>
                  <th>Số khách TĐ</th>
                  <th>Mô tả</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {types.map(type => (
                  <tr key={type.id}>
                    <td>
                      {(type.images?.[0] || type.imageUrl) ? (
                        <img src={type.images?.[0] || type.imageUrl} alt="" style={{ width: 72, height: 48, objectFit: "cover", borderRadius: 6 }} />
                      ) : <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>—</span>}
                    </td>
                    <td><strong>{type.name}</strong></td>
                    <td>{currency.format(type.basePrice)} đ</td>
                    <td>{type.maxGuests} người</td>
                    <td style={{ maxWidth: 200, fontSize: "0.85rem", color: "var(--text-muted)" }}>{type.description || "—"}</td>
                    <td>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button className="btn btn-sm btn-outline" onClick={() => editType(type)}>✏️ Sửa</button>
                        <button className="btn btn-sm btn-danger" onClick={() => deleteType(type.id)}>🗑 Xóa</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {types.length === 0 && <div className="empty-state">Chưa có loại phòng nào.</div>}
          </div>
        </div>
      )}

      {/* ─── PHÒNG ─── */}
      {activeTab === "rooms" && (
        <div>
          {/* Form */}
          <div className="card" style={{ marginBottom: 24 }}>
            <h3 style={{ marginBottom: 18, color: "var(--primary-strong)" }}>
              {editRoomId ? "✏️ Sửa thông tin phòng" : "➕ Thêm phòng mới"}
            </h3>
            {roomErr && <div className="alert alert-error">{roomErr}</div>}
            {roomMsg && <div className="alert alert-success">{roomMsg}</div>}
            <form onSubmit={handleRoomSubmit}>
              <div className="grid-2" style={{ gap: 16, marginBottom: 16 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Mã phòng *</label>
                  <input className="form-control" value={roomForm.code} onChange={e => setRoomForm(f => ({ ...f, code: e.target.value }))} required placeholder="VD: D201" />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Tầng *</label>
                  <input className="form-control" type="number" min="1" value={roomForm.floorNumber} onChange={e => setRoomForm(f => ({ ...f, floorNumber: e.target.value }))} required />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Loại phòng *</label>
                  <select className="form-control" value={roomForm.roomTypeId} onChange={e => setRoomForm(f => ({ ...f, roomTypeId: e.target.value }))} required>
                    <option value="">-- Chọn loại phòng --</option>
                    {types.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Trạng thái</label>
                  <select className="form-control" value={roomForm.status} onChange={e => setRoomForm(f => ({ ...f, status: e.target.value }))}>
                    <option value="AVAILABLE">Sẵn sàng</option>
                    <option value="MAINTENANCE">Bảo trì</option>
                  </select>
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Số giường đôi</label>
                  <input className="form-control" type="number" min="0" value={roomForm.bedDouble} onChange={e => setRoomForm(f => ({ ...f, bedDouble: e.target.value }))} />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Số giường đơn</label>
                  <input className="form-control" type="number" min="0" value={roomForm.bedSingle} onChange={e => setRoomForm(f => ({ ...f, bedSingle: e.target.value }))} />
                </div>
              </div>

              {/* Tiện nghi */}
              <div className="form-group">
                <label className="form-label">Tiện nghi trong phòng</label>
                <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                  {[
                    { key: "hasTv", icon: "📺", label: "TV" },
                    { key: "hasWasher", icon: "🫧", label: "Máy giặt" },
                    { key: "hasBalcony", icon: "🌅", label: "Ban công" },
                    { key: "hasKitchen", icon: "🍽️", label: "Bếp" },
                  ].map(item => (
                    <label key={item.key} style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", padding: "8px 12px", border: `2px solid ${roomForm[item.key] ? "var(--primary)" : "var(--border)"}`, borderRadius: 8, background: roomForm[item.key] ? "var(--surface-soft)" : "#fff", fontWeight: 600, transition: "all 0.15s" }}>
                      <input type="checkbox" checked={roomForm[item.key]} onChange={e => setRoomForm(f => ({ ...f, [item.key]: e.target.checked }))} style={{ width: 16, height: 16, accentColor: "var(--primary)" }} />
                      {item.icon} {item.label}
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button type="submit" className="btn">{editRoomId ? "Cập nhật" : "Thêm phòng"}</button>
                {editRoomId && <button type="button" className="btn btn-outline" onClick={() => { setEditRoomId(null); setRoomForm(EMPTY_ROOM); }}>Hủy sửa</button>}
              </div>
            </form>
          </div>

          {/* Danh sách phòng */}
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Mã phòng</th>
                  <th>Tầng</th>
                  <th>Loại phòng</th>
                  <th>Tiện nghi</th>
                  <th>Giường</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {rooms.map(room => (
                  <tr key={room.id}>
                    <td><strong style={{ color: "var(--primary)" }}>{room.code}</strong></td>
                    <td>Tầng {room.floorNumber}</td>
                    <td>{room.roomTypeName}</td>
                    <td>
                      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                        {room.hasTv && <span title="TV" style={{ fontSize: "1.1rem" }}>📺</span>}
                        {room.hasWasher && <span title="Máy giặt" style={{ fontSize: "1.1rem" }}>🫧</span>}
                        {room.hasBalcony && <span title="Ban công" style={{ fontSize: "1.1rem" }}>🌅</span>}
                        {room.hasKitchen && <span title="Bếp" style={{ fontSize: "1.1rem" }}>🍽️</span>}
                        {!room.hasTv && !room.hasWasher && !room.hasBalcony && !room.hasKitchen && <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>—</span>}
                      </div>
                    </td>
                    <td style={{ fontSize: "0.85rem" }}>
                      {room.bedDouble > 0 && <span>🛏 {room.bedDouble} đôi </span>}
                      {room.bedSingle > 0 && <span>🛌 {room.bedSingle} đơn</span>}
                    </td>
                    <td><span className={`badge badge-${room.status}`}>{room.status === "AVAILABLE" ? "Sẵn sàng" : "Bảo trì"}</span></td>
                    <td>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button className="btn btn-sm btn-outline" onClick={() => editRoom(room)}>✏️ Sửa</button>
                        <button className="btn btn-sm btn-danger" onClick={() => deleteRoom(room.id)}>🗑 Xóa</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {rooms.length === 0 && <div className="empty-state">Chưa có phòng nào.</div>}
          </div>
        </div>
      )}
    </div>
  );
}
