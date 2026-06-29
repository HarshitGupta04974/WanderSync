package com.travel.dto;

import com.travel.model.Gender;

public record RegisterRequest(
        String name,
        String email,
        String password,
        Gender gender
) {}
