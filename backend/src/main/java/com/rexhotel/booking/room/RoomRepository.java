package com.rexhotel.booking.room;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface RoomRepository extends JpaRepository<Room, Long> {
    Optional<Room> findByCode(String code);
    List<Room> findByStatus(RoomStatus status);
    long countByRoomTypeIdAndStatus(Long roomTypeId, RoomStatus status);
}
