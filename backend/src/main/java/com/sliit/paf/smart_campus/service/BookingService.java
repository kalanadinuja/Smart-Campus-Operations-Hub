package com.sliit.paf.smart_campus.service;

import com.sliit.paf.smart_campus.dto.request.BookingRequest;
import com.sliit.paf.smart_campus.dto.response.BookingResponse;
import com.sliit.paf.smart_campus.exception.BadRequestException;
import com.sliit.paf.smart_campus.exception.BookingConflictException;
import com.sliit.paf.smart_campus.exception.ForbiddenException;
import com.sliit.paf.smart_campus.exception.ResourceNotFoundException;
import com.sliit.paf.smart_campus.model.Booking;
import com.sliit.paf.smart_campus.model.Booking.BookingStatus;
import com.sliit.paf.smart_campus.model.Resource;
import com.sliit.paf.smart_campus.model.User;
import com.sliit.paf.smart_campus.repository.BookingRepository;
import com.sliit.paf.smart_campus.repository.ResourceRepository;
import com.sliit.paf.smart_campus.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service layer for booking management with overlap detection.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final ResourceRepository resourceRepository;
    private final NotificationService notificationService;
    private final UserRepository userRepository;

    /** Create a booking – checks for time overlap (returns 409 if conflict) */
    @Transactional
    public BookingResponse createBooking(BookingRequest request, User user) {
        Resource resource = resourceRepository.findById(request.getResourceId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Resource not found with ID: " + request.getResourceId()));

        LocalDate date = LocalDate.parse(request.getDate());
        LocalTime startTime = LocalTime.parse(request.getStartTime());
        LocalTime endTime = LocalTime.parse(request.getEndTime());

        if (!endTime.isAfter(startTime)) {
            throw new BadRequestException("End time must be after start time");
        }

        // Check for overlapping bookings (PENDING or APPROVED)
        List<Booking> overlapping = bookingRepository.findOverlapping(
                request.getResourceId(), date, startTime, endTime);
        if (!overlapping.isEmpty()) {
            throw new BookingConflictException(
                    "Time slot conflicts with an existing booking for this resource");
        }

        Booking booking = new Booking();
        booking.setResourceId(request.getResourceId());
        booking.setResourceName(resource.getName());
        booking.setUserId(user.getId());
        booking.setUserName(user.getName());
        booking.setDate(date);
        booking.setStartTime(startTime);
        booking.setEndTime(endTime);
        booking.setPurpose(request.getPurpose());
        booking.setExpectedAttendees(request.getExpectedAttendees());
        booking.setStatus(BookingStatus.PENDING);
        booking.setCreatedAt(Instant.now());
        booking.setUpdatedAt(Instant.now());

        Booking saved = bookingRepository.save(booking);

        // Notify admins asynchronously or within try-catch to not fail the booking process
        try {
            List<User> admins = userRepository.findByRole(User.Role.ADMIN);
            notificationService.createAdminBookingPendingNotifications(saved, admins);
        } catch (Exception e) {
            log.error("Failed to send admin notifications for new booking: {}", e.getMessage(), e);
        }

        return toResponse(saved);
    }

    /** Get all bookings with optional filters (Admin) */
    public List<BookingResponse> getAllBookings(String status, String resourceId) {
        List<Booking> bookings;
        if (status != null) {
            bookings = bookingRepository.findByStatus(BookingStatus.valueOf(status));
        } else if (resourceId != null) {
            bookings = bookingRepository.findByResourceId(resourceId);
        } else {
            bookings = bookingRepository.findAll();
        }
        return bookings.stream().map(this::toResponse).collect(Collectors.toList());
    }

    /** Get bookings for the current user */
    public List<BookingResponse> getMyBookings(String userId) {
        return bookingRepository.findByUserId(userId).stream()
                .map(this::toResponse).collect(Collectors.toList());
    }

    /** Get a single booking by ID */
    public BookingResponse getBookingById(String id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with ID: " + id));
        return toResponse(booking);
    }

    /** Approve a booking (Admin) */
    public BookingResponse approveBooking(String id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with ID: " + id));

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new BadRequestException("Only PENDING bookings can be approved");
        }

        booking.setStatus(BookingStatus.APPROVED);
        booking.setUpdatedAt(Instant.now());
        Booking saved = bookingRepository.save(booking);

        // Send notification to the user
        notificationService.createBookingNotification(booking, true);
        return toResponse(saved);
    }

    /** Reject a booking with reason (Admin) */
    public BookingResponse rejectBooking(String id, String reason) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with ID: " + id));

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new BadRequestException("Only PENDING bookings can be rejected");
        }

        booking.setStatus(BookingStatus.REJECTED);
        booking.setRejectionReason(reason);
        booking.setUpdatedAt(Instant.now());
        Booking saved = bookingRepository.save(booking);

        notificationService.createBookingNotification(booking, false);
        return toResponse(saved);
    }

    /** Cancel a booking (User – only own bookings) */
    public BookingResponse cancelBooking(String id, String userId) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with ID: " + id));

        if (!booking.getUserId().equals(userId)) {
            throw new ForbiddenException("You can only cancel your own bookings");
        }

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new BadRequestException("Booking is already cancelled");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        booking.setUpdatedAt(Instant.now());
        return toResponse(bookingRepository.save(booking));
    }

    /** Get bookings for a resource within a date range (for calendar view) */
    public List<BookingResponse> getResourceBookings(String resourceId,
                                                       LocalDate start, LocalDate end) {
        return bookingRepository.findByResourceIdAndDateBetween(resourceId, start, end).stream()
                .map(this::toResponse).collect(Collectors.toList());
    }

    /** Convert entity to response DTO */
    private BookingResponse toResponse(Booking booking) {
        BookingResponse response = new BookingResponse();
        response.setId(booking.getId());
        response.setResourceId(booking.getResourceId());
        response.setResourceName(booking.getResourceName());
        response.setUserId(booking.getUserId());
        response.setUserName(booking.getUserName());
        response.setDate(booking.getDate() != null ? booking.getDate().toString() : null);
        response.setStartTime(booking.getStartTime() != null ? booking.getStartTime().toString() : null);
        response.setEndTime(booking.getEndTime() != null ? booking.getEndTime().toString() : null);
        response.setPurpose(booking.getPurpose());
        response.setExpectedAttendees(booking.getExpectedAttendees());
        response.setStatus(booking.getStatus().name());
        response.setRejectionReason(booking.getRejectionReason());
        response.setCreatedAt(booking.getCreatedAt());
        response.setUpdatedAt(booking.getUpdatedAt());
        return response;
    }
}
