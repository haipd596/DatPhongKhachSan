package com.rexhotel.booking.review;

import java.security.Principal;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.rexhotel.booking.review.dto.ReviewRequest;
import com.rexhotel.booking.review.dto.ReviewResponse;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @PostMapping
    public ResponseEntity<ReviewResponse> createReview(@Validated @RequestBody ReviewRequest request, Principal principal) {
        return ResponseEntity.ok(reviewService.create(principal.getName(), request));
    }

    @GetMapping("/hotel")
    public ResponseEntity<List<ReviewResponse>> latestReviews() {
        return ResponseEntity.ok(reviewService.latest());
    }
}
