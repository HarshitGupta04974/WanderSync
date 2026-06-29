package com.travel.dto;

import java.time.LocalDateTime;

public record CreatePostRequest(
        String origin,
        String destination,
        LocalDateTime departureTime,
        boolean femaleOnly
) {}
