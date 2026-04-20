package com.sliit.paf.smart_campus;

import com.sliit.paf.smart_campus.model.Booking;
import com.sliit.paf.smart_campus.model.Booking.BookingStatus;
import com.sliit.paf.smart_campus.model.Resource;
import com.sliit.paf.smart_campus.model.User;
import com.sliit.paf.smart_campus.repository.BookingRepository;
import com.sliit.paf.smart_campus.repository.ResourceRepository;
import com.sliit.paf.smart_campus.service.BookingService;
import com.sliit.paf.smart_campus.service.NotificationService;
import com.sliit.paf.smart_campus.dto.request.BookingRequest;
import com.sliit.paf.smart_campus.dto.response.BookingResponse;
import com.sliit.paf.smart_campus.exception.BookingConflictException;
import com.sliit.paf.smart_campus.exception.BadRequestException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for BookingService – overlap detection and approval flow.
 */
@ExtendWith(MockitoExtension.class)
class BookingServiceTest {

    @Mock private BookingRepository bookingRepository;
    @Mock private ResourceRepository resourceRepository;
    @Mock private NotificationService notificationService;
    @InjectMocks private BookingService bookingService;

    private User testUser;
    private Resource testResource;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId("user1");
        testUser.setName("Test User");
        testUser.setEmail("test@sliit.lk");

        testResource = new Resource();
        testResource.setId("res1");
        testResource.setName("Lab A");
        testResource.setType(Resource.ResourceType.LAB);
    }

    @Test
    void createBooking_Success() {
        BookingRequest request = new BookingRequest();
        request.setResourceId("res1");
        request.setDate("2026-05-01");
        request.setStartTime("09:00");
        request.setEndTime("11:00");
        request.setPurpose("Lab session");
        request.setExpectedAttendees(30);

        when(resourceRepository.findById("res1")).thenReturn(Optional.of(testResource));
        when(bookingRepository.findOverlapping(anyString(), any(), any(), any()))
                .thenReturn(Collections.emptyList());
        when(bookingRepository.save(any(Booking.class))).thenAnswer(i -> {
            Booking b = i.getArgument(0);
            b.setId("booking1");
            return b;
        });

        BookingResponse response = bookingService.createBooking(request, testUser);

        assertNotNull(response);
        assertEquals("PENDING", response.getStatus());
        assertEquals("Lab A", response.getResourceName());
        verify(bookingRepository, times(1)).save(any(Booking.class));
    }

    @Test
    void createBooking_Conflict_ThrowsException() {
        BookingRequest request = new BookingRequest();
        request.setResourceId("res1");
        request.setDate("2026-05-01");
        request.setStartTime("09:00");
        request.setEndTime("11:00");
        request.setPurpose("Lab session");
        request.setExpectedAttendees(30);

        Booking existing = new Booking();
        existing.setId("existing1");

        when(resourceRepository.findById("res1")).thenReturn(Optional.of(testResource));
        when(bookingRepository.findOverlapping(anyString(), any(), any(), any()))
                .thenReturn(List.of(existing));

        assertThrows(BookingConflictException.class,
                () -> bookingService.createBooking(request, testUser));
    }

    @Test
    void createBooking_InvalidTime_ThrowsException() {
        BookingRequest request = new BookingRequest();
        request.setResourceId("res1");
        request.setDate("2026-05-01");
        request.setStartTime("11:00");
        request.setEndTime("09:00"); // end before start
        request.setPurpose("Lab session");
        request.setExpectedAttendees(30);

        when(resourceRepository.findById("res1")).thenReturn(Optional.of(testResource));

        assertThrows(BadRequestException.class,
                () -> bookingService.createBooking(request, testUser));
    }

    @Test
    void approveBooking_Success() {
        Booking booking = new Booking();
        booking.setId("booking1");
        booking.setUserId("user1");
        booking.setResourceName("Lab A");
        booking.setDate(LocalDate.of(2026, 5, 1));
        booking.setStatus(BookingStatus.PENDING);

        when(bookingRepository.findById("booking1")).thenReturn(Optional.of(booking));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(i -> i.getArgument(0));

        BookingResponse response = bookingService.approveBooking("booking1");

        assertEquals("APPROVED", response.getStatus());
        verify(notificationService).createBookingNotification(any(), eq(true));
    }

    @Test
    void approveBooking_NotPending_ThrowsException() {
        Booking booking = new Booking();
        booking.setId("booking1");
        booking.setStatus(BookingStatus.APPROVED);

        when(bookingRepository.findById("booking1")).thenReturn(Optional.of(booking));

        assertThrows(BadRequestException.class,
                () -> bookingService.approveBooking("booking1"));
    }
}
