package com.travel.service;

import com.travel.dto.TravelRequestResponse;
import com.travel.model.RequestStatus;
import com.travel.model.sql.TravelPost;
import com.travel.model.sql.TravelRequest;
import com.travel.model.sql.User;
import com.travel.repository.sql.TravelPostRepository;
import com.travel.repository.sql.TravelRequestRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class TravelRequestService {

    private final TravelRequestRepository requestRepository;
    private final TravelPostRepository postRepository;

    public TravelRequestService(TravelRequestRepository requestRepository, TravelPostRepository postRepository) {
        this.requestRepository = requestRepository;
        this.postRepository = postRepository;
    }

    @Transactional
    public TravelRequestResponse createRequest(Long postId, User requester) {
        if (requestRepository.existsByTravelPostIdAndRequesterId(postId, requester.getId())) {
            throw new IllegalArgumentException("You have already expressed interest in this trip.");
        }

        TravelPost post = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("Trip post not found"));

        if (post.getPoster().getId().equals(requester.getId())) {
            throw new IllegalArgumentException("You cannot join your own travel post.");
        }

        TravelRequest request = new TravelRequest();
        request.setTravelPost(post);
        request.setRequester(requester);
        request.setStatus(RequestStatus.INTERESTED);

        TravelRequest saved = requestRepository.save(request);
        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<TravelRequestResponse> getPendingRequestsForPoster(User poster) {
        return requestRepository.findIncomingRequestsByPoster(poster).stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<TravelRequestResponse> getMyOutgoingRequests(User requester) {
        return requestRepository.findByRequester(requester).stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional
    public void acceptRequest(Long requestId, User poster) {
        TravelRequest request = requestRepository.findByIdWithDetails(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Request profile not found"));

        if (!request.getTravelPost().getPoster().getId().equals(poster.getId())) {
            throw new SecurityException("Unauthorized action: You do not own this post.");
        }

        request.setStatus(RequestStatus.ACCEPTED);
        requestRepository.save(request);
    }

    @Transactional
    public void rejectRequest(Long requestId, User poster) {
        TravelRequest request = requestRepository.findByIdWithDetails(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Request profile not found"));

        if (!request.getTravelPost().getPoster().getId().equals(poster.getId())) {
            throw new SecurityException("Unauthorized action: You do not own this post.");
        }

        request.setStatus(RequestStatus.REJECTED);
        requestRepository.save(request);
    }

    private TravelRequestResponse mapToResponse(TravelRequest req) {
        return new TravelRequestResponse(
                req.getId(),
                req.getStatus().name(),
                req.getRequester().getName(),
                req.getTravelPost().getId(),
                req.getTravelPost().getOrigin(),
                req.getTravelPost().getDestination()
        );
    }
}