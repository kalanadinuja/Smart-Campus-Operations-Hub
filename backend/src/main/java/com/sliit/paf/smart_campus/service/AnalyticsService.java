package com.sliit.paf.smart_campus.service;

import com.sliit.paf.smart_campus.dto.response.AnalyticsResponse;
import com.sliit.paf.smart_campus.model.Booking;
import com.sliit.paf.smart_campus.model.Ticket;
import com.sliit.paf.smart_campus.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Analytics service for admin dashboard (Innovation Feature #1).
 * Provides insights on most booked resources, peak hours, and ticket trends.
 */
@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final BookingRepository bookingRepository;
    private final TicketRepository ticketRepository;
    private final ResourceRepository resourceRepository;
    private final UserRepository userRepository;

    public AnalyticsResponse getAnalytics() {
        AnalyticsResponse analytics = new AnalyticsResponse();
        analytics.setTotalResources(resourceRepository.count());
        analytics.setTotalBookings(bookingRepository.count());
        analytics.setTotalTickets(ticketRepository.count());
        analytics.setTotalUsers(userRepository.count());
        analytics.setPendingBookings(bookingRepository.findByStatus(
                Booking.BookingStatus.PENDING).size());
        analytics.setOpenTickets(ticketRepository.countByStatus(Ticket.TicketStatus.OPEN));

        // Most booked resources
        List<Booking> allBookings = bookingRepository.findAll();
        Map<String, Long> resourceBookingCount = allBookings.stream()
                .collect(Collectors.groupingBy(
                        b -> b.getResourceName() != null ? b.getResourceName() : "Unknown",
                        Collectors.counting()));
        List<Map<String, Object>> mostBooked = resourceBookingCount.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(5)
                .map(e -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("name", e.getKey());
                    m.put("count", e.getValue());
                    return m;
                }).collect(Collectors.toList());
        analytics.setMostBookedResources(mostBooked);

        // Booking trends (last 30 days)
        LocalDate thirtyDaysAgo = LocalDate.now().minusDays(30);
        List<Booking> recentBookings = bookingRepository.findByDateBetween(thirtyDaysAgo, LocalDate.now());
        Map<String, Long> dailyBookings = recentBookings.stream()
                .collect(Collectors.groupingBy(
                        b -> b.getDate().toString(), Collectors.counting()));
        List<Map<String, Object>> trends = dailyBookings.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(e -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("date", e.getKey());
                    m.put("count", e.getValue());
                    return m;
                }).collect(Collectors.toList());
        analytics.setBookingTrends(trends);

        // Tickets by status
        List<Ticket> allTickets = ticketRepository.findAll();
        Map<String, Long> byStatus = allTickets.stream()
                .collect(Collectors.groupingBy(t -> t.getStatus().name(), Collectors.counting()));
        analytics.setTicketsByStatus(byStatus);

        // Tickets by priority
        Map<String, Long> byPriority = allTickets.stream()
                .collect(Collectors.groupingBy(t -> t.getPriority().name(), Collectors.counting()));
        analytics.setTicketsByPriority(byPriority);

        // Peak booking hours
        Map<Integer, Long> hourCounts = allBookings.stream()
                .filter(b -> b.getStartTime() != null)
                .collect(Collectors.groupingBy(b -> b.getStartTime().getHour(), Collectors.counting()));
        List<Map<String, Object>> peakHours = hourCounts.entrySet().stream()
                .sorted(Map.Entry.<Integer, Long>comparingByValue().reversed())
                .map(e -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("hour", e.getKey() + ":00");
                    m.put("count", e.getValue());
                    return m;
                }).collect(Collectors.toList());
        analytics.setPeakBookingHours(peakHours);

        return analytics;
    }
}
