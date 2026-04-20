package com.sliit.paf.smart_campus.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

/**
 * Comment entity for ticket discussions.
 * Only the comment owner can edit or delete their comment.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "comments")
public class Comment {

    @Id
    private String id;

    private String ticketId;
    private String userId;
    private String userName;
    private String text;
    private Instant createdAt = Instant.now();
    private Instant updatedAt = Instant.now();
}
