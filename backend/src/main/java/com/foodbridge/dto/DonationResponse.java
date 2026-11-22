package com.foodbridge.dto;

import com.foodbridge.entity.DonationStatus;
import java.time.LocalDateTime;

public record DonationResponse(
        Long id,
        String foodName,
        Integer quantity,
        LocalDateTime preparedTime,
        LocalDateTime expiryTime,
        String pickupLocation,
        DonationStatus status,
        Long donorId,
        String donorName,
        Long collectedById,
        String collectedByName,
        LocalDateTime collectedAt,
        LocalDateTime createdAt
) {
}
