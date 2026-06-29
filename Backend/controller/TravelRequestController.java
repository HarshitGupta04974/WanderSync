package com.travel.controller;

import com.travel.dto.TravelRequestResponse;
import com.travel.model.sql.User;
import com.travel.repository.sql.UserRepository;
import com.travel.service.TravelRequestService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/requests")
public class TravelRequestController {

    private final TravelRequestService requestService;
    private final UserRepository userRepository;

    public TravelRequestController(TravelRequestService requestService, UserRepository userRepository) {
        this.requestService = requestService;
        this.userRepository = userRepository;
    }

    @PostMapping("/post/{postId}")
    public ResponseEntity<TravelRequestResponse> requestToJoin(
            @PathVariable Long postId,
            @RequestHeader("X-User-Email") String email) {

        User requester = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return ResponseEntity.ok(requestService.createRequest(postId, requester));
    }

    @PostMapping("/{requestId}/accept")
    public ResponseEntity<String> acceptRequest(
            @PathVariable Long requestId,
            @RequestHeader("X-User-Email") String email) {

        User poster = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        requestService.acceptRequest(requestId, poster);
        return ResponseEntity.ok("Match confirmed!");
    }

    @PostMapping("/{requestId}/reject")
    public ResponseEntity<String> rejectRequest(
            @PathVariable Long requestId,
            @RequestHeader("X-User-Email") String email) {

        User poster = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        requestService.rejectRequest(requestId, poster);
        return ResponseEntity.ok("Pass processed.");
    }

    @GetMapping("/pending")
    public ResponseEntity<List<TravelRequestResponse>> getIncomingRequestsForMyPosts(
            @RequestHeader("X-User-Email") String email) {

        User poster = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return ResponseEntity.ok(requestService.getPendingRequestsForPoster(poster));
    }

    @GetMapping("/my-requests")
    public ResponseEntity<List<TravelRequestResponse>> getMyOutgoingRequests(
            @RequestHeader("X-User-Email") String email) {

        User requester = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return ResponseEntity.ok(requestService.getMyOutgoingRequests(requester));
    }

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("REQUESTS OK");
    }
}