package com.rexhotel.booking.room.dto;

import java.math.BigDecimal;
import java.util.List;

public record RoomResponse(
    Long id,
    String code,
    Integer floorNumber,
    String status,
    Long roomTypeId,
    String roomTypeName,
    BigDecimal basePrice,
    Integer maxGuests,
    String imageUrl,
    List<String> images,
    String description,
    // Tiện nghi
    boolean hasTv,
    boolean hasWasher,
    boolean hasBalcony,
    boolean hasKitchen,
    int bedDouble,
    int bedSingle
) {}
