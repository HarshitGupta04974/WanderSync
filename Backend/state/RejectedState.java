package com.travel.state;



import com.travel.model.sql.TravelRequest;

public class RejectedState implements RequestState {
    @Override
    public void accept(TravelRequest request) {
        throw new IllegalStateException("Cannot accept a previously rejected request.");
    }

    @Override
    public void reject(TravelRequest request) {
        throw new IllegalStateException("Request is already rejected.");
    }
}
