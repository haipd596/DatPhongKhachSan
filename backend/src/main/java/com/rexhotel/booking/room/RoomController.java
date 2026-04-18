package com.rexhotel.booking.room;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.rexhotel.booking.room.dto.AvailabilitySummaryResponse;
import com.rexhotel.booking.room.dto.RoomResponse;
import com.rexhotel.booking.room.dto.RoomTypeResponse;

@RestController
@RequestMapping("/api/rooms")
public class RoomController {

    private final RoomService roomService;

    public RoomController(RoomService roomService) {
        this.roomService = roomService;
    }

    @GetMapping("/types")
    public ResponseEntity<List<RoomTypeResponse>> getRoomTypes() {
        return ResponseEntity.ok(roomService.getAllRoomTypes());
    }

    /**
     * GET /api/rooms
     * FEATURE6: Filter nang cao:
     *   checkIn, checkOut     — loc phong trong khung thoi gian
     *   roomTypeId            — loc theo loai phong
     *   minPrice, maxPrice    — khoang gia/dem
     *   maxGuests             — so khach toi thieu can phong
     */
    @GetMapping
    public ResponseEntity<List<RoomResponse>> getRooms(
        @RequestParam(name = "checkIn", required = false)  @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkIn,
        @RequestParam(name = "checkOut", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkOut,
        @RequestParam(name = "roomTypeId", required = false) Long roomTypeId,
        @RequestParam(name = "minPrice", required = false) BigDecimal minPrice,
        @RequestParam(name = "maxPrice", required = false) BigDecimal maxPrice,
        @RequestParam(name = "maxGuests", required = false) Integer maxGuests
    ) {
        if (checkIn != null && checkOut != null) {
            return ResponseEntity.ok(
                roomService.getAvailableRooms(checkIn, checkOut, roomTypeId, minPrice, maxPrice, maxGuests)
            );
        }
        return ResponseEntity.ok(roomService.getAllRooms());
    }

    @GetMapping("/available-summary")
    public ResponseEntity<List<AvailabilitySummaryResponse>> getAvailableSummary(
        @RequestParam("checkIn")  @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkIn,
        @RequestParam("checkOut") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkOut
    ) {
        return ResponseEntity.ok(roomService.getAvailabilitySummary(checkIn, checkOut));
    }
}
