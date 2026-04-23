package com.ecommerce.platform;

import com.ecommerce.platform.model.entity.Category;
import com.ecommerce.platform.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final CategoryRepository categoryRepository;

    @Override
    public void run(String... args) throws Exception {
        if (categoryRepository.count() == 0) {
            Category electronics = Category.builder()
                    .name("Electronics")
                    .description("Gadgets, computers, and electronic devices")
                    .build();

            Category fashion = Category.builder()
                    .name("Fashion")
                    .description("Clothing, shoes, and accessories")
                    .build();

            Category home = Category.builder()
                    .name("Home & Garden")
                    .description("Furniture, decor, and gardening tools")
                    .build();

            Category toys = Category.builder()
                    .name("Toys & Games")
                    .description("Toys for kids of all ages")
                    .build();

            categoryRepository.saveAll(Arrays.asList(electronics, fashion, home, toys));
        }
    }
}
