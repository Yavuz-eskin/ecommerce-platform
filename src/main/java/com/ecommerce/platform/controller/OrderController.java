package com.ecommerce.platform.controller;

import com.ecommerce.platform.dto.response.OrderItemResponse;
import com.ecommerce.platform.dto.response.OrderResponse;
import com.ecommerce.platform.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping("/checkout")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<OrderResponse> checkout(Authentication auth) {
        return ResponseEntity.ok(orderService.checkout(auth.getName()));
    }

    @GetMapping("/customer")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<List<OrderResponse>> getCustomerOrders(Authentication auth) {
        return ResponseEntity.ok(orderService.getCustomerOrders(auth.getName()));
    }

    @GetMapping("/vendor")
    @PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<List<OrderItemResponse>> getVendorOrders(Authentication auth) {
        return ResponseEntity.ok(orderService.getVendorOrders(auth.getName()));
    }

    @PutMapping("/vendor/{itemId}/status")
    @PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<OrderItemResponse> updateOrderStatus(
            @PathVariable Long itemId,
            @RequestBody Map<String, String> payload,
            Authentication auth) {
        return ResponseEntity.ok(orderService.updateOrderStatus(auth.getName(), itemId, payload.get("status")));
    }
}
