package com.sliit.paf.smart_campus.exception;

/**
 * Thrown for invalid request data (400).
 */
public class BadRequestException extends RuntimeException {
    public BadRequestException(String message) {
        super(message);
    }
}
