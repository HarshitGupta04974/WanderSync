package com.travel.events;



import com.travel.model.sql.TravelRequest;
import org.springframework.context.ApplicationEvent;
public class RequestAcceptedEvent extends ApplicationEvent {

    private final TravelRequest request;

    public RequestAcceptedEvent(Object source, TravelRequest request) {
        super(source);
        this.request = request;
    }

    public TravelRequest getRequest() {
        return request;
    }
}
