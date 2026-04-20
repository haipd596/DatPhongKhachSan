package com.rexhotel.booking.user;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    // FEATURE8: Lay danh sach khach hang theo thu tu booking nhieu nhat ho tro phan trang
    org.springframework.data.domain.Page<User> findByRoleOrderByBookingCountDesc(UserRole role, org.springframework.data.domain.Pageable pageable);
}
