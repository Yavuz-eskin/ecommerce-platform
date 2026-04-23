package com.ecommerce.platform.controller;

import com.ecommerce.platform.dto.request.StoreRequest;
import com.ecommerce.platform.dto.response.StoreResponse;
import com.ecommerce.platform.service.StoreService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/stores")
@RequiredArgsConstructor
public class StoreController {

    private final StoreService storeService;

    @PostMapping
    @PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<StoreResponse> createStore(
            @Valid @RequestBody StoreRequest request,
            Authentication authentication) {
        
        String username = authentication.getName();
        return ResponseEntity.ok(storeService.createStore(request, username));
    }

    @GetMapping("/my-store")
    @PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<StoreResponse> getMyStore(Authentication authentication) {
        
        String username = authentication.getName();
        return ResponseEntity.ok(storeService.getMyStore(username));
    }
}
