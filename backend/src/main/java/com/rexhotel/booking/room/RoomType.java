package com.rexhotel.booking.room;

import java.math.BigDecimal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "room_types")
public class RoomType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal basePrice;

    @Column(nullable = false)
    private Integer maxGuests;

    @Column(length = 500)
    private String description;

    // FEATURE6: Them anh dai dien cho loai phong
    @Column(length = 500)
    private String imageUrl;

    public RoomType() {}

    public RoomType(String name, BigDecimal basePrice, Integer maxGuests, String description, String imageUrl) {
        this.name = name;
        this.basePrice = basePrice;
        this.maxGuests = maxGuests;
        this.description = description;
        this.imageUrl = imageUrl;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public BigDecimal getBasePrice() { return basePrice; }
    public void setBasePrice(BigDecimal basePrice) { this.basePrice = basePrice; }
    public Integer getMaxGuests() { return maxGuests; }
    public void setMaxGuests(Integer maxGuests) { this.maxGuests = maxGuests; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
}
