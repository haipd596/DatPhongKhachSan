package com.rexhotel.booking.room.dto;

import java.math.BigDecimal;

public record RoomResponse(
    Long id,
    String code,
    Integer floorNumber,
    String status,
    Long roomTypeId,
    String roomTypeName,
    BigDecimal basePrice,
    Integer maxGuests
) {
}
