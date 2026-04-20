import { useState, useEffect } from "react";
import client from "../../api/client";

export default function RoomManager() {
  const [types, setTypes] = useState([]);
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    Promise.all([
      client.get("/rooms/types"),
      client.get("/rooms")
    ]).then(([resTypes, resRooms]) => {
      setTypes(resTypes.data);
      setRooms(resRooms.data);
    });
  }, []);

  return (
    <div className="room-manager">
      <h2 className="page-title">Quản Lý Phòng</h2>
      
      <div className="grid-2">
        <div>
          <h3 style={{ marginBottom: 16 }}>Loại Phòng <span className="text-muted">({types.length})</span></h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Tên</th>
                  <th>Giá gốc</th>
                  <th>Khách tối đa</th>
                </tr>
              </thead>
              <tbody>
                {types.map(t => (
                  <tr key={t.id}>
                    <td><strong>{t.name}</strong></td>
                    <td>{new Intl.NumberFormat('vi-VN').format(t.basePrice)}</td>
                    <td>{t.maxGuests}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h3 style={{ marginBottom: 16 }}>Danh sách Phòng <span className="text-muted">({rooms.length})</span></h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Mã số</th>
                  <th>Tầng</th>
                  <th>Loại</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {rooms.map(r => (
                  <tr key={r.id}>
                    <td><strong>{r.code}</strong></td>
                    <td>{r.floorNumber}</td>
                    <td>{r.roomTypeName}</td>
                    <td><span className={`badge badge-${r.status}`}>{r.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
