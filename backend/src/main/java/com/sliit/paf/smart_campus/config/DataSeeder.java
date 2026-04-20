package com.sliit.paf.smart_campus.config;

import com.sliit.paf.smart_campus.model.User;
import com.sliit.paf.smart_campus.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        seedUser("admin@sliit.lk", "Admin User", "admin123", User.Role.ADMIN);
        seedUser("tech@sliit.lk", "Technician Staff", "tech123", User.Role.TECHNICIAN);
        seedUser("user@sliit.lk", "Student User", "user123", User.Role.USER);
    }

    private void seedUser(String email, String name, String password, User.Role role) {
        Optional<User> existingUser = userRepository.findByEmail(email);
        
        if (existingUser.isEmpty()) {
            User user = new User();
            user.setEmail(email);
            user.setName(name);
            user.setPassword(passwordEncoder.encode(password));
            user.setRole(role);
            user.setCreatedAt(Instant.now());
            userRepository.save(user);
        } else {
            User user = existingUser.get();
            // Update password if it's missing (for existing users from previous demo version)
            if (user.getPassword() == null) {
                user.setPassword(passwordEncoder.encode(password));
                userRepository.save(user);
            }
        }
    }
}
