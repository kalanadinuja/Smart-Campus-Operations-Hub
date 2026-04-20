package com.sliit.paf.smart_campus.dto.response;

import lombok.Data;
import lombok.AllArgsConstructor;

/**
 * Response DTO for authentication (JWT token + user info).
 */
@Data
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private UserResponse user;
}
