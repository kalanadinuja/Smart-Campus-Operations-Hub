package com.sliit.paf.smart_campus.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import java.time.Instant;

/**
 * User entity representing an authenticated campus user.
 * Roles: USER (default), ADMIN, TECHNICIAN.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "users")
public class User {

    @Id
    private String id;

    @Indexed(unique = true)
    private String name;
    private String email;
    private String password;
    private String picture;
    private Role role = Role.USER;
    private Instant createdAt = Instant.now();

    public enum Role {
        USER, ADMIN, TECHNICIAN
    }
}
