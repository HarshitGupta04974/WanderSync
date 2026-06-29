package com.travel.dto;

public record TravelRequestResponse(
        Long id,
        String status,
        String requesterName,
        Long postId,          // NEW - lets frontend group requests under the right post card
        String postOrigin,    // NEW
        String postDestination // NEW
) {}
