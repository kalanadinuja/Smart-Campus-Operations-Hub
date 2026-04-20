package com.sliit.paf.smart_campus.dto.response;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.time.Instant;

/**
 * Response DTO for Comment data.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CommentResponse {
    private String id;
    private String ticketId;
    private String userId;
    private String userName;
    private String text;
    private Instant createdAt;
    private Instant updatedAt;
}
