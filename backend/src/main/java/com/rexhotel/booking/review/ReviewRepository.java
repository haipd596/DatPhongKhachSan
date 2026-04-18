package com.rexhotel.booking.review;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    List<Review> findTop20ByOrderByCreatedAtDesc();

    @Query("select avg(r.rating) from Review r")
    Optional<Double> avgRating();

    // BUG2: Kiem tra user da duoc CHECKED_OUT chua
    @Query("""
        select case when count(b) > 0 then true else false end
        from com.rexhotel.booking.booking.Booking b
        where b.user.email = :email
          and b.status = com.rexhotel.booking.booking.BookingStatus.CHECKED_OUT
    """)
    boolean existsByUserEmailAndHasCheckedOut(@Param("email") String email);
}
