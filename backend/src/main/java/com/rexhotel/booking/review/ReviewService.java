package com.rexhotel.booking.review;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.rexhotel.booking.booking.BookingRepository;
import com.rexhotel.booking.booking.BookingStatus;
import com.rexhotel.booking.common.ApiException;
import com.rexhotel.booking.review.dto.ReviewRequest;
import com.rexhotel.booking.review.dto.ReviewResponse;
import com.rexhotel.booking.user.User;
import com.rexhotel.booking.user.UserRepository;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;

    public ReviewService(ReviewRepository reviewRepository,
                         UserRepository userRepository,
                         BookingRepository bookingRepository) {
        this.reviewRepository = reviewRepository;
        this.userRepository = userRepository;
        this.bookingRepository = bookingRepository;
    }

    @Transactional
    public ReviewResponse create(String email, ReviewRequest request) {
        // BUG2: Kiem tra user da co booking CONFIRMED va da checkout
        boolean hasCompletedStay = bookingRepository.existsByUserEmailAndStatusAndCheckOutDateBefore(
            email, BookingStatus.CONFIRMED, LocalDate.now()
        );
        // Cung chap nhan neu da CHECKED_OUT (trang thai moi)
        boolean hasCheckedOut = reviewRepository.existsByUserEmailAndHasCheckedOut(email);
        // Uu tien: chi can co mot trong hai dieu kien
        if (!hasCompletedStay && !hasCheckedOut) {
            throw new ApiException("Ban can hoan thanh it nhat mot lan o truoc khi danh gia");
        }
        User user = userRepository.findByEmail(email).orElseThrow(() -> new ApiException("Khong tim thay user"));
        Review review = new Review(user, request.rating(), request.comment().trim());
        reviewRepository.save(review);
        return toResponse(review);
    }

    public List<ReviewResponse> latest() {
        return reviewRepository.findTop20ByOrderByCreatedAtDesc().stream().map(this::toResponse).toList();
    }

    public double avgRating() {
        return reviewRepository.avgRating().orElse(0.0);
    }

    private ReviewResponse toResponse(Review review) {
        return new ReviewResponse(
            review.getId(),
            review.getUser().getFullName(),
            review.getRating(),
            review.getComment(),
            review.getCreatedAt()
        );
    }
}
