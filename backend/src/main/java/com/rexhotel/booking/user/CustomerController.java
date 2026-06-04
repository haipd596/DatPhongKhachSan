package com.rexhotel.booking.user;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.Principal;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.rexhotel.booking.common.ApiException;
import com.rexhotel.booking.user.dto.UpdateProfileRequest;
import com.rexhotel.booking.user.dto.UserProfileResponse;

@RestController
@RequestMapping("/api/customers")
public class CustomerController {

    private final UserRepository userRepository;
    private final VipPolicyService vipPolicyService;
    private final String uploadDir;

    public CustomerController(UserRepository userRepository,
                              VipPolicyService vipPolicyService,
                              @Value("${app.upload.dir:uploads}") String uploadDir) {
        this.userRepository = userRepository;
        this.vipPolicyService = vipPolicyService;
        this.uploadDir = uploadDir;
    }

    @GetMapping("/me/vip")
    public ResponseEntity<Map<String, Object>> myVip(Principal principal) {
        User user = findUser(principal);
        return ResponseEntity.ok(Map.of(
            "bookingCount", user.getBookingCount(),
            "vipLevel", user.getVipLevel().name(),
            "discountRate", vipPolicyService.discountRate(user.getVipLevel())
        ));
    }

    @GetMapping("/me/profile")
    public ResponseEntity<UserProfileResponse> getProfile(Principal principal) {
        User user = findUser(principal);
        return ResponseEntity.ok(toProfileResponse(user));
    }

    @PutMapping("/me/profile")
    public ResponseEntity<UserProfileResponse> updateProfile(Principal principal, @RequestBody UpdateProfileRequest req) {
        User user = findUser(principal);
        if (req.fullName() != null && !req.fullName().isBlank()) user.setFullName(req.fullName().trim());
        if (req.phone() != null) user.setPhone(req.phone().trim());
        if (req.gender() != null) user.setGender(req.gender());
        if (req.dateOfBirth() != null) user.setDateOfBirth(req.dateOfBirth());
        if (req.avatarUrl() != null) user.setAvatarUrl(req.avatarUrl());
        userRepository.save(user);
        return ResponseEntity.ok(toProfileResponse(user));
    }

    @PostMapping(value = "/me/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, String>> uploadAvatar(Principal principal,
                                                             @RequestParam("file") MultipartFile file) {
        User user = findUser(principal);
        String url = saveFile(file, "avatars");
        user.setAvatarUrl(url);
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("url", url));
    }

    // Endpoint upload ảnh chung (dùng cho room type images)
    @PostMapping(value = "/upload/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, String>> uploadImage(@RequestParam("file") MultipartFile file) {
        String url = saveFile(file, "rooms");
        return ResponseEntity.ok(Map.of("url", url));
    }

    private String saveFile(MultipartFile file, String subDir) {
        if (file.isEmpty()) throw new ApiException("File không được để trống");
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new ApiException("Chỉ chấp nhận file ảnh");
        }
        try {
            String ext = "";
            String original = file.getOriginalFilename();
            if (original != null && original.contains(".")) {
                ext = original.substring(original.lastIndexOf("."));
            }
            String filename = UUID.randomUUID() + ext;
            Path dir = Paths.get(uploadDir, subDir);
            Files.createDirectories(dir);
            file.transferTo(dir.resolve(filename).toFile());
            return "/uploads/" + subDir + "/" + filename;
        } catch (IOException e) {
            throw new ApiException("Lỗi upload file: " + e.getMessage());
        }
    }

    private User findUser(Principal principal) {
        return userRepository.findByEmail(principal.getName())
            .orElseThrow(() -> new ApiException("Không tìm thấy người dùng"));
    }

    private UserProfileResponse toProfileResponse(User user) {
        return new UserProfileResponse(
            user.getId(),
            user.getEmail(),
            user.getFullName(),
            user.getPhone(),
            user.getGender(),
            user.getDateOfBirth(),
            user.getAvatarUrl(),
            user.getVipLevel().name(),
            user.getBookingCount()
        );
    }
}
