package com.sliit.paf.smart_campus.dto.response;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.time.Instant;

/**
 * Response DTO for Notification data.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponse {
    private String id;
    private String type;
    private String message;
    private String relatedId;
    private boolean read;
    private Instant createdAt;
}
