package com.rexhotel.booking.room;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "rooms")
public class Room {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 10)
    private String code;

    @Column(nullable = false)
    private Integer floorNumber;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "room_type_id", nullable = false)
    private RoomType roomType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private RoomStatus status;

    // Tiện nghi phòng
    @Column(nullable = false, columnDefinition = "boolean default false")
    private boolean hasTv = false;

    @Column(nullable = false, columnDefinition = "boolean default false")
    private boolean hasWasher = false;

    @Column(nullable = false, columnDefinition = "boolean default false")
    private boolean hasBalcony = false;

    @Column(nullable = false, columnDefinition = "boolean default false")
    private boolean hasKitchen = false;

    @Column(nullable = false, columnDefinition = "int default 0")
    private int bedDouble = 0;   // số giường đôi

    @Column(nullable = false, columnDefinition = "int default 0")
    private int bedSingle = 0;   // số giường đơn

    public Room() {}

    public Room(String code, Integer floorNumber, RoomType roomType) {
        this.code = code;
        this.floorNumber = floorNumber;
        this.roomType = roomType;
        this.status = RoomStatus.AVAILABLE;
    }

    public Long getId() { return id; }
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public Integer getFloorNumber() { return floorNumber; }
    public void setFloorNumber(Integer floorNumber) { this.floorNumber = floorNumber; }
    public RoomType getRoomType() { return roomType; }
    public void setRoomType(RoomType roomType) { this.roomType = roomType; }
    public RoomStatus getStatus() { return status; }
    public void setStatus(RoomStatus status) { this.status = status; }
    public boolean isHasTv() { return hasTv; }
    public void setHasTv(boolean hasTv) { this.hasTv = hasTv; }
    public boolean isHasWasher() { return hasWasher; }
    public void setHasWasher(boolean hasWasher) { this.hasWasher = hasWasher; }
    public boolean isHasBalcony() { return hasBalcony; }
    public void setHasBalcony(boolean hasBalcony) { this.hasBalcony = hasBalcony; }
    public boolean isHasKitchen() { return hasKitchen; }
    public void setHasKitchen(boolean hasKitchen) { this.hasKitchen = hasKitchen; }
    public int getBedDouble() { return bedDouble; }
    public void setBedDouble(int bedDouble) { this.bedDouble = bedDouble; }
    public int getBedSingle() { return bedSingle; }
    public void setBedSingle(int bedSingle) { this.bedSingle = bedSingle; }
}
