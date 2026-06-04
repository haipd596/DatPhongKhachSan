import { useState, useEffect, useRef } from "react";
import client from "../../api/client";
import { useAuth } from "../../auth/AuthContext";

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ fullName: "", phone: "", gender: "", dateOfBirth: "", avatarUrl: "" });
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadMode, setUploadMode] = useState("url"); // "url" | "upload"
  const fileRef = useRef(null);

  useEffect(() => {
    client.get("/customers/me/profile")
      .then(res => {
        setProfile(res.data);
        setForm({
          fullName: res.data.fullName || "",
          phone: res.data.phone || "",
          gender: res.data.gender || "",
          dateOfBirth: res.data.dateOfBirth || "",
          avatarUrl: res.data.avatarUrl || "",
        });
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true); setErr(""); setMsg("");
    try {
      const res = await client.put("/customers/me/profile", form);
      setProfile(res.data);
      setMsg("✅ Cập nhật thông tin thành công!");
    } catch (error) {
      setErr(error.response?.data?.message || "Lỗi cập nhật thông tin");
    } finally {
      setSaving(false);
    }
  };

  const handleUploadAvatar = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await client.post("/customers/me/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setForm(f => ({ ...f, avatarUrl: res.data.url }));
      setMsg("✅ Upload ảnh thành công!");
    } catch (error) {
      setErr("Lỗi upload ảnh: " + (error.response?.data?.message || error.message));
    }
  };

  if (loading) return <div className="loading-state card">Đang tải thông tin...</div>;

  const avatarSrc = form.avatarUrl || null;
  const vipColors = { NORMAL: "#64748b", SILVER: "#94a3b8", GOLD: "#d99a2b", DIAMOND: "#1d4ed8" };

  return (
    <div className="bookings-page">
      <h2 className="page-title">Thông tin cá nhân</h2>

      {/* Thống kê VIP */}
      <div className="grid-3" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <h3 className="stat-title">Hạng thành viên</h3>
          <p className="stat-value" style={{ color: vipColors[profile?.vipLevel] || "#64748b" }}>
            {profile?.vipLevel || "NORMAL"}
          </p>
          <p className="text-muted" style={{ marginBottom: 0 }}>Ưu đãi tự động áp dụng</p>
        </div>
        <div className="stat-card">
          <h3 className="stat-title">Số lần đặt phòng</h3>
          <p className="stat-value">{profile?.bookingCount ?? 0}</p>
          <p className="text-muted" style={{ marginBottom: 0 }}>Tổng lịch sử đặt phòng</p>
        </div>
        <div className="stat-card">
          <h3 className="stat-title">Email</h3>
          <p className="stat-value" style={{ fontSize: "1rem", wordBreak: "break-all" }}>{profile?.email}</p>
          <p className="text-muted" style={{ marginBottom: 0 }}>Không thể thay đổi</p>
        </div>
      </div>

      {/* Form profile */}
      <div className="card">
        <div className="profile-avatar-wrap">
          <div className="profile-avatar">
            {avatarSrc
              ? <img src={avatarSrc} alt="Avatar" onError={e => e.target.style.display = "none"} />
              : <span>{(profile?.fullName || "K").charAt(0).toUpperCase()}</span>
            }
          </div>
          <div>
            <h3 style={{ margin: 0, color: "var(--primary-strong)" }}>{profile?.fullName}</h3>
            <p style={{ color: "var(--text-muted)", margin: "4px 0" }}>{profile?.email}</p>

            {/* Avatar upload/URL toggle */}
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <button type="button" className={`btn btn-sm ${uploadMode === "url" ? "" : "btn-outline"}`} onClick={() => setUploadMode("url")}>🔗 URL</button>
              <button type="button" className={`btn btn-sm ${uploadMode === "upload" ? "" : "btn-outline"}`} onClick={() => setUploadMode("upload")}>📁 Upload</button>
            </div>
          </div>
        </div>

        {uploadMode === "url" && (
          <div className="form-group">
            <label className="form-label">URL ảnh đại diện</label>
            <input className="form-control" value={form.avatarUrl} onChange={e => setForm(f => ({ ...f, avatarUrl: e.target.value }))} placeholder="https://..." />
          </div>
        )}
        {uploadMode === "upload" && (
          <div className="form-group">
            <label className="form-label">Upload ảnh đại diện</label>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => { if (e.target.files?.[0]) handleUploadAvatar(e.target.files[0]); }} />
            <button type="button" className="btn btn-outline" onClick={() => fileRef.current?.click()}>Chọn ảnh từ máy tính</button>
            {form.avatarUrl && <p style={{ margin: "8px 0 0", color: "var(--text-muted)", fontSize: "0.82rem" }}>Đã upload: {form.avatarUrl}</p>}
          </div>
        )}

        {err && <div className="alert alert-error">{err}</div>}
        {msg && <div className="alert alert-success">{msg}</div>}

        <form onSubmit={handleSave}>
          <div className="grid-2" style={{ gap: 16, marginBottom: 16 }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Họ và tên *</label>
              <input className="form-control" value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} required />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Số điện thoại</label>
              <input className="form-control" type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="0901234567" />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Giới tính</label>
              <select className="form-control" value={form.gender} onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}>
                <option value="">-- Chọn giới tính --</option>
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
                <option value="Khác">Khác</option>
              </select>
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Ngày sinh</label>
              <input className="form-control" type="date" value={form.dateOfBirth} onChange={e => setForm(f => ({ ...f, dateOfBirth: e.target.value }))} />
            </div>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button type="submit" className="btn" disabled={saving}>
              {saving ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
            <button type="button" className="btn btn-outline" onClick={() => setForm({ fullName: profile?.fullName || "", phone: profile?.phone || "", gender: profile?.gender || "", dateOfBirth: profile?.dateOfBirth || "", avatarUrl: profile?.avatarUrl || "" })}>
              Hủy thay đổi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
