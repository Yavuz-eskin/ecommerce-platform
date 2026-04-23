package com.ecommerce.platform.service;

import com.ecommerce.platform.dto.request.AuthRequest;
import com.ecommerce.platform.dto.request.RegisterRequest;
import com.ecommerce.platform.dto.response.AuthResponse;
import com.ecommerce.platform.exception.BusinessException;
import com.ecommerce.platform.model.entity.User;
import com.ecommerce.platform.model.enums.Role;
import com.ecommerce.platform.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Base64;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;

    private String encode(String rawPassword) {
        return Base64.getEncoder().encodeToString(rawPassword.getBytes());
    }

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BusinessException("Username is already taken");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException("Email is already registered");
        }

        Role role;
        try {
            role = Role.valueOf(request.getRole().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BusinessException("Invalid role. Must be CUSTOMER or VENDOR");
        }

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .passwordHash(encode(request.getPassword()))
                .role(role)
                .build();

        userRepository.save(user);

        return AuthResponse.builder()
                .token("MOCK-TOKEN-" + user.getUsername())
                .username(user.getUsername())
                .role(user.getRole().name())
                .build();
    }

    public AuthResponse login(AuthRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new BusinessException("User not found"));

        if (!user.getPasswordHash().equals(encode(request.getPassword()))) {
            throw new BusinessException("Invalid credentials");
        }

        return AuthResponse.builder()
                .token("MOCK-TOKEN-" + user.getUsername())
                .username(user.getUsername())
                .role(user.getRole().name())
                .build();
    }

    @org.springframework.transaction.annotation.Transactional
    public void updatePassword(String username, String newPassword) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new BusinessException("User not found"));
        if (newPassword != null && !newPassword.isBlank()) {
            user.setPasswordHash(encode(newPassword));
            userRepository.save(user);
        }
    }
}
