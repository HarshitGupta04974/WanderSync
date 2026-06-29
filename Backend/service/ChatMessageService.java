package com.travel.service;

import com.travel.dto.ChatMessageResponse;
import com.travel.model.RequestStatus;
import com.travel.model.mongo.ChatMessage;
import com.travel.model.sql.TravelRequest;
import com.travel.model.sql.User;
import com.travel.repository.mongo.ChatMessageRepository;
import com.travel.repository.sql.TravelRequestRepository;
import com.travel.repository.sql.UserRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ChatMessageService {

    private final ChatMessageRepository chatRepository;
    private final UserRepository userRepository;
    private final TravelRequestRepository travelRequestRepository;

    public ChatMessageService(ChatMessageRepository chatRepository,
                              UserRepository userRepository,
                              TravelRequestRepository travelRequestRepository) {
        this.chatRepository = chatRepository;
        this.userRepository = userRepository;
        this.travelRequestRepository = travelRequestRepository;
    }

    public ChatMessageResponse saveAndFormatMessageByEmail(Long requestId, String senderEmail, String content) {
        User sender = userRepository.findByEmail(senderEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + senderEmail));
        return saveAndFormatMessage(requestId, sender, content);
    }

    public ChatMessageResponse saveAndFormatMessage(Long requestId, User sender, String content) {
        ChatMessage message = new ChatMessage();
        message.setRequestId(requestId);
        message.setSenderId(sender.getId());
        message.setContent(content);
        message.setSentAt(Instant.now());

        ChatMessage saved = chatRepository.save(message);

        return new ChatMessageResponse(
                saved.getId(),
                sender.getId(),
                sender.getName(),
                saved.getContent(),
                saved.getSentAt()
        );
    }

    public List<ChatMessageResponse> getChatHistory(Long requestId, String userEmail) {
        TravelRequest request = travelRequestRepository.findByIdWithDetails(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Request not found"));

        String posterEmail    = request.getTravelPost().getPoster().getEmail();
        String requesterEmail = request.getRequester().getEmail();

        // Performs direct stateless email check matching across EC2 instances
        if (!userEmail.equalsIgnoreCase(posterEmail) && !userEmail.equalsIgnoreCase(requesterEmail)) {
            throw new SecurityException("Unauthorized access to chat history.");
        }
        if (RequestStatus.REJECTED.equals(request.getStatus())) {
            throw new SecurityException("This connection pipeline has been closed.");
        }

        List<ChatMessage> messages = chatRepository.findByRequestIdOrderBySentAtAsc(requestId);

        List<Long> senderIds = messages.stream()
                .map(ChatMessage::getSenderId)
                .distinct()
                .toList();

        Map<Long, String> userMap = userRepository.findAllById(senderIds).stream()
                .collect(Collectors.toMap(User::getId, User::getName));

        return messages.stream()
                .map(msg -> new ChatMessageResponse(
                        msg.getId(),
                        msg.getSenderId(),
                        userMap.getOrDefault(msg.getSenderId(), "Unknown"),
                        msg.getContent(),
                        msg.getSentAt()
                ))
                .toList();
    }
}