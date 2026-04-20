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
 * Resource entity representing a campus facility or asset.
 * Types: LECTURE_HALL, LAB, MEETING_ROOM, EQUIPMENT.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "resources")
public class Resource {

    @Id
    private String id;

    private ResourceType type;
    private String name;
    private int capacity;
    private String location;
    private List<TimeRange> availabilityWindows = new ArrayList<>();
    private ResourceStatus status = ResourceStatus.ACTIVE;
    private String description;
    private Instant createdAt = Instant.now();
    private Instant updatedAt = Instant.now();

    public enum ResourceType {
        LECTURE_HALL, LAB, MEETING_ROOM, EQUIPMENT
    }

    public enum ResourceStatus {
        ACTIVE, OUT_OF_SERVICE
    }

    /**
     * Embedded time range for availability windows.
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TimeRange {
        private String dayOfWeek; // MONDAY, TUESDAY, etc.
        private String startTime; // HH:mm format
        private String endTime;   // HH:mm format
    }
}
