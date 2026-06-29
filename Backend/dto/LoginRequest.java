package com.travel.dto;

public record LoginRequest(
        String email,
        String password
) {}
