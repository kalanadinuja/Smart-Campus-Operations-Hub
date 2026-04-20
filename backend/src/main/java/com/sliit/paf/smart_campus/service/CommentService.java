package com.sliit.paf.smart_campus.service;

import com.sliit.paf.smart_campus.dto.request.CommentRequest;
import com.sliit.paf.smart_campus.dto.response.CommentResponse;
import com.sliit.paf.smart_campus.exception.ForbiddenException;
import com.sliit.paf.smart_campus.exception.ResourceNotFoundException;
import com.sliit.paf.smart_campus.model.Comment;
import com.sliit.paf.smart_campus.model.Ticket;
import com.sliit.paf.smart_campus.model.User;
import com.sliit.paf.smart_campus.repository.CommentRepository;
import com.sliit.paf.smart_campus.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final TicketRepository ticketRepository;
    private final NotificationService notificationService;

    public List<CommentResponse> getCommentsByTicketId(String ticketId) {
        return commentRepository.findByTicketIdOrderByCreatedAtAsc(ticketId).stream()
                .map(this::toResponse).collect(Collectors.toList());
    }

    public CommentResponse addComment(String ticketId, CommentRequest request, User user) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found: " + ticketId));
        Comment comment = new Comment();
        comment.setTicketId(ticketId);
        comment.setUserId(user.getId());
        comment.setUserName(user.getName());
        comment.setText(request.getText());
        comment.setCreatedAt(Instant.now());
        comment.setUpdatedAt(Instant.now());
        Comment saved = commentRepository.save(comment);
        if (!user.getId().equals(ticket.getUserId())) {
            notificationService.createCommentNotification(ticket, user.getName());
        }
        return toResponse(saved);
    }

    public CommentResponse updateComment(String commentId, CommentRequest request, User user) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found: " + commentId));
        if (!comment.getUserId().equals(user.getId())) {
            throw new ForbiddenException("You can only edit your own comments");
        }
        comment.setText(request.getText());
        comment.setUpdatedAt(Instant.now());
        return toResponse(commentRepository.save(comment));
    }

    public void deleteComment(String commentId, User user) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found: " + commentId));
        if (!comment.getUserId().equals(user.getId())) {
            throw new ForbiddenException("You can only delete your own comments");
        }
        commentRepository.deleteById(commentId);
    }

    private CommentResponse toResponse(Comment c) {
        return new CommentResponse(c.getId(), c.getTicketId(), c.getUserId(),
                c.getUserName(), c.getText(), c.getCreatedAt(), c.getUpdatedAt());
    }
}
