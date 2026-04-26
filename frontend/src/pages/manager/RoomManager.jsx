import { useState, useEffect } from "react";
import client from "../../api/client";

const currency = new Intl.NumberFormat("vi-VN");

export default function RoomManager() {
  const [types, setTypes] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      client.get("/rooms/types"),
      client.get("/rooms")
    ]).then(([resTypes, resRooms]) => {
      setTypes(resTypes.data);
      setRooms(resRooms.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-state card">Đang tải danh sách phòng...</div>;

  return (
    <div className="room-manager">
      <h2 className="page-title">Quản lý phòng</h2>

      <div className="grid-2">
        <section>
          <h3 className="section-title">Loại phòng ({types.length})</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Tên loại</th>
                  <th>Giá gốc</th>
                  <th>Số khách tối đa</th>
                </tr>
              </thead>
              <tbody>
                {types.map((type) => (
                  <tr key={type.id}>
                    <td><strong>{type.name}</strong></td>
                    <td>{currency.format(type.basePrice)} VNĐ</td>
                    <td>{type.maxGuests}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h3 className="section-title">Danh sách phòng ({rooms.length})</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Mã phòng</th>
                  <th>Tầng</th>
                  <th>Loại phòng</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {rooms.map((room) => (
                  <tr key={room.id}>
                    <td><strong>{room.code}</strong></td>
                    <td>{room.floorNumber}</td>
                    <td>{room.roomTypeName}</td>
                    <td><span className={`badge badge-${room.status}`}>{room.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
