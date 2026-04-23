package com.ecommerce.platform.repository;

import com.ecommerce.platform.model.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    List<OrderItem> findByStoreIdOrderByOrderCreatedAtDesc(Long storeId);
}
