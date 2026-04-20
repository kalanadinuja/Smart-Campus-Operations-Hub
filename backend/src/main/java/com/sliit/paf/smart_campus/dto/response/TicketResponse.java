package com.sliit.paf.smart_campus.dto.response;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

/**
 * Response DTO for Ticket data.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TicketResponse {
    private String id;
    private String resourceId;
    private String resourceName;
    private String userId;
    private String userName;
    private String category;
    private String description;
    private String priority;
    private String contactDetails;
    private String status;
    private String assignedTechnicianId;
    private String assignedTechnicianName;
    private String resolutionNotes;
    private List<String> imageUrls;
    private int commentCount;
    private Instant createdAt;
    private Instant updatedAt;
}
