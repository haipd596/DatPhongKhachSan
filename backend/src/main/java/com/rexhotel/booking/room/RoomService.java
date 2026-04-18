package com.rexhotel.booking.room;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Set;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.rexhotel.booking.booking.BookingRepository;
import com.rexhotel.booking.booking.BookingStatus;
import com.rexhotel.booking.common.ApiException;
import com.rexhotel.booking.room.dto.AvailabilitySummaryResponse;
import com.rexhotel.booking.room.dto.RoomRequest;
import com.rexhotel.booking.room.dto.RoomResponse;
import com.rexhotel.booking.room.dto.RoomTypeRequest;
import com.rexhotel.booking.room.dto.RoomTypeResponse;

@Service
public class RoomService {

    private static final Set<BookingStatus> BLOCKING_STATUSES = Set.of(
        BookingStatus.HOLD, BookingStatus.CONFIRMED, BookingStatus.CHECKED_IN
    );
    private static final Set<BookingStatus> ACTIVE_STATUSES = Set.of(
        BookingStatus.HOLD, BookingStatus.CONFIRMED, BookingStatus.CHECKED_IN
    );

    private final RoomTypeRepository roomTypeRepository;
    private final RoomRepository roomRepository;
    private final BookingRepository bookingRepository;

    public RoomService(RoomTypeRepository roomTypeRepository, RoomRepository roomRepository, BookingRepository bookingRepository) {
        this.roomTypeRepository = roomTypeRepository;
        this.roomRepository = roomRepository;
        this.bookingRepository = bookingRepository;
    }

    public List<RoomTypeResponse> getAllRoomTypes() {
        return roomTypeRepository.findAll().stream().map(this::toRoomTypeResponse).toList();
    }

    public List<RoomResponse> getAllRooms() {
        return roomRepository.findAll().stream().map(this::toRoomResponse).toList();
    }

    @Transactional
    public RoomTypeResponse createRoomType(RoomTypeRequest request) {
        if (roomTypeRepository.findByNameIgnoreCase(request.name().trim()).isPresent()) {
            throw new ApiException("Loai phong da ton tai");
        }
        RoomType roomType = new RoomType(
            request.name().trim(),
            request.basePrice(),
            request.maxGuests(),
            request.description(),
            request.imageUrl()
        );
        roomTypeRepository.save(roomType);
        return toRoomTypeResponse(roomType);
    }

    @Transactional
    public RoomTypeResponse updateRoomType(Long id, RoomTypeRequest request) {
        RoomType roomType = roomTypeRepository.findById(id).orElseThrow(() -> new ApiException("Khong tim thay loai phong"));
        roomType.setName(request.name().trim());
        roomType.setBasePrice(request.basePrice());
        roomType.setMaxGuests(request.maxGuests());
        roomType.setDescription(request.description());
        roomType.setImageUrl(request.imageUrl());
        roomTypeRepository.save(roomType);
        return toRoomTypeResponse(roomType);
    }

    @Transactional
    public void deleteRoomType(Long id) {
        // BUG3: Kiem tra co phong nao dang su dung loai phong nay khong
        if (roomRepository.existsByRoomTypeId(id)) {
            throw new ApiException("Khong the xoa loai phong dang co phong su dung. Vui long xoa cac phong truoc.");
        }
        roomTypeRepository.deleteById(id);
    }

    @Transactional
    public RoomResponse createRoom(RoomRequest request) {
        if (roomRepository.findByCode(request.code().trim()).isPresent()) {
            throw new ApiException("Ma phong da ton tai");
        }
        RoomType roomType = roomTypeRepository.findById(request.roomTypeId())
            .orElseThrow(() -> new ApiException("Loai phong khong ton tai"));
        Room room = new Room(request.code().trim().toUpperCase(), request.floorNumber(), roomType);
        room.setStatus(parseRoomStatus(request.status()));
        roomRepository.save(room);
        return toRoomResponse(room);
    }

