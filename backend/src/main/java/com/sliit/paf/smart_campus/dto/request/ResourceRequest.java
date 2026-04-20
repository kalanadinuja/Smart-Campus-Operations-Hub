package com.sliit.paf.smart_campus.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

/**
 * DTO for creating/updating a Resource.
 */
@Data
public class ResourceRequest {

    @NotBlank(message = "Resource name is required")
    private String name;

    @NotNull(message = "Resource type is required")
    private String type; // LECTURE_HALL, LAB, MEETING_ROOM, EQUIPMENT

    @Min(value = 1, message = "Capacity must be at least 1")
    private int capacity;

    @NotBlank(message = "Location is required")
    private String location;

    private String description;
    private String status; // ACTIVE, OUT_OF_SERVICE

    private List<TimeRangeRequest> availabilityWindows;

    @Data
    public static class TimeRangeRequest {
        private String dayOfWeek;
        private String startTime;
        private String endTime;
    }
}
