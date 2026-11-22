package com.foodbridge.dto;

public record AuthResponse(
        String token,
        String tokenType,
        UserResponse user
) {
}