    @Transactional
    public RoomResponse updateRoom(Long id, RoomRequest request) {
        Room room = roomRepository.findById(id).orElseThrow(() -> new ApiException("Khong tim thay phong"));
        RoomType roomType = roomTypeRepository.findById(request.roomTypeId())
            .orElseThrow(() -> new ApiException("Loai phong khong ton tai"));
        room.setCode(request.code().trim().toUpperCase());
        room.setFloorNumber(request.floorNumber());
        room.setRoomType(roomType);
        room.setStatus(parseRoomStatus(request.status()));
        roomRepository.save(room);
        return toRoomResponse(room);
    }

    @Transactional
    public void deleteRoom(Long id) {
        // BUG3: Kiem tra con booking active khong truoc khi xoa
        if (bookingRepository.existsByRoomIdAndStatusIn(id, ACTIVE_STATUSES)) {
            throw new ApiException("Khong the xoa phong dang co dat phong (HOLD/CONFIRMED/CHECKED_IN). Vui long xu ly cac booking truoc.");
        }
        roomRepository.deleteById(id);
    }

    // FEATURE6: Tim phong kha dung voi filter nang cao
    public List<RoomResponse> getAvailableRooms(LocalDate checkIn, LocalDate checkOut,
                                                 Long roomTypeId, BigDecimal minPrice,
                                                 BigDecimal maxPrice, Integer maxGuests) {
        validateDateRange(checkIn, checkOut);
        return roomRepository.findByStatus(RoomStatus.AVAILABLE).stream()
            .filter(room -> {
                RoomType rt = room.getRoomType();
                if (roomTypeId != null && !rt.getId().equals(roomTypeId)) return false;
                if (maxGuests != null && rt.getMaxGuests() < maxGuests) return false;
                if (minPrice != null && rt.getBasePrice().compareTo(minPrice) < 0) return false;
                if (maxPrice != null && rt.getBasePrice().compareTo(maxPrice) > 0) return false;
                return bookingRepository.countOverlapping(room.getId(), BLOCKING_STATUSES, checkIn, checkOut) == 0;
            })
            .map(this::toRoomResponse)
            .toList();
    }

    public List<AvailabilitySummaryResponse> getAvailabilitySummary(LocalDate checkInDate, LocalDate checkOutDate) {
        validateDateRange(checkInDate, checkOutDate);
        return roomTypeRepository.findAll().stream().map(roomType -> {
            long total = roomRepository.countByRoomTypeIdAndStatus(roomType.getId(), RoomStatus.AVAILABLE);
            long reserved = bookingRepository.countOverlappingByRoomType(
                roomType.getId(), BLOCKING_STATUSES, checkInDate, checkOutDate
            );
            long available = Math.max(total - reserved, 0);
            return new AvailabilitySummaryResponse(roomType.getId(), roomType.getName(), total, reserved, available);
        }).toList();
    }

    private void validateDateRange(LocalDate checkInDate, LocalDate checkOutDate) {
        if (checkInDate == null || checkOutDate == null) {
            throw new ApiException("Can truyen checkIn va checkOut");
        }
        if (!checkInDate.isBefore(checkOutDate)) {
            throw new ApiException("Check-out phai sau check-in");
        }
    }

    private RoomTypeResponse toRoomTypeResponse(RoomType roomType) {
        return new RoomTypeResponse(
            roomType.getId(),
            roomType.getName(),
            roomType.getBasePrice(),
            roomType.getMaxGuests(),
            roomType.getDescription(),
            roomType.getImageUrl()
        );
    }

    private RoomResponse toRoomResponse(Room room) {
        RoomType type = room.getRoomType();
        return new RoomResponse(
            room.getId(),
            room.getCode(),
            room.getFloorNumber(),
            room.getStatus().name(),
            type.getId(),
            type.getName(),
            type.getBasePrice(),
            type.getMaxGuests(),
            type.getImageUrl()
        );
    }

    private RoomStatus parseRoomStatus(String value) {
        try {
            return RoomStatus.valueOf(value.toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new ApiException("Trang thai phong khong hop le. Chap nhan: AVAILABLE, MAINTENANCE");
        }
    }
}
