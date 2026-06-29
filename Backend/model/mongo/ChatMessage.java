package com.travel.model.mongo;


import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Document(collection = "chat_messages")
@Getter
@Setter
@NoArgsConstructor
public class ChatMessage {

    @Id
    private String id; // Note: MongoDB uses String (ObjectId) for IDs by default, not Long!

    private Long requestId; // This links back to your MySQL TravelRequest.id

    private Long senderId;  // This links back to your MySQL User.id

    private String content;

    private Instant sentAt = Instant.now();
}