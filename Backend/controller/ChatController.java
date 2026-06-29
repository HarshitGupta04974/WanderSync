package com.travel.controller;

import com.travel.dto.ChatMessagePayload;
import com.travel.dto.ChatMessageResponse;
import com.travel.service.ChatMessageService;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
public class ChatController {

    private final SimpMessagingTemplate messagingTemplate;
    private final ChatMessageService chatService;

    public ChatController(SimpMessagingTemplate messagingTemplate, ChatMessageService chatService) {
        this.messagingTemplate = messagingTemplate;
        this.chatService = chatService;
    }

    @MessageMapping("/chat/{requestId}/{senderEmail}/send")
    public void sendMessage(
            @DestinationVariable Long requestId,
            @DestinationVariable String senderEmail,
            @Payload ChatMessagePayload payload) {

        ChatMessageResponse response = chatService.saveAndFormatMessageByEmail(requestId, senderEmail, payload.content());
        messagingTemplate.convertAndSend("/topic/chat/" + requestId, response);
    }

    @GetMapping("/api/v1/chat/ws/health")
    @ResponseBody
    public String wsHealth() {
        return "CHAT WS OK";
    }
}