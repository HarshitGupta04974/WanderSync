package com.travel.state;


import  com.travel.model.sql.TravelRequest;

public class AcceptedState implements RequestState {
    @Override
    public void accept(TravelRequest request) {
        throw new IllegalStateException("Request is already accepted.");
    }

    @Override
    public void reject(TravelRequest request) {
        throw new IllegalStateException("Cannot reject a request after it is accepted.");
    }
}
