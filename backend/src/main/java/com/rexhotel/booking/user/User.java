package com.rexhotel.booking.user;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String passwordHash;

    @Column(nullable = false)
    private String fullName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private UserRole role;

    @Column(nullable = false)
    private Integer bookingCount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private VipLevel vipLevel;

    @Column(length = 20)
    private String phone;

    @Column(length = 10)
    private String gender;

    @Column
    private java.time.LocalDate dateOfBirth;

    @Column(length = 500)
    private String avatarUrl;

    @Column(name = "created_at")
    private java.time.LocalDateTime createdAt = java.time.LocalDateTime.now();

    public User() {
    }

    public User(String email, String passwordHash, String fullName, UserRole role) {
        this.email = email;
        this.passwordHash = passwordHash;
        this.fullName = fullName;
        this.role = role;
        this.bookingCount = 0;
        this.vipLevel = VipLevel.NORMAL;
        this.createdAt = java.time.LocalDateTime.now();
    }

    public Long getId() { return id; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public UserRole getRole() { return role; }
    public void setRole(UserRole role) { this.role = role; }
    public Integer getBookingCount() { return bookingCount; }
    public void setBookingCount(Integer bookingCount) { this.bookingCount = bookingCount; }
    public VipLevel getVipLevel() { return vipLevel; }
    public void setVipLevel(VipLevel vipLevel) { this.vipLevel = vipLevel; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }
    public java.time.LocalDate getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(java.time.LocalDate dateOfBirth) { this.dateOfBirth = dateOfBirth; }
    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }
    public java.time.LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(java.time.LocalDateTime createdAt) { this.createdAt = createdAt; }
}
