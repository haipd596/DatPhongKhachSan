import { useState, useEffect } from "react";
import client from "../../api/client";

const currency = new Intl.NumberFormat("vi-VN");

export default function ReportManager() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Helper formats
  const formatDateString = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const getMonday = (d) => {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(date.setDate(diff));
  };

  // Set default values (Current Month) on mount
  useEffect(() => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    setStartDate(formatDateString(firstDay));
    setEndDate(formatDateString(lastDay));
  }, []);

  // Fetch report whenever dates change
  useEffect(() => {
    if (startDate && endDate) {
      fetchReport();
    }
  }, [startDate, endDate]);

  const fetchReport = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await client.get(`/manager/reports/summary?startDate=${startDate}&endDate=${endDate}`);
      setSummary(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Không tải được dữ liệu báo cáo thống kê");
    } finally {
      setLoading(false);
    }
  };

  // Filter Quick Selections
  const handleQuickSelect = (type) => {
    const now = new Date();
    if (type === "week") {
      const monday = getMonday(now);
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      setStartDate(formatDateString(monday));
      setEndDate(formatDateString(sunday));
    } else if (type === "month") {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      setStartDate(formatDateString(firstDay));
      setEndDate(formatDateString(lastDay));
    }
  };

  // Export files
  const handleExport = async (type) => {
    try {
      const response = await client.get(`/manager/reports/${type}?startDate=${startDate}&endDate=${endDate}`, {
        responseType: "blob",
      });
      const blob = new Blob([response.data], {
        type: type === "pdf" ? "application/pdf" : "text/csv;charset=utf-8;",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `bao_cao_thong_ke_${startDate}_to_${endDate}.${type === "pdf" ? "pdf" : "csv"}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert("Không xuất được báo cáo. Vui lòng thử lại.");
    }
  };

  return (
    <div className="report-manager">
      <div className="no-print" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h2 className="page-title" style={{ margin: 0 }}>Báo cáo Thống kê Hoạt động</h2>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-outline" onClick={() => handleQuickSelect("week")}>Tuần này</button>
          <button className="btn btn-outline" onClick={() => handleQuickSelect("month")}>Tháng này</button>
        </div>
      </div>

      {/* Filter panel */}
      <section className="card no-print" style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "flex-end" }}>
          <div>
            <label className="form-label" style={{ marginBottom: 4 }}>Từ ngày</label>
            <input
              type="date"
              className="form-control"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div>
            <label className="form-label" style={{ marginBottom: 4 }}>Đến ngày</label>
            <input
              type="date"
              className="form-control"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <button className="btn" onClick={fetchReport} disabled={loading} style={{ height: "42px" }}>
            {loading ? "Đang tải..." : "Lọc kết quả"}
          </button>
        </div>
      </section>

      {error && <div className="alert alert-error no-print">{error}</div>}

      {/* Printable Area */}
      {summary && (
        <div className="printable-report">
          {/* Header visible ONLY during print */}
          <div className="print-only" style={{ display: "none", textAlign: "center", marginBottom: 30 }}>
            <h1 style={{ margin: "0 0 5px 0", fontSize: "24px", color: "#0f172a" }}>REX SÀI GÒN HOTEL</h1>
            <h2 style={{ margin: "0 0 10px 0", fontSize: "18px", color: "#475569" }}>BÁO CÁO THỐNG KÊ HOẠT ĐỘNG</h2>
            <p style={{ margin: 0, fontSize: "14px", color: "#64748b" }}>
              Khoảng thời gian: {new Date(startDate).toLocaleDateString("vi-VN")} - {new Date(endDate).toLocaleDateString("vi-VN")}
            </p>
            <hr style={{ border: "0", borderTop: "1px solid #cbd5e1", margin: "20px 0" }} />
          </div>

          {/* KPI Dashboard */}
          <div className="grid-5" style={{ marginBottom: 24 }}>
            <div className="stat-card" style={{ borderLeft: "4px solid #3b82f6" }}>
              <h3 className="stat-title">Khách hàng mới</h3>
              <p className="stat-value" style={{ color: "#3b82f6" }}>{summary.newCustomersCount}</p>
            </div>
            <div className="stat-card" style={{ borderLeft: "4px solid #10b981" }}>
              <h3 className="stat-title">Đơn book phòng</h3>
              <p className="stat-value" style={{ color: "#10b981" }}>{summary.bookingsCount}</p>
            </div>
            <div className="stat-card" style={{ borderLeft: "4px solid #ef4444" }}>
              <h3 className="stat-title">Đơn đặt bị hủy</h3>
              <p className="stat-value" style={{ color: "#ef4444" }}>{summary.cancelledBookingsCount}</p>
            </div>
            <div className="stat-card" style={{ borderLeft: "4px solid #f59e0b" }}>
              <h3 className="stat-title">Đánh giá mới</h3>
              <p className="stat-value" style={{ color: "#f59e0b" }}>{summary.newReviewsCount}</p>
            </div>
            <div className="stat-card" style={{ borderLeft: "4px solid #8b5cf6", gridColumn: "span 1" }}>
              <h3 className="stat-title">Doanh thu</h3>
              <p className="stat-value" style={{ color: "#8b5cf6", fontSize: "1.3rem" }}>
                {currency.format(summary.revenue)} VNĐ
              </p>
            </div>
          </div>

          {/* Report details table */}
          <section className="card" style={{ padding: "24px" }}>
            <h3 className="section-title" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>Chi tiết số liệu hoạt động</span>
              <span className="no-print" style={{ fontSize: "0.85rem", fontWeight: "normal", color: "#64748b" }}>
                Từ {new Date(startDate).toLocaleDateString("vi-VN")} đến {new Date(endDate).toLocaleDateString("vi-VN")}
              </span>
            </h3>
            
            <div className="table-wrap" style={{ marginTop: 16 }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f8fafc" }}>
                    <th style={{ textAlign: "left", padding: "12px 16px", borderBottom: "2px solid #e2e8f0" }}>Chỉ số hoạt động</th>
                    <th style={{ textAlign: "right", padding: "12px 16px", borderBottom: "2px solid #e2e8f0" }}>Số liệu thống kê</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: "14px 16px", borderBottom: "1px solid #e2e8f0" }}>Số lượng khách hàng mới đăng ký</td>
                    <td style={{ padding: "14px 16px", borderBottom: "1px solid #e2e8f0", textAlign: "right", fontWeight: "bold" }}>
                      {summary.newCustomersCount} khách hàng
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: "14px 16px", borderBottom: "1px solid #e2e8f0" }}>Tổng đơn đặt phòng mới được tạo</td>
                    <td style={{ padding: "14px 16px", borderBottom: "1px solid #e2e8f0", textAlign: "right", fontWeight: "bold" }}>
                      {summary.bookingsCount} đơn đặt phòng
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: "14px 16px", borderBottom: "1px solid #e2e8f0" }}>Đơn đặt phòng bị hủy</td>
                    <td style={{ padding: "14px 16px", borderBottom: "1px solid #e2e8f0", textAlign: "right", fontWeight: "bold", color: "#ef4444" }}>
                      {summary.cancelledBookingsCount} đơn
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: "14px 16px", borderBottom: "1px solid #e2e8f0" }}>Số lượng đánh giá mới nhận</td>
                    <td style={{ padding: "14px 16px", borderBottom: "1px solid #e2e8f0", textAlign: "right", fontWeight: "bold" }}>
                      {summary.newReviewsCount} đánh giá
                    </td>
                  </tr>
                  <tr style={{ background: "#fcf8f2" }}>
                    <td style={{ padding: "14px 16px", borderBottom: "1px solid #e2e8f0", fontWeight: "bold" }}>Tổng doanh thu kiếm được</td>
                    <td style={{ padding: "14px 16px", borderBottom: "1px solid #e2e8f0", textAlign: "right", fontWeight: "bold", color: "#8b5cf6", fontSize: "1.1rem" }}>
                      {currency.format(summary.revenue)} VNĐ
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Actions for no-print */}
            <div className="no-print" style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 24 }}>
              <button className="btn btn-outline" onClick={() => window.print()} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                🖨️ In báo cáo trực tiếp
              </button>
              <button className="btn btn-outline" onClick={() => handleExport("excel")} style={{ display: "flex", alignItems: "center", gap: 6, color: "#10b981", borderColor: "#10b981" }}>
                📊 Xuất báo cáo Excel
              </button>
              <button className="btn" onClick={() => handleExport("pdf")} style={{ display: "flex", alignItems: "center", gap: 6, background: "#ef4444", borderColor: "#ef4444" }}>
                📄 Xuất báo cáo PDF
              </button>
            </div>
          </section>
        </div>
      )}

      {/* Styled block for printing setup */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .printable-report, .printable-report * {
            visibility: visible;
          }
          .printable-report {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
          .print-only {
            display: block !important;
          }
          .card {
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
          }
          .table-wrap th {
            background-color: #cbd5e1 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .stat-card {
            border: 1px solid #e2e8f0 !important;
            box-shadow: none !important;
            padding: 10px !important;
          }
        }
        
        /* Grid structure styles to support grid-5 */
        .grid-5 {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 16px;
        }
        @media (max-width: 1024px) {
          .grid-5 {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
          .grid-5 > div:last-child {
            grid-column: span 2;
          }
        }
        @media (max-width: 640px) {
          .grid-5 {
            grid-template-columns: 1fr;
          }
          .grid-5 > div:last-child {
            grid-column: span 1;
          }
        }
      `}</style>
    </div>
  );
}
