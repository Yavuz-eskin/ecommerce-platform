package com.ecommerce.platform.controller;

import com.ecommerce.platform.dto.request.AuthRequest;
import com.ecommerce.platform.dto.request.RegisterRequest;
import com.ecommerce.platform.dto.response.AuthResponse;
import com.ecommerce.platform.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PutMapping("/profile/password")
    public ResponseEntity<Void> updatePassword(@RequestBody java.util.Map<String, String> request, org.springframework.security.core.Authentication auth) {
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return ResponseEntity.status(401).build();
        }
        authService.updatePassword(auth.getName(), request.get("newPassword"));
        return ResponseEntity.ok().build();
    }
}
