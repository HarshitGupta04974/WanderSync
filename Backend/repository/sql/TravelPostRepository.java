package  com.travel.repository.sql;



import  com.travel.model.sql.TravelPost;
import  com.travel.model.PostStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TravelPostRepository extends JpaRepository<TravelPost, Long> {

    List<TravelPost> findByStatusAndFemaleOnlyFalse(PostStatus status);

    List<TravelPost> findByStatus(PostStatus status);
}
