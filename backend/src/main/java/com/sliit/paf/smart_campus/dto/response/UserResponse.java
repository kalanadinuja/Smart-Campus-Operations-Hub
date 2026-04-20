package com.sliit.paf.smart_campus.dto.response;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.time.Instant;

/**
 * Response DTO for User data (excludes sensitive info).
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private String id;
    private String email;
    private String name;
    private String picture;
    private String role;
    private Instant createdAt;
}
