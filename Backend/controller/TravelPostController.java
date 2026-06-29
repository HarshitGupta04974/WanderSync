package com.travel.controller;

import com.travel.dto.CreatePostRequest;
import com.travel.dto.TravelPostResponse;
import com.travel.model.sql.User;
import com.travel.repository.sql.UserRepository;
import com.travel.service.TravelPostService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/posts")
public class TravelPostController {

    private final TravelPostService postService;
    private final UserRepository userRepository;

    public TravelPostController(TravelPostService postService, UserRepository userRepository) {
        this.postService = postService;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<List<TravelPostResponse>> getPosts(@RequestHeader("X-User-Email") String email) {
        User authenticatedUser = userRepository.findByEmail(email).orElse(null);
        if (authenticatedUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(postService.getAvailablePosts(authenticatedUser));
    }

    @PostMapping
    public ResponseEntity<TravelPostResponse> createPost(
            @RequestBody CreatePostRequest request,
            @RequestHeader("X-User-Email") String email) {

        User authenticatedUser = userRepository.findByEmail(email).orElse(null);
        if (authenticatedUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(postService.createPost(request, authenticatedUser));
    }

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("POSTS OK");
    }
}