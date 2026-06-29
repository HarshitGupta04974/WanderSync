package com.travel.service;

import com.travel.dto.CreatePostRequest;
import com.travel.dto.TravelPostResponse;
import com.travel.model.PostStatus;
import com.travel.model.sql.TravelPost;
import com.travel.model.sql.User;
import com.travel.repository.sql.TravelPostRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class TravelPostService {

    private final TravelPostRepository postRepository;

    public TravelPostService(TravelPostRepository postRepository) {
        this.postRepository = postRepository;
    }

    @Transactional(readOnly = true)
    public List<TravelPostResponse> getAvailablePosts(User authenticatedUser) {
        return postRepository.findByStatus(PostStatus.OPEN).stream()
                .filter(post -> !post.isFemaleOnly() || authenticatedUser.getGender().name().equals("FEMALE"))
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional
    public TravelPostResponse createPost(CreatePostRequest request, User authenticatedUser) {
        TravelPost post = new TravelPost();
        post.setOrigin(request.origin());
        post.setDestination(request.destination());
        post.setDepartureTime(request.departureTime());
        post.setFemaleOnly(request.femaleOnly());
        post.setPoster(authenticatedUser);
        post.setStatus(PostStatus.OPEN);

        TravelPost saved = postRepository.save(post);
        return mapToResponse(saved);
    }

    private TravelPostResponse mapToResponse(TravelPost post) {
        return new TravelPostResponse(
                post.getId(),
                post.getOrigin(),
                post.getDestination(),
                post.getDepartureTime(),
                post.isFemaleOnly(),
                post.getPoster().getName()
        );
    }
}