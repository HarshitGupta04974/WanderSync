package com.travel.service;

import com.travel.dto.RegisterRequest;
import com.travel.dto.UserResponse;
import com.travel.model.sql.User;
import com.travel.repository.sql.UserRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public UserResponse register(RegisterRequest request) {
        User user = new User();
        user.setName(request.name());
        user.setEmail(request.email());
        user.setGender(request.gender());
        user.setPasswordHash(passwordEncoder.encode(request.password()));

        try {
            userRepository.save(user);
        } catch (DataIntegrityViolationException e) {
            throw new IllegalArgumentException("Email already registered");
        }

        return new UserResponse(user.getId(), user.getName(), user.getEmail(), user.getGender().name());
    }

    public UserResponse getCurrentUser(Authentication authentication) {
        String email;
        Object principal = authentication.getPrincipal();

        if (principal instanceof UserDetails) {
            email = ((UserDetails) principal).getUsername();
        } else if (principal instanceof User) {
            email = ((User) principal).getEmail();
        } else {
            email = principal.toString();
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User details not found for context"));

        return new UserResponse(user.getId(), user.getName(), user.getEmail(), user.getGender().name());
    }
}