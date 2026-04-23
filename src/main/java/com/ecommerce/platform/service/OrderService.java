package com.ecommerce.platform.service;

import com.ecommerce.platform.dto.response.OrderItemResponse;
import com.ecommerce.platform.dto.response.OrderResponse;
import com.ecommerce.platform.exception.BusinessException;
import com.ecommerce.platform.model.entity.*;
import com.ecommerce.platform.model.enums.OrderItemStatus;
import com.ecommerce.platform.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CartItemRepository cartItemRepository;
    private final UserRepository userRepository;
    private final StoreRepository storeRepository;
    private final ProductRepository productRepository;

    @Transactional
    public OrderResponse checkout(String username) {
        User customer = userRepository.findByUsername(username)
                .orElseThrow(() -> new BusinessException("User not found"));

        List<CartItem> cartItems = cartItemRepository.findByUserId(customer.getId());
        if (cartItems.isEmpty()) {
            throw new BusinessException("Cart is empty");
        }

        BigDecimal totalAmount = BigDecimal.ZERO;
        Order order = Order.builder()
                .customer(customer)
                .totalAmount(totalAmount)
                .items(new ArrayList<>())
                .build();

        for (CartItem cartItem : cartItems) {
            Product product = cartItem.getProduct();
            if (product.getStockQuantity() < cartItem.getQuantity()) {
                throw new BusinessException("Not enough stock for product: " + product.getName());
            }

            product.setStockQuantity(product.getStockQuantity() - cartItem.getQuantity());
            productRepository.save(product);

            BigDecimal subTotal = product.getPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity()));
            totalAmount = totalAmount.add(subTotal);

            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .product(product)
                    .store(product.getStore())
                    .quantity(cartItem.getQuantity())
                    .price(product.getPrice())
                    .status(OrderItemStatus.PENDING)
                    .build();

            order.getItems().add(orderItem);
        }

        order.setTotalAmount(totalAmount);
        Order savedOrder = orderRepository.save(order);
        
        cartItemRepository.deleteByUserId(customer.getId());

        return mapToOrderResponse(savedOrder);
    }

    public List<OrderResponse> getCustomerOrders(String username) {
        User customer = userRepository.findByUsername(username)
                .orElseThrow(() -> new BusinessException("User not found"));

        return orderRepository.findByCustomerIdOrderByCreatedAtDesc(customer.getId())
                .stream()
                .map(this::mapToOrderResponse)
                .collect(Collectors.toList());
    }

    public List<OrderItemResponse> getVendorOrders(String username) {
        User vendor = userRepository.findByUsername(username)
                .orElseThrow(() -> new BusinessException("User not found"));

        Store store = storeRepository.findByOwnerId(vendor.getId())
                .orElseThrow(() -> new BusinessException("You do not have a store"));

        return orderItemRepository.findByStoreIdOrderByOrderCreatedAtDesc(store.getId())
                .stream()
                .map(this::mapToOrderItemResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public OrderItemResponse updateOrderStatus(String username, Long orderItemId, String statusStr) {
        User vendor = userRepository.findByUsername(username)
                .orElseThrow(() -> new BusinessException("User not found"));

        Store store = storeRepository.findByOwnerId(vendor.getId())
                .orElseThrow(() -> new BusinessException("You do not have a store"));

        OrderItem orderItem = orderItemRepository.findById(orderItemId)
                .orElseThrow(() -> new BusinessException("Order item not found"));

        if (!orderItem.getStore().getId().equals(store.getId())) {
            throw new BusinessException("You can only update your own store's orders");
        }

        try {
            OrderItemStatus status = OrderItemStatus.valueOf(statusStr.toUpperCase());
            orderItem.setStatus(status);
            OrderItem saved = orderItemRepository.save(orderItem);
            return mapToOrderItemResponse(saved);
        } catch (IllegalArgumentException e) {
            throw new BusinessException("Invalid status");
        }
    }

    private OrderResponse mapToOrderResponse(Order order) {
        List<OrderItemResponse> items = order.getItems().stream()
                .map(this::mapToOrderItemResponse)
                .collect(Collectors.toList());

        return OrderResponse.builder()
                .id(order.getId())
                .totalAmount(order.getTotalAmount())
                .createdAt(order.getCreatedAt())
                .items(items)
                .build();
    }

    private OrderItemResponse mapToOrderItemResponse(OrderItem item) {
        return OrderItemResponse.builder()
                .id(item.getId())
                .orderId(item.getOrder().getId())
                .productId(item.getProduct().getId())
                .productName(item.getProduct().getName())
                .storeName(item.getStore().getName())
                .quantity(item.getQuantity())
                .price(item.getPrice())
                .subTotal(item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .status(item.getStatus())
                .orderDate(item.getOrder().getCreatedAt())
                .customerName(item.getOrder().getCustomer().getUsername())
                .build();
    }
}
