package com.ecommerce.platform.service;

import com.ecommerce.platform.dto.request.CartRequest;
import com.ecommerce.platform.dto.response.CartItemResponse;
import com.ecommerce.platform.dto.response.CartResponse;
import com.ecommerce.platform.exception.BusinessException;
import com.ecommerce.platform.model.entity.CartItem;
import com.ecommerce.platform.model.entity.Product;
import com.ecommerce.platform.model.entity.User;
import com.ecommerce.platform.repository.CartItemRepository;
import com.ecommerce.platform.repository.ProductRepository;
import com.ecommerce.platform.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Transactional
    public CartResponse addToCart(String username, CartRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new BusinessException("User not found"));

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new BusinessException("Product not found"));

        if (product.getStockQuantity() < request.getQuantity()) {
            throw new BusinessException("Not enough stock available");
        }

        Optional<CartItem> existingItem = cartItemRepository.findByUserIdAndProductId(user.getId(), product.getId());

        if (existingItem.isPresent()) {
            CartItem cartItem = existingItem.get();
            if (product.getStockQuantity() < (cartItem.getQuantity() + request.getQuantity())) {
                throw new BusinessException("Not enough stock available for total quantity");
            }
            cartItem.setQuantity(cartItem.getQuantity() + request.getQuantity());
            cartItemRepository.save(cartItem);
        } else {
            CartItem newItem = CartItem.builder()
                    .user(user)
                    .product(product)
                    .quantity(request.getQuantity())
                    .build();
            cartItemRepository.save(newItem);
        }

        return getCart(username);
    }

    public CartResponse getCart(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new BusinessException("User not found"));

        List<CartItem> items = cartItemRepository.findByUserId(user.getId());

        List<CartItemResponse> itemResponses = items.stream().map(item -> CartItemResponse.builder()
                .id(item.getId())
                .productId(item.getProduct().getId())
                .productName(item.getProduct().getName())
                .price(item.getProduct().getPrice())
                .quantity(item.getQuantity())
                .subTotal(item.getProduct().getPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .build()).collect(Collectors.toList());

        BigDecimal total = itemResponses.stream()
                .map(CartItemResponse::getSubTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return CartResponse.builder()
                .items(itemResponses)
                .totalAmount(total)
                .build();
    }

    @Transactional
    public void removeFromCart(String username, Long cartItemId) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new BusinessException("User not found"));

        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new BusinessException("Cart item not found"));

        if (!item.getUser().getId().equals(user.getId())) {
            throw new BusinessException("Not authorized to remove this item");
        }

        cartItemRepository.delete(item);
    }
}
