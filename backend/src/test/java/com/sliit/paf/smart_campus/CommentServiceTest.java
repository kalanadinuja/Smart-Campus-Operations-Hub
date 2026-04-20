package com.sliit.paf.smart_campus;

import com.sliit.paf.smart_campus.model.Comment;
import com.sliit.paf.smart_campus.model.Ticket;
import com.sliit.paf.smart_campus.model.User;
import com.sliit.paf.smart_campus.repository.CommentRepository;
import com.sliit.paf.smart_campus.repository.TicketRepository;
import com.sliit.paf.smart_campus.service.CommentService;
import com.sliit.paf.smart_campus.service.NotificationService;
import com.sliit.paf.smart_campus.dto.request.CommentRequest;
import com.sliit.paf.smart_campus.dto.response.CommentResponse;
import com.sliit.paf.smart_campus.exception.ForbiddenException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for CommentService – ownership enforcement.
 */
@ExtendWith(MockitoExtension.class)
class CommentServiceTest {

    @Mock private CommentRepository commentRepository;
    @Mock private TicketRepository ticketRepository;
    @Mock private NotificationService notificationService;
    @InjectMocks private CommentService commentService;

    private User owner;
    private User otherUser;
    private Comment testComment;

    @BeforeEach
    void setUp() {
        owner = new User();
        owner.setId("user1");
        owner.setName("Owner");

        otherUser = new User();
        otherUser.setId("user2");
        otherUser.setName("Other");

        testComment = new Comment();
        testComment.setId("comment1");
        testComment.setTicketId("ticket1");
        testComment.setUserId("user1");
        testComment.setUserName("Owner");
        testComment.setText("Original text");
        testComment.setCreatedAt(Instant.now());
        testComment.setUpdatedAt(Instant.now());
    }

    @Test
    void addComment_Success() {
        Ticket ticket = new Ticket();
        ticket.setId("ticket1");
        ticket.setUserId("user1");

        CommentRequest request = new CommentRequest();
        request.setText("New comment");

        when(ticketRepository.findById("ticket1")).thenReturn(Optional.of(ticket));
        when(commentRepository.save(any(Comment.class))).thenAnswer(i -> {
            Comment c = i.getArgument(0);
            c.setId("newComment1");
            return c;
        });

        CommentResponse response = commentService.addComment("ticket1", request, owner);
        assertNotNull(response);
        assertEquals("New comment", response.getText());
    }

    @Test
    void updateComment_ByOwner_Success() {
        CommentRequest request = new CommentRequest();
        request.setText("Updated text");

        when(commentRepository.findById("comment1")).thenReturn(Optional.of(testComment));
        when(commentRepository.save(any(Comment.class))).thenAnswer(i -> i.getArgument(0));

        CommentResponse response = commentService.updateComment("comment1", request, owner);
        assertEquals("Updated text", response.getText());
    }

    @Test
    void updateComment_ByNonOwner_ThrowsForbidden() {
        CommentRequest request = new CommentRequest();
        request.setText("Hacked text");

        when(commentRepository.findById("comment1")).thenReturn(Optional.of(testComment));

        assertThrows(ForbiddenException.class,
                () -> commentService.updateComment("comment1", request, otherUser));
    }

    @Test
    void deleteComment_ByNonOwner_ThrowsForbidden() {
        when(commentRepository.findById("comment1")).thenReturn(Optional.of(testComment));

        assertThrows(ForbiddenException.class,
                () -> commentService.deleteComment("comment1", otherUser));
    }

    @Test
    void deleteComment_ByOwner_Success() {
        when(commentRepository.findById("comment1")).thenReturn(Optional.of(testComment));
        doNothing().when(commentRepository).deleteById("comment1");

        assertDoesNotThrow(() -> commentService.deleteComment("comment1", owner));
        verify(commentRepository).deleteById("comment1");
    }
}
