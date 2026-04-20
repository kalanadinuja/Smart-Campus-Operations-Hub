package com.sliit.paf.smart_campus.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * DTO for creating/updating a Comment on a ticket.
 */
@Data
public class CommentRequest {

    @NotBlank(message = "Comment text is required")
    private String text;
}
