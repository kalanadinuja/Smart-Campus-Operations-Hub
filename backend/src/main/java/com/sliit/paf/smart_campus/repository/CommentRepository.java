package com.sliit.paf.smart_campus.repository;

import com.sliit.paf.smart_campus.model.Comment;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends MongoRepository<Comment, String> {
    List<Comment> findByTicketIdOrderByCreatedAtAsc(String ticketId);
    long countByTicketId(String ticketId);
    void deleteByUserId(String userId);
}
