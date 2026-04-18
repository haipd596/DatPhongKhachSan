package com.rexhotel.booking.room;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface RoomRepository extends JpaRepository<Room, Long> {

    List<Room> findByStatus(RoomStatus status);

    Optional<Room> findByCode(String code);

    long countByRoomTypeIdAndStatus(Long roomTypeId, RoomStatus status);

    // BUG3: Safe delete - kiem tra con phong nao dung loai phong nay khong
    boolean existsByRoomTypeId(Long roomTypeId);

    // BUG5: Dem phong theo trang thai thay vi load tat ca vao memory
    long countByStatus(RoomStatus status);
}
