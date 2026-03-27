package com.rexhotel.booking.room;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface RoomTypeRepository extends JpaRepository<RoomType, Long> {
    Optional<RoomType> findByNameIgnoreCase(String name);
}
