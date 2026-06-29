package com.travel.dto;
import java.time.LocalDateTime;
public record TravelPostResponse(
        Long id,
        String origin,
        String destination,
        LocalDateTime departureTime,
        boolean femaleOnly,
        String posterName
) {}
