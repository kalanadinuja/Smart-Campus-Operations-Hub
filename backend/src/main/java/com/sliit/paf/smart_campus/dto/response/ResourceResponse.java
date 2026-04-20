package com.sliit.paf.smart_campus.dto.response;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

/**
 * Response DTO for Resource data.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ResourceResponse {
    private String id;
    private String type;
    private String name;
    private int capacity;
    private String location;
    private String description;
    private String status;
    private List<TimeRangeResponse> availabilityWindows;
    private Instant createdAt;
    private Instant updatedAt;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TimeRangeResponse {
        private String dayOfWeek;
        private String startTime;
        private String endTime;
    }
}
