package com.sliit.paf.smart_campus.service;

import com.sliit.paf.smart_campus.dto.request.TicketRequest;
import com.sliit.paf.smart_campus.dto.response.TicketResponse;
import com.sliit.paf.smart_campus.exception.BadRequestException;
import com.sliit.paf.smart_campus.exception.ForbiddenException;
import com.sliit.paf.smart_campus.exception.ResourceNotFoundException;
import com.sliit.paf.smart_campus.model.Resource;
import com.sliit.paf.smart_campus.model.Ticket;
import com.sliit.paf.smart_campus.model.Ticket.TicketPriority;
import com.sliit.paf.smart_campus.model.Ticket.TicketStatus;
import com.sliit.paf.smart_campus.model.User;
import com.sliit.paf.smart_campus.repository.CommentRepository;
import com.sliit.paf.smart_campus.repository.ResourceRepository;
import com.sliit.paf.smart_campus.repository.TicketRepository;
import com.sliit.paf.smart_campus.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service layer for maintenance/incident ticket management with file upload support.
 */
@Service
@RequiredArgsConstructor
public class TicketService {

    private final TicketRepository ticketRepository;
    private final ResourceRepository resourceRepository;
    private final UserRepository userRepository;
    private final CommentRepository commentRepository;
    private final NotificationService notificationService;

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    /** Create a new ticket with optional image uploads (max 3) */
    public TicketResponse createTicket(TicketRequest request, List<MultipartFile> images, User user) {
        Resource resource = resourceRepository.findById(request.getResourceId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Resource not found with ID: " + request.getResourceId()));

        Ticket ticket = new Ticket();
        ticket.setResourceId(request.getResourceId());
        ticket.setResourceName(resource.getName());
        ticket.setUserId(user.getId());
        ticket.setUserName(user.getName());
        ticket.setCategory(request.getCategory());
        ticket.setDescription(request.getDescription());
        ticket.setPriority(TicketPriority.valueOf(request.getPriority()));
        ticket.setContactDetails(request.getContactDetails());
        ticket.setStatus(TicketStatus.OPEN);
        ticket.setCreatedAt(Instant.now());
        ticket.setUpdatedAt(Instant.now());

        // Handle image uploads (max 3)
        if (images != null && !images.isEmpty()) {
            if (images.size() > 3) {
                throw new BadRequestException("Maximum 3 images allowed per ticket");
            }
            List<String> imageUrls = saveImages(images);
            ticket.setImageUrls(imageUrls);
        }

        Ticket saved = ticketRepository.save(ticket);
        return toResponse(saved);
    }

    /** Get all tickets with optional filters (Admin) */
    public List<TicketResponse> getAllTickets(String status, String priority) {
        List<Ticket> tickets;
        if (status != null) {
            tickets = ticketRepository.findByStatus(TicketStatus.valueOf(status));
        } else if (priority != null) {
            tickets = ticketRepository.findByPriority(TicketPriority.valueOf(priority));
        } else {
            tickets = ticketRepository.findAll();
        }
        return tickets.stream().map(this::toResponse).collect(Collectors.toList());
    }

    /** Get tickets for current user */
    public List<TicketResponse> getMyTickets(String userId) {
        return ticketRepository.findByUserId(userId).stream()
                .map(this::toResponse).collect(Collectors.toList());
    }

    /** Get tickets assigned to a technician */
    public List<TicketResponse> getTechnicianTickets(String technicianId) {
        return ticketRepository.findByAssignedTechnicianId(technicianId).stream()
                .map(this::toResponse).collect(Collectors.toList());
    }

    /** Get a single ticket by ID */
    public TicketResponse getTicketById(String id) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with ID: " + id));
        return toResponse(ticket);
    }

    /** Assign a technician to a ticket (Admin) */
    public TicketResponse assignTicket(String id, String technicianId) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with ID: " + id));

        User technician = userRepository.findById(technicianId)
                .orElseThrow(() -> new ResourceNotFoundException("Technician not found with ID: " + technicianId));

        ticket.setAssignedTechnicianId(technicianId);
        ticket.setAssignedTechnicianName(technician.getName());
        ticket.setStatus(TicketStatus.IN_PROGRESS);
        ticket.setUpdatedAt(Instant.now());
        Ticket saved = ticketRepository.save(ticket);

        // Notify the technician
        notificationService.createTicketAssignedNotification(ticket, technician);
        // Notify the ticket creator
        notificationService.createTicketStatusNotification(ticket);
        return toResponse(saved);
    }

    /** Update ticket status (Admin or assigned Technician) */
    public TicketResponse updateTicketStatus(String id, String newStatus,
                                               String resolutionNotes, User currentUser) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with ID: " + id));

        // Technician can only update assigned tickets
        if (currentUser.getRole() == User.Role.TECHNICIAN) {
            if (!currentUser.getId().equals(ticket.getAssignedTechnicianId())) {
                throw new ForbiddenException("Technicians can only update tickets assigned to them");
            }
        }

        ticket.setStatus(TicketStatus.valueOf(newStatus));
        if (resolutionNotes != null) {
            ticket.setResolutionNotes(resolutionNotes);
        }
        ticket.setUpdatedAt(Instant.now());
        Ticket saved = ticketRepository.save(ticket);

        notificationService.createTicketStatusNotification(ticket);
        return toResponse(saved);
    }

    /** Reject a ticket (Admin) */
    public TicketResponse rejectTicket(String id, String reason) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with ID: " + id));

        ticket.setStatus(TicketStatus.REJECTED);
        ticket.setResolutionNotes(reason);
        ticket.setUpdatedAt(Instant.now());
        Ticket saved = ticketRepository.save(ticket);

        notificationService.createTicketStatusNotification(ticket);
        return toResponse(saved);
    }

    /** Save uploaded images to disk and return URL paths */
    private List<String> saveImages(List<MultipartFile> images) {
        List<String> urls = new ArrayList<>();
        try {
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            for (MultipartFile image : images) {
                if (image != null && !image.isEmpty()) {
                    String fileName = UUID.randomUUID() + "_" + image.getOriginalFilename();
                    Path filePath = uploadPath.resolve(fileName);
                    Files.copy(image.getInputStream(), filePath);
                    urls.add("/uploads/" + fileName);
                }
            }
        } catch (IOException e) {
            throw new BadRequestException("Failed to upload images: " + e.getMessage());
        }
        return urls;
    }

    /** Convert entity to response DTO */
    private TicketResponse toResponse(Ticket ticket) {
        TicketResponse response = new TicketResponse();
        response.setId(ticket.getId());
        response.setResourceId(ticket.getResourceId());
        response.setResourceName(ticket.getResourceName());
        response.setUserId(ticket.getUserId());
        response.setUserName(ticket.getUserName());
        response.setCategory(ticket.getCategory());
        response.setDescription(ticket.getDescription());
        response.setPriority(ticket.getPriority().name());
        response.setContactDetails(ticket.getContactDetails());
        response.setStatus(ticket.getStatus().name());
        response.setAssignedTechnicianId(ticket.getAssignedTechnicianId());
        response.setAssignedTechnicianName(ticket.getAssignedTechnicianName());
        response.setResolutionNotes(ticket.getResolutionNotes());
        response.setImageUrls(ticket.getImageUrls());
        response.setCommentCount((int) commentRepository.countByTicketId(ticket.getId()));
        response.setCreatedAt(ticket.getCreatedAt());
        response.setUpdatedAt(ticket.getUpdatedAt());
        return response;
    }
}
