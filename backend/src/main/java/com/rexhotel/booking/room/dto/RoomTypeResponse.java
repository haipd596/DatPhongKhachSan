package com.rexhotel.booking.room.dto;

import java.math.BigDecimal;

public record RoomTypeResponse(
    Long id,
    String name,
    BigDecimal basePrice,
    Integer maxGuests,
    String description,
    String imageUrl
) {}
