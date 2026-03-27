package com.rexhotel.booking.booking;

import java.security.Principal;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.rexhotel.booking.booking.dto.BookingResponse;
import com.rexhotel.booking.booking.dto.HoldBookingRequest;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping("/hold")
    public ResponseEntity<BookingResponse> hold(@Validated @RequestBody HoldBookingRequest request, Principal principal) {
        return ResponseEntity.ok(bookingService.holdRoom(principal.getName(), request));
    }

    @GetMapping("/my")
    public ResponseEntity<List<BookingResponse>> myBookings(Principal principal) {
        return ResponseEntity.ok(bookingService.myBookings(principal.getName()));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<BookingResponse> cancel(@PathVariable("id") Long id, Principal principal) {
        return ResponseEntity.ok(bookingService.cancel(id, principal.getName()));
    }
}
