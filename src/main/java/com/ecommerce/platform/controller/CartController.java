package com.ecommerce.platform.controller;

import com.ecommerce.platform.dto.request.CartRequest;
import com.ecommerce.platform.dto.response.CartResponse;
import com.ecommerce.platform.service.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @PostMapping
    public ResponseEntity<CartResponse> addToCart(@Valid @RequestBody CartRequest request, @RequestHeader(value = "X-User", required = false) String username) {
        if (username == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(cartService.addToCart(username, request));
    }

    @GetMapping
    public ResponseEntity<CartResponse> getCart(@RequestHeader(value = "X-User", required = false) String username) {
        if (username == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(cartService.getCart(username));
    }

    @DeleteMapping("/{itemId}")
    public ResponseEntity<Void> removeFromCart(@PathVariable Long itemId, @RequestHeader(value = "X-User", required = false) String username) {
        if (username == null) return ResponseEntity.status(401).build();
        cartService.removeFromCart(username, itemId);
        return ResponseEntity.ok().build();
    }
}
