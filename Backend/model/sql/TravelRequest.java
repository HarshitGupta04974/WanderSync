package com.travel.model.sql;


import  com.travel.model.RequestStatus;
import  com.travel.state.*;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "travel_requests", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"post_id", "requester_id"})
})
@Getter
@Setter
@NoArgsConstructor
public class TravelRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", nullable = false)
    private TravelPost travelPost;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requester_id", nullable = false)
    private User requester;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private RequestStatus status = RequestStatus.PENDING;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Transient
    private RequestState currentState;

    @PostLoad
    public void initializeState() {
        switch (this.status) {
            case PENDING  -> this.currentState = new PendingState();
            case ACCEPTED -> this.currentState = new AcceptedState();
            case REJECTED -> this.currentState = new RejectedState();
        }
    }

    public void accept() {
        if (this.currentState == null) initializeState();
        this.currentState.accept(this);
    }

    public void reject() {
        if (this.currentState == null) initializeState();
        this.currentState.reject(this);
    }
}