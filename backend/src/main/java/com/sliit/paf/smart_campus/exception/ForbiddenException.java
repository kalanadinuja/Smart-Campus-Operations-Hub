package com.sliit.paf.smart_campus.exception;

/**
 * Thrown when a user lacks permission for an action (403).
 */
public class ForbiddenException extends RuntimeException {
    public ForbiddenException(String message) {
        super(message);
    }
}
