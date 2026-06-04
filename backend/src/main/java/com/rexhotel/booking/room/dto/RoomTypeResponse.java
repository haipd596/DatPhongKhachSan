package com.rexhotel.booking.room.dto;

import java.math.BigDecimal;
import java.util.List;

public record RoomTypeResponse(
    Long id,
    String name,
    BigDecimal basePrice,
    Integer maxGuests,
    String description,
    String imageUrl,
    List<String> images
) {}
