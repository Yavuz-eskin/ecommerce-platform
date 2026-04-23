package com.ecommerce.platform.controller;

import com.ecommerce.platform.dto.request.StoreRequest;
import com.ecommerce.platform.dto.response.StoreResponse;
import com.ecommerce.platform.service.StoreService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/stores")
@RequiredArgsConstructor
public class StoreController {

    private final StoreService storeService;

    @PostMapping
    public ResponseEntity<StoreResponse> createStore(
            @Valid @RequestBody StoreRequest request,
            @RequestHeader(value = "X-User", required = false) String username) {
        
        if (username == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(storeService.createStore(request, username));
    }

    @GetMapping("/my-store")
    public ResponseEntity<StoreResponse> getMyStore(@RequestHeader(value = "X-User", required = false) String username) {
        
        if (username == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(storeService.getMyStore(username));
    }
}
