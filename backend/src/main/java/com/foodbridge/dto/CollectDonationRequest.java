package com.foodbridge.dto;

import jakarta.validation.constraints.NotNull;

public record CollectDonationRequest(
        @NotNull Long ngoId
) {
}
