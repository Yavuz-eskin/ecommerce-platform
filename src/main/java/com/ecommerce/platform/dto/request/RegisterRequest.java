package com.ecommerce.platform.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RegisterRequest {
    
    @NotBlank(message = "Username is required")
    private String username;
    
    @NotBlank(message = "Email is required")
    @Email(message = "Email format is not valid")
    private String email;
    
    @NotBlank(message = "Password is required")
    private String password;
    
    private String role; // "VENDOR" veya "CUSTOMER" olarak gelebilir
}
