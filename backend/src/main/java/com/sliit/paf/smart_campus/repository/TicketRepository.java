package com.sliit.paf.smart_campus.repository;

import com.sliit.paf.smart_campus.model.Ticket;
import com.sliit.paf.smart_campus.model.Ticket.TicketStatus;
import com.sliit.paf.smart_campus.model.Ticket.TicketPriority;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketRepository extends MongoRepository<Ticket, String> {
    List<Ticket> findByUserId(String userId);
    List<Ticket> findByStatus(TicketStatus status);
    List<Ticket> findByPriority(TicketPriority priority);
    List<Ticket> findByAssignedTechnicianId(String technicianId);
    List<Ticket> findByResourceId(String resourceId);
    long countByStatus(TicketStatus status);
    void deleteByUserId(String userId);
}
