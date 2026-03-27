package com.rexhotel.booking.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ResetPasswordRequest(
    @NotBlank @Size(min = 6, max = 72) String newPassword,
    @NotBlank @Size(min = 6, max = 8) String code
) {
}
