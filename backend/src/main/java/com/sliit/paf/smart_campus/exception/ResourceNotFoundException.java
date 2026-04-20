package com.sliit.paf.smart_campus.exception;

/**
 * Thrown when a requested entity is not found (404).
 */
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}
