package com.sliit.paf.smart_campus.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.CompoundIndex;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;

/**
 * Booking entity for reserving campus resources.
 * Enforces no overlapping bookings for the same resource and time range.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "bookings")
@CompoundIndex(name = "resource_date_idx", def = "{'resourceId': 1, 'date': 1}")
public class Booking {

    @Id
    private String id;

    private String resourceId;
    private String userId;
    private String userName;
    private String resourceName;
    private LocalDate date;
    private LocalTime startTime;
    private LocalTime endTime;
    private String purpose;
    private int expectedAttendees;
    private BookingStatus status = BookingStatus.PENDING;
    private String rejectionReason;
    private Instant createdAt = Instant.now();
    private Instant updatedAt = Instant.now();

    public enum BookingStatus {
        PENDING, APPROVED, REJECTED, CANCELLED
    }
}
