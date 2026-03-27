package com.rexhotel.booking.dashboard;

import org.springframework.stereotype.Service;

import com.rexhotel.booking.booking.BookingRepository;
import com.rexhotel.booking.booking.BookingStatus;
import com.rexhotel.booking.review.ReviewService;
import com.rexhotel.booking.room.RoomRepository;
import com.rexhotel.booking.room.RoomStatus;

@Service
public class DashboardService {

    private final RoomRepository roomRepository;
    private final BookingRepository bookingRepository;
    private final ReviewService reviewService;

    public DashboardService(RoomRepository roomRepository, BookingRepository bookingRepository, ReviewService reviewService) {
        this.roomRepository = roomRepository;
        this.bookingRepository = bookingRepository;
        this.reviewService = reviewService;
    }

    public DashboardResponse getManagerDashboard() {
        long totalRooms = roomRepository.count();
        long availableRooms = roomRepository.findByStatus(RoomStatus.AVAILABLE).size();
        long confirmedBookings = bookingRepository.countByStatus(BookingStatus.CONFIRMED);
        return new DashboardResponse(
            totalRooms,
            availableRooms,
            confirmedBookings,
            bookingRepository.sumTotalByStatus(BookingStatus.CONFIRMED),
            reviewService.avgRating()
        );
    }
}
