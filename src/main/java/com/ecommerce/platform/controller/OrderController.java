package com.ecommerce.platform.controller;

import com.ecommerce.platform.dto.response.OrderItemResponse;
import com.ecommerce.platform.dto.response.OrderResponse;
import com.ecommerce.platform.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping("/checkout")
    public ResponseEntity<OrderResponse> checkout(@RequestHeader(value = "X-User", required = false) String username) {
        if (username == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(orderService.checkout(username));
    }

    @GetMapping("/customer")
    public ResponseEntity<List<OrderResponse>> getCustomerOrders(@RequestHeader(value = "X-User", required = false) String username) {
        if (username == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(orderService.getCustomerOrders(username));
    }

    @GetMapping("/vendor")
    public ResponseEntity<List<OrderItemResponse>> getVendorOrders(@RequestHeader(value = "X-User", required = false) String username) {
        if (username == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(orderService.getVendorOrders(username));
    }

    @PutMapping("/vendor/{itemId}/status")
    public ResponseEntity<OrderItemResponse> updateOrderStatus(
            @PathVariable Long itemId,
            @RequestBody Map<String, String> payload,
            @RequestHeader(value = "X-User", required = false) String username) {
        if (username == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(orderService.updateOrderStatus(username, itemId, payload.get("status")));
    }
}
