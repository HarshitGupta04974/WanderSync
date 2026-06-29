package com.travel.listeners;

import com.travel.events.RequestAcceptedEvent;
import com.travel.model.sql.TravelPost;
import com.travel.model.PostStatus;
import com.travel.model.sql.TravelRequest;
import com.travel.repository.sql.TravelPostRepository;
import com.travel.repository.sql.TravelRequestRepository;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Component
public class RequestAcceptedListener {

    private final TravelRequestRepository requestRepository;
    private final TravelPostRepository postRepository;

    public RequestAcceptedListener(TravelRequestRepository requestRepository, TravelPostRepository postRepository) {
        this.requestRepository = requestRepository;
        this.postRepository = postRepository;
    }

    @EventListener
    @Transactional // Required because we are modifying multiple entities
    public void handleRequestAccepted(RequestAcceptedEvent event) {
        TravelPost post = event.getRequest().getTravelPost();

        // 1. Close the Travel Post
        post.setStatus(PostStatus.CLOSED);
        postRepository.save(post);

        // 2. Fetch all OTHER requests for this post to reject them properly via State Pattern
        List<TravelRequest> otherRequests = requestRepository.findByTravelPostIdAndIdNot(
                post.getId(),
                event.getRequest().getId()
        );

        // 3. Trigger the reject() state transition on each competing request
        for (TravelRequest req : otherRequests) {
            req.reject();
        }

        requestRepository.saveAll(otherRequests);
    }
}