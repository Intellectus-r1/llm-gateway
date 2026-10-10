package com.llmgateway.backend.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class ApiKeyResponse {

    private Long id;
    private String name;
    private String keyValue;
    private boolean active;
    private LocalDateTime createdAt;
}