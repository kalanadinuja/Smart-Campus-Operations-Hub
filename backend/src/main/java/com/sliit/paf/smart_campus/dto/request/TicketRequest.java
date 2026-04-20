package com.sliit.paf.smart_campus.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * DTO for creating a Ticket (text fields only; images sent as multipart).
 */
@Data
public class TicketRequest {

    @NotBlank(message = "Resource ID is required")
    private String resourceId;

    @NotBlank(message = "Category is required")
    private String category;

    @NotBlank(message = "Description is required")
    private String description;

    @NotNull(message = "Priority is required")
    private String priority; // LOW, MEDIUM, HIGH, URGENT

    private String contactDetails;
}
