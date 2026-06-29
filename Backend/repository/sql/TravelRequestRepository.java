package com.travel.repository.sql;

import com.travel.model.sql.TravelRequest;
import com.travel.model.RequestStatus;
import com.travel.model.sql.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface TravelRequestRepository extends JpaRepository<TravelRequest, Long> {

    boolean existsByTravelPostIdAndRequesterId(Long postId, Long requesterId);

    List<TravelRequest> findByTravelPostIdAndIdNot(Long postId, Long excludedId);

    // Fixes LazyInitializationException in getChatHistory
    @Query("SELECT r FROM TravelRequest r " +
            "JOIN FETCH r.travelPost p " +
            "JOIN FETCH p.poster " +
            "JOIN FETCH r.requester " +
            "WHERE r.id = :id")
    Optional<TravelRequest> findByIdWithDetails(@Param("id") Long id);

    // UPDATED: Fetches all interactions across trips owned by the user (regardless of status)
    @Query("SELECT r FROM TravelRequest r " +
            "JOIN FETCH r.travelPost p " +
            "JOIN FETCH r.requester " +
            "WHERE p.poster = :poster")
    List<TravelRequest> findIncomingRequestsByPoster(@Param("poster") User poster);

    // NEW: For the Requester: Fetches their outgoing connection tracks across all statuses
    @Query("SELECT r FROM TravelRequest r " +
            "JOIN FETCH r.travelPost p " +
            "JOIN FETCH p.poster " +
            "WHERE r.requester = :requester")
    List<TravelRequest> findByRequester(@Param("requester") User requester);

    @Query("SELECT r FROM TravelRequest r " +
            "JOIN FETCH r.travelPost p " +
            "JOIN FETCH r.requester " +
            "WHERE p.poster.id = :posterId AND r.status = :status")
    List<TravelRequest> findByTravelPostPosterIdAndStatus(
            @Param("posterId") Long posterId,
            @Param("status") RequestStatus status
    );
}