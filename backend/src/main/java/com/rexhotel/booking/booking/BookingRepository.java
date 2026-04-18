package com.rexhotel.booking.booking;

import java.math.BigDecimal;
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

    long countByStatus(BookingStatus status);

    @Query("select coalesce(sum(b.totalAmount),0) from Booking b where b.status = :status")
    BigDecimal sumTotalByStatus(@Param("status") BookingStatus status);

    // BUG3: Safe delete - kiem tra co booking active cho phong nay khong
    boolean existsByRoomIdAndStatusIn(Long roomId, Collection<BookingStatus> statuses);

    // BUG2: Kiem tra user da co booking da checkout chua (de review)
    boolean existsByUserEmailAndStatusAndCheckOutDateBefore(
        String email, BookingStatus status, LocalDate checkOutDate
    );

    // FEATURE1: Manager xem tat ca booking
    List<Booking> findAllByOrderByCreatedAtDesc();

    @Query("""
        select b from Booking b
        where (:status is null or b.status = :status)
          and (:email is null or lower(b.user.email) like lower(concat('%', :email, '%')))
          and (:checkIn is null or b.checkInDate >= :checkIn)
          and (:checkOut is null or b.checkOutDate <= :checkOut)
        order by b.createdAt desc
    """)
    List<Booking> findAllFiltered(
        @Param("status") BookingStatus status,
        @Param("email") String email,
        @Param("checkIn") LocalDate checkIn,
        @Param("checkOut") LocalDate checkOut
    );

    // FEATURE4: Doanh thu theo thang
    @Query("""
        select function('MONTH', b.createdAt), sum(b.totalAmount), count(b)
        from Booking b
        where b.status in :statuses
          and function('YEAR', b.createdAt) = :year
        group by function('MONTH', b.createdAt)
        order by function('MONTH', b.createdAt)
    """)
    List<Object[]> revenueByMonth(
        @Param("statuses") Collection<BookingStatus> statuses,
        @Param("year") int year
    );

    // FEATURE4: Thong ke booking theo status
    @Query("select b.status, count(b) from Booking b group by b.status")
    List<Object[]> countGroupByStatus();
}
