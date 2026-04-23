package com.ecommerce.platform.dto.response;

import com.ecommerce.platform.model.enums.OrderItemStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class OrderItemResponse {
    private Long id;
    private Long orderId;
    private Long productId;
    private String productName;
    private String storeName;
    private Integer quantity;
    private BigDecimal price;
    private BigDecimal subTotal;
    private OrderItemStatus status;
    private LocalDateTime orderDate;
    private String customerName;
}
