package com.ecommerce.platform.controller;

import com.ecommerce.platform.dto.request.CartRequest;
import com.ecommerce.platform.dto.response.CartResponse;
import com.ecommerce.platform.service.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<CartResponse> addToCart(@Valid @RequestBody CartRequest request, Authentication auth) {
        return ResponseEntity.ok(cartService.addToCart(auth.getName(), request));
    }

    @GetMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<CartResponse> getCart(Authentication auth) {
        return ResponseEntity.ok(cartService.getCart(auth.getName()));
    }

    @DeleteMapping("/{itemId}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<Void> removeFromCart(@PathVariable Long itemId, Authentication auth) {
        cartService.removeFromCart(auth.getName(), itemId);
        return ResponseEntity.ok().build();
    }
}
