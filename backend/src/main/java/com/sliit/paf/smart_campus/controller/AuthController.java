package com.sliit.paf.smart_campus.controller;

import com.sliit.paf.smart_campus.config.JwtTokenProvider;
import com.sliit.paf.smart_campus.dto.request.LoginRequest;
import com.sliit.paf.smart_campus.dto.request.SignupRequest;
import com.sliit.paf.smart_campus.dto.response.AuthResponse;
import com.sliit.paf.smart_campus.dto.response.UserResponse;
import com.sliit.paf.smart_campus.model.User;
import com.sliit.paf.smart_campus.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST controller for authentication and user management.
 * Supports standard password login, OAuth2 Google login, and user registration.
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private final JwtTokenProvider jwtTokenProvider;
    private final PasswordEncoder passwordEncoder;

    /** Standard login - verifies email and password, returns JWT */
    @PostMapping("/signin")
    public ResponseEntity<?> signin(@Valid @RequestBody LoginRequest request) {
        try {
            User user = userService.findByEmail(request.getEmail());
            if (user.getPassword() == null || !passwordEncoder.matches(request.getPassword(), user.getPassword())) {
                return ResponseEntity.status(401).body(Map.of("message", "Invalid email or password"));
            }
            
            String token = jwtTokenProvider.generateToken(
                    user.getId(), user.getEmail(), user.getRole().name());
            return ResponseEntity.ok(new AuthResponse(token, userService.toResponse(user)));
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid email or password"));
        }
    }

    /** Register a new user account (public, USER role only) */
    @PostMapping("/signup")
    public ResponseEntity<?> signup(@Valid @RequestBody SignupRequest request) {
        // Check if email is already registered
        if (userService.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email already registered"));
        }

        // Create new user with USER role
        userService.registerUser(request.getName(), request.getEmail(),
                passwordEncoder.encode(request.getPassword()));

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("message", "Account created successfully! Please sign in."));
    }

    /** Get current authenticated user */
    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(userService.toResponse(user));
    }

    /** Get all users with optional search and role filter (Admin only) */
    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserResponse>> getAllUsers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String role) {
        return ResponseEntity.ok(userService.searchUsers(search, role));
    }

    /** Export filtered users to CSV (Admin only) */
    @GetMapping(value = "/users/export", produces = "text/csv")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> exportUsers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String role) {
        List<UserResponse> users = userService.searchUsers(search, role);
        
        StringBuilder csv = new StringBuilder();
        csv.append("Name,Email,Role,Joined Date\n");
        
        for (UserResponse u : users) {
            String date = u.getCreatedAt() != null ? u.getCreatedAt().toString().substring(0, 10) : "";
            csv.append(escapeCsv(u.getName())).append(",")
               .append(escapeCsv(u.getEmail())).append(",")
               .append(u.getRole()).append(",")
               .append(date).append("\n");
        }

        String filename = "users_export_" + java.time.LocalDate.now().toString() + ".csv";
        
        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=" + filename);
        headers.add("Content-Type", "text/csv; charset=UTF-8");
        
        return new ResponseEntity<>(csv.toString(), headers, HttpStatus.OK);
    }
    
    private String escapeCsv(String data) {
        if (data == null) return "";
        String escapedData = data.replaceAll("\\R", " ");
        if (data.contains(",") || data.contains("\"") || data.contains("'")) {
            data = data.replace("\"", "\"\"");
            escapedData = "\"" + data + "\"";
        }
        return escapedData;
    }

    /** Update user role (Admin only) */
    @PutMapping("/users/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> updateRole(
            @PathVariable String id, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(userService.updateUserRole(id, body.get("role")));
    }

    /** Delete a user and all their related data (Admin only) */
    @DeleteMapping("/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteUser(@PathVariable String id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}

