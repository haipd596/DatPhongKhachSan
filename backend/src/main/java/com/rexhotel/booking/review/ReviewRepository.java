package com.rexhotel.booking.review;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findTop20ByOrderByCreatedAtDesc();

    @Query("select avg(r.rating) from Review r")
    Optional<Double> avgRating();
}
