package com.travel.state;



import com.travel.model.sql.TravelRequest;

public interface RequestState {
    void accept(TravelRequest request);
    void reject(TravelRequest request);
}
