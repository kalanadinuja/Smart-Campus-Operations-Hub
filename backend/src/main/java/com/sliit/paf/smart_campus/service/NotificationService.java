package com.sliit.paf.smart_campus.service;

import com.sliit.paf.smart_campus.dto.response.NotificationResponse;
import com.sliit.paf.smart_campus.exception.ResourceNotFoundException;
import com.sliit.paf.smart_campus.model.Booking;
import com.sliit.paf.smart_campus.model.Notification;
import com.sliit.paf.smart_campus.model.Notification.NotificationType;
import com.sliit.paf.smart_campus.model.Ticket;
import com.sliit.paf.smart_campus.model.User;
import com.sliit.paf.smart_campus.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final MongoTemplate mongoTemplate;

    public List<NotificationResponse> getUserNotifications(String userId, List<String> type, Boolean read, String from, String to) {
        Query query = new Query();
        query.addCriteria(Criteria.where("userId").is(userId));

        if (type != null && !type.isEmpty()) {
            query.addCriteria(Criteria.where("type").in(type));
        }
        if (read != null) {
            query.addCriteria(Criteria.where("read").is(read));
        }

        if (from != null || to != null) {
            Criteria dateCriteria = Criteria.where("createdAt");
            if (from != null) {
                dateCriteria.gte(Instant.parse(from));
            }
            if (to != null) {
                dateCriteria.lte(Instant.parse(to));
            }
            query.addCriteria(dateCriteria);
        }

        query.with(Sort.by(Sort.Direction.DESC, "createdAt"));

        return mongoTemplate.find(query, Notification.class).stream()
                .map(this::toResponse).collect(Collectors.toList());
    }

    public long getUnreadCount(String userId) {
        return notificationRepository.countByUserIdAndReadFalse(userId);
    }

    public NotificationResponse markAsRead(String id) {
        Notification n = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));
        n.setRead(true);
        return toResponse(notificationRepository.save(n));
    }

    public void markAllAsRead(String userId) {
        List<Notification> unread = notificationRepository
                .findByUserIdAndReadFalseOrderByCreatedAtDesc(userId);
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
    }

    public void createBookingNotification(Booking booking, boolean approved) {
        Notification n = new Notification();
        n.setUserId(booking.getUserId());
        n.setType(approved ? NotificationType.BOOKING_APPROVED : NotificationType.BOOKING_REJECTED);
        n.setMessage(approved
                ? "Your booking for " + booking.getResourceName() + " on " + booking.getDate() + " has been approved."
                : "Your booking for " + booking.getResourceName() + " on " + booking.getDate() + " has been rejected.");
        n.setRelatedId(booking.getId());
        n.setCreatedAt(Instant.now());
        notificationRepository.save(n);
    }

    public void createAdminBookingPendingNotifications(Booking booking, List<User> admins) {
        List<Notification> notifications = admins.stream()
                .filter(admin -> !admin.getId().equals(booking.getUserId())) // Do not notify the creator
                .map(admin -> {
                    Notification n = new Notification();
                    n.setUserId(admin.getId());
                    n.setType(NotificationType.BOOKING_PENDING);
                    n.setMessage("New booking request from " + booking.getUserName() + " for " + booking.getResourceName() + " on " + booking.getDate() + " at " + booking.getStartTime() + "-" + booking.getEndTime());
                    n.setRelatedId(booking.getId());
                    n.setCreatedAt(Instant.now());
                    return n;
                })
                .collect(Collectors.toList());
        notificationRepository.saveAll(notifications);
    }

    public void createTicketStatusNotification(Ticket ticket) {
        Notification n = new Notification();
        n.setUserId(ticket.getUserId());
        n.setType(NotificationType.TICKET_STATUS_CHANGE);
        n.setMessage("Ticket #" + ticket.getId().substring(0, 8) + " status changed to " + ticket.getStatus());
        n.setRelatedId(ticket.getId());
        n.setCreatedAt(Instant.now());
        notificationRepository.save(n);
    }

    public void createTicketAssignedNotification(Ticket ticket, User technician) {
        Notification n = new Notification();
        n.setUserId(technician.getId());
        n.setType(NotificationType.TICKET_ASSIGNED);
        n.setMessage("You have been assigned ticket #" + ticket.getId().substring(0, 8) + ": " + ticket.getCategory());
        n.setRelatedId(ticket.getId());
        n.setCreatedAt(Instant.now());
        notificationRepository.save(n);
    }

    public void createCommentNotification(Ticket ticket, String commenterName) {
        Notification n = new Notification();
        n.setUserId(ticket.getUserId());
        n.setType(NotificationType.TICKET_COMMENT);
        n.setMessage(commenterName + " commented on your ticket #" + ticket.getId().substring(0, 8));
        n.setRelatedId(ticket.getId());
        n.setCreatedAt(Instant.now());
        notificationRepository.save(n);
    }

    private NotificationResponse toResponse(Notification n) {
        return new NotificationResponse(n.getId(), n.getType().name(), n.getMessage(),
                n.getRelatedId(), n.isRead(), n.getCreatedAt());
    }
}
