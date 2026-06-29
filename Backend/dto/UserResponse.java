package com.travel.dto;

public record UserResponse(
        Long id,
        String name,
        String email,
        String gender
) {}
