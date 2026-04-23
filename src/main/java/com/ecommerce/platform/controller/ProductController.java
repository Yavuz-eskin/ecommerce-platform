package com.ecommerce.platform.controller;

import com.ecommerce.platform.dto.request.ProductRequest;
import com.ecommerce.platform.dto.response.ProductResponse;
import com.ecommerce.platform.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @PostMapping
    public ResponseEntity<ProductResponse> addProduct(
            @Valid @RequestBody ProductRequest request,
            @RequestHeader(value = "X-User", required = false) String username) {
        
        if (username == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(productService.createProduct(request, username));
    }

    @GetMapping("/my-products")
    public ResponseEntity<List<ProductResponse>> getMyProducts(@RequestHeader(value = "X-User", required = false) String username) {
        if (username == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(productService.getMyProducts(username));
    }

    @GetMapping
    public ResponseEntity<List<ProductResponse>> getAllProducts() {
        return ResponseEntity.ok(productService.getAllProducts());
    }
}
