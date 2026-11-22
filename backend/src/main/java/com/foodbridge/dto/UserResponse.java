package com.foodbridge.dto;

import com.foodbridge.entity.Role;
import java.time.LocalDateTime;

public record UserResponse(
        Long id,
        String name,
        String email,
        Role role,
        LocalDateTime createdAt
) {
}
