package com.sliit.paf.smart_campus.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/**
 * Ticket entity for maintenance and incident reporting.
 * Supports image attachments and technician assignment.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "tickets")
public class Ticket {

    @Id
    private String id;

    private String resourceId;
    private String resourceName;
    private String userId;
    private String userName;
    private String category;
    private String description;
    private TicketPriority priority = TicketPriority.MEDIUM;
    private String contactDetails;
    private TicketStatus status = TicketStatus.OPEN;
    private String assignedTechnicianId;
    private String assignedTechnicianName;
    private String resolutionNotes;
    private List<String> imageUrls = new ArrayList<>();
    private Instant createdAt = Instant.now();
    private Instant updatedAt = Instant.now();

    public enum TicketPriority {
        LOW, MEDIUM, HIGH, URGENT
    }

    public enum TicketStatus {
        OPEN, IN_PROGRESS, RESOLVED, CLOSED, REJECTED
    }
}
