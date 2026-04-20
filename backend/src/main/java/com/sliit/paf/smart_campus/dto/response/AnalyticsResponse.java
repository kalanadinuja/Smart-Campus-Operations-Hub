package com.sliit.paf.smart_campus.dto.response;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

/**
 * Response DTO for admin analytics dashboard (Innovation Feature #1).
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class AnalyticsResponse {
    private long totalResources;
    private long totalBookings;
    private long totalTickets;
    private long totalUsers;
    private long pendingBookings;
    private long openTickets;

    /** Most booked resources: resourceName -> booking count */
    private List<Map<String, Object>> mostBookedResources;

    /** Bookings per day for the last 30 days */
    private List<Map<String, Object>> bookingTrends;

    /** Tickets by status */
    private Map<String, Long> ticketsByStatus;

    /** Tickets by priority */
    private Map<String, Long> ticketsByPriority;

    /** Peak booking hours: hour -> count */
    private List<Map<String, Object>> peakBookingHours;
}
