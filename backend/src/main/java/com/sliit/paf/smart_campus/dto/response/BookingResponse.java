package com.sliit.paf.smart_campus.dto.response;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.time.Instant;

/**
 * Response DTO for Booking data.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookingResponse {
    private String id;
    private String resourceId;
    private String resourceName;
    private String userId;
    private String userName;
    private String date;
    private String startTime;
    private String endTime;
    private String purpose;
    private int expectedAttendees;
    private String status;
    private String rejectionReason;
    private Instant createdAt;
    private Instant updatedAt;
}
