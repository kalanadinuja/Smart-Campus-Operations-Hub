package com.sliit.paf.smart_campus.controller;

import com.sliit.paf.smart_campus.dto.request.BookingRequest;
import com.sliit.paf.smart_campus.dto.response.BookingResponse;
import com.sliit.paf.smart_campus.model.User;
import com.sliit.paf.smart_campus.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * REST controller for booking management.
 * POST returns 201 Created. Overlap returns 409 Conflict.
 */
@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    /** Create a booking – returns 409 if time slot conflicts */
    @PostMapping
    public ResponseEntity<BookingResponse> createBooking(
            @Valid @RequestBody BookingRequest request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(bookingService.createBooking(request, user));
    }

    /** Get all bookings with filters (Admin) */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<BookingResponse>> getAllBookings(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String resourceId) {
        return ResponseEntity.ok(bookingService.getAllBookings(status, resourceId));
    }

    /** Get current user's bookings */
    @GetMapping("/me")
    public ResponseEntity<List<BookingResponse>> getMyBookings(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(bookingService.getMyBookings(user.getId()));
    }

    /** Get a specific booking */
    @GetMapping("/{id}")
    public ResponseEntity<BookingResponse> getBookingById(@PathVariable String id) {
        return ResponseEntity.ok(bookingService.getBookingById(id));
    }

    /** Approve a pending booking (Admin) */
    @PutMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BookingResponse> approveBooking(@PathVariable String id) {
        return ResponseEntity.ok(bookingService.approveBooking(id));
    }

    /** Reject a pending booking with reason (Admin) */
    @PutMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BookingResponse> rejectBooking(
            @PathVariable String id, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(bookingService.rejectBooking(id, body.get("reason")));
    }

    /** Cancel own booking (User) */
    @PutMapping("/{id}/cancel")
    public ResponseEntity<BookingResponse> cancelBooking(
            @PathVariable String id, @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(bookingService.cancelBooking(id, user.getId()));
    }

    /** Get bookings for a resource in a date range (for calendar view) */
    @GetMapping("/resource/{resourceId}")
    public ResponseEntity<List<BookingResponse>> getResourceBookings(
            @PathVariable String resourceId,
            @RequestParam String start,
            @RequestParam String end) {
        return ResponseEntity.ok(bookingService.getResourceBookings(
                resourceId, LocalDate.parse(start), LocalDate.parse(end)));
    }
}
