package com.llmgateway.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ApiKeyRequest {

    @NotBlank
    private String name;
}