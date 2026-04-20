package com.sliit.paf.smart_campus.controller;

import com.sliit.paf.smart_campus.dto.request.TicketRequest;
import com.sliit.paf.smart_campus.dto.response.TicketResponse;
import com.sliit.paf.smart_campus.model.User;
import com.sliit.paf.smart_campus.service.TicketService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

/**
 * REST controller for maintenance/incident ticketing.
 * Supports multipart/form-data for image uploads.
 */
@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
public class TicketController {

    private final TicketService ticketService;

    /** Create a ticket with optional images (multipart/form-data) */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<TicketResponse> createTicket(
            @RequestPart("ticket") TicketRequest request,
            @RequestPart(value = "images", required = false) List<MultipartFile> images,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ticketService.createTicket(request, images, user));
    }

    /** Create a ticket without images (JSON body) */
    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<TicketResponse> createTicketJson(
            @RequestBody TicketRequest request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ticketService.createTicket(request, null, user));
    }

    /** Get all tickets with filters (Admin) */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<TicketResponse>> getAllTickets(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority) {
        return ResponseEntity.ok(ticketService.getAllTickets(status, priority));
    }

    /** Get current user's tickets */
    @GetMapping("/me")
    public ResponseEntity<List<TicketResponse>> getMyTickets(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ticketService.getMyTickets(user.getId()));
    }

    /** Get tickets assigned to current technician */
    @GetMapping("/assigned")
    @PreAuthorize("hasRole('TECHNICIAN')")
    public ResponseEntity<List<TicketResponse>> getAssignedTickets(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ticketService.getTechnicianTickets(user.getId()));
    }

    /** Get a single ticket by ID */
    @GetMapping("/{id}")
    public ResponseEntity<TicketResponse> getTicketById(@PathVariable String id) {
        return ResponseEntity.ok(ticketService.getTicketById(id));
    }

    /** Assign a technician to a ticket (Admin) */
    @PutMapping("/{id}/assign")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TicketResponse> assignTicket(
            @PathVariable String id, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(ticketService.assignTicket(id, body.get("technicianId")));
    }

    /** Update ticket status (Admin or assigned Technician) */
    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'TECHNICIAN')")
    public ResponseEntity<TicketResponse> updateStatus(
            @PathVariable String id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ticketService.updateTicketStatus(
                id, body.get("status"), body.get("resolutionNotes"), user));
    }

    /** Reject a ticket (Admin) */
    @PutMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TicketResponse> rejectTicket(
            @PathVariable String id, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(ticketService.rejectTicket(id, body.get("reason")));
    }
}
