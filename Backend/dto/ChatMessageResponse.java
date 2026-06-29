package com.travel.dto;
import java.time.Instant;
public record ChatMessageResponse(
        String messageId,
        Long senderId,
        String senderName,
        String content,
        Instant sentAt
) {}