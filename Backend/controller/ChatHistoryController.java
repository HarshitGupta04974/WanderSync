package com.travel.controller;

import com.travel.dto.ChatMessageResponse;
import com.travel.service.ChatMessageService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/chat")
public class ChatHistoryController {

    private final ChatMessageService chatService;

    public ChatHistoryController(ChatMessageService chatService) {
        this.chatService = chatService;
    }

    @GetMapping("/{requestId}/history")
    public ResponseEntity<List<ChatMessageResponse>> getHistory(
            @PathVariable Long requestId,
            @RequestHeader("X-User-Email") String email) {

        return ResponseEntity.ok(chatService.getChatHistory(requestId, email));
    }

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("CHAT HISTORY OK");
    }
}