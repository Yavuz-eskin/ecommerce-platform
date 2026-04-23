package com.ecommerce.platform.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class StoreResponse {
    
    private Long id;
    private String name;
    private String description;
    private String status;
    private String ownerUsername;
    private LocalDateTime createdAt;
}
