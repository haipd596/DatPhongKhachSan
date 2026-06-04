package com.rexhotel.booking.room;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.rexhotel.booking.review.ReviewRepository;
import com.rexhotel.booking.room.dto.RoomTypeResponse;

/**
 * Public endpoints - không yêu cầu xác thực
 * Dùng cho trang giới thiệu khách sạn công khai
 */
@RestController
@RequestMapping("/api/hotel")
public class HotelController {

    private final RoomService roomService;
    private final ReviewRepository reviewRepository;

    public HotelController(RoomService roomService, ReviewRepository reviewRepository) {
        this.roomService = roomService;
        this.reviewRepository = reviewRepository;
    }

    @GetMapping("/room-types")
    public ResponseEntity<List<RoomTypeResponse>> getPublicRoomTypes() {
        return ResponseEntity.ok(roomService.getAllRoomTypes());
    }

    @GetMapping("/reviews")
    public ResponseEntity<List<Map<String, Object>>> getPublicReviews() {
        List<Map<String, Object>> reviews = reviewRepository.findAll().stream()
            .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
            .limit(20)
            .map(r -> Map.<String, Object>of(
                "id", r.getId(),
                "fullName", r.getUser().getFullName(),
                "rating", r.getRating(),
                "comment", r.getComment(),
                "createdAt", r.getCreatedAt()
            ))
            .toList();
        return ResponseEntity.ok(reviews);
    }

    @GetMapping("/info")
    public ResponseEntity<Map<String, Object>> getHotelInfo() {
        return ResponseEntity.ok(Map.of(
            "name", "Rex Hotel Saigon",
            "address", "141 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM",
            "phone", "+84 28 3829 2185",
            "email", "info@rexhotelsaigon.com",
            "checkIn", "14:00",
            "checkOut", "12:00",
            "description", "Rex Hotel Saigon tọa lạc ngay trung tâm thành phố, là biểu tượng lịch sử và sang trọng của Sài Gòn. Với hơn 60 năm lịch sử, khách sạn mang đến trải nghiệm đẳng cấp 5 sao cùng dịch vụ chuyên nghiệp.",
            "stars", 5
        ));
    }
}
