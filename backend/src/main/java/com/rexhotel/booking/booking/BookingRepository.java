package com.rexhotel.booking.booking;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    @Query("""
        select count(b) from Booking b
        where b.room.id = :roomId
          and b.status in :statuses
          and b.checkInDate < :checkOutDate
          and b.checkOutDate > :checkInDate
    """)
    long countOverlapping(
        @Param("roomId") Long roomId,
        @Param("statuses") Collection<BookingStatus> statuses,
        @Param("checkInDate") LocalDate checkInDate,
        @Param("checkOutDate") LocalDate checkOutDate
    );

    @Query("""
        select count(b) from Booking b
        where b.room.roomType.id = :roomTypeId
          and b.status in :statuses
          and b.checkInDate < :checkOutDate
          and b.checkOutDate > :checkInDate
    """)
    long countOverlappingByRoomType(
        @Param("roomTypeId") Long roomTypeId,
        @Param("statuses") Collection<BookingStatus> statuses,
        @Param("checkInDate") LocalDate checkInDate,
        @Param("checkOutDate") LocalDate checkOutDate
    );

    List<Booking> findByUserEmailOrderByCreatedAtDesc(String email);

    Optional<Booking> findByIdAndUserEmail(Long id, String email);

    List<Booking> findByStatusAndHoldExpiresAtBefore(BookingStatus status, LocalDateTime now);
}
