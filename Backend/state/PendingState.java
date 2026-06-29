package com.travel.state;


import com.travel.model.sql.TravelRequest;
import com.travel.model.RequestStatus;

public class PendingState implements RequestState {
    @Override
    public void accept(TravelRequest request) {
        request.setStatus(RequestStatus.ACCEPTED);
        request.setCurrentState(new AcceptedState());
    }

    @Override
    public void reject(TravelRequest request) {
        request.setStatus(RequestStatus.REJECTED);
        request.setCurrentState(new RejectedState());
    }
}