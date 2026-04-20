package com.sliit.paf.smart_campus.exception;

/**
 * Thrown when a booking overlaps with an existing one (409 Conflict).
 */
public class BookingConflictException extends RuntimeException {
    public BookingConflictException(String message) {
        super(message);
    }
}
