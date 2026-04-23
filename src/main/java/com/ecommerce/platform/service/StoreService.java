package com.ecommerce.platform.service;

import com.ecommerce.platform.dto.request.StoreRequest;
import com.ecommerce.platform.dto.response.StoreResponse;
import com.ecommerce.platform.exception.BusinessException;
import com.ecommerce.platform.model.entity.Store;
import com.ecommerce.platform.model.entity.User;
import com.ecommerce.platform.model.enums.Role;
import com.ecommerce.platform.repository.StoreRepository;
import com.ecommerce.platform.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class StoreService {

    private final StoreRepository storeRepository;
    private final UserRepository userRepository;

    public StoreResponse createStore(StoreRequest request, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new BusinessException("User not found"));

        if (!user.getRole().equals(Role.VENDOR)) {
            throw new BusinessException("Only users with VENDOR role can create a store");
        }

        if (storeRepository.findByOwnerId(user.getId()).isPresent()) {
            throw new BusinessException("Vendor already has a store");
        }

        Store store = Store.builder()
                .name(request.getName())
                .description(request.getDescription())
                .owner(user)
                // status will be PENDING by default as configured in entity
                .build();

        Store savedStore = storeRepository.save(store);

        return mapToResponse(savedStore);
    }

    public StoreResponse getMyStore(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new BusinessException("User not found"));

        Store store = storeRepository.findByOwnerId(user.getId())
                .orElseThrow(() -> new BusinessException("Store not found for this vendor"));

        return mapToResponse(store);
    }

    private StoreResponse mapToResponse(Store store) {
        return StoreResponse.builder()
                .id(store.getId())
                .name(store.getName())
                .description(store.getDescription())
                .status(store.getStatus().name())
                .ownerUsername(store.getOwner().getUsername())
                .createdAt(store.getCreatedAt())
                .build();
    }
}
