package com.travel.service;

import com.travel.model.sql.TravelPost;
import com.travel.repository.sql.TravelPostRepository;
import java.util.List;

public interface PostSearchStrategy {
    List<TravelPost> search(TravelPostRepository repository);
}
