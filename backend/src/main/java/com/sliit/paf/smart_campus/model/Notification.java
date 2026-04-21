package com.sliit.paf.smart_campus.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import java.time.Instant;

/**
 * Notification entity for informing users about important events
 * such as booking approvals, ticket status changes, and new comments.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "notifications")
public class Notification {

    @Id
    private String id;

    @Indexed
    private String userId;

    private NotificationType type;
    private String message;
    private String relatedId; // ID of related booking/ticket
    private boolean read = false;
    private Instant createdAt = Instant.now();

    public enum NotificationType {
        BOOKING_APPROVED,
        BOOKING_REJECTED,
        BOOKING_CANCELLED,
        BOOKING_PENDING,
        TICKET_STATUS_CHANGE,
        TICKET_ASSIGNED,
        TICKET_COMMENT
    }
}
