package com.rexhotel.booking.room.dto;

public record AvailabilitySummaryResponse(
    Long roomTypeId,
    String roomTypeName,
    long totalRooms,
    long reservedRooms,
    long availableRooms
) {
}
