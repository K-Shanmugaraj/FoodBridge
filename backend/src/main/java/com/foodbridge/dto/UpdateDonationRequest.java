package com.foodbridge.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;

public record UpdateDonationRequest(
        @NotBlank @Size(max = 150) String foodName,
        @NotNull @Min(1) @Max(100000) Integer quantity,
        @NotNull LocalDateTime preparedTime,
        @NotNull LocalDateTime expiryTime,
        @NotBlank @Size(max = 255) String pickupLocation,
        @NotNull Long donorId
) {
}
