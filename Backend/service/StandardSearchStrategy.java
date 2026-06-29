package com.travel.service;

import com.travel.model.sql.TravelPost;
import com.travel.model.PostStatus;
import com.travel.repository.sql.TravelPostRepository;
import java.util.List;

public class StandardSearchStrategy implements PostSearchStrategy {

    @Override
    public List<TravelPost> search(TravelPostRepository repository) {
        return repository.findByStatusAndFemaleOnlyFalse(PostStatus.OPEN);
    }
}
