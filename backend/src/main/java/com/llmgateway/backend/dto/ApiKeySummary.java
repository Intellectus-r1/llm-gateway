package com.llmgateway.backend.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class ApiKeySummary {

    private Long id;
    private String name;
    private String keyValue;
    private boolean active;
    private LocalDateTime createdAt;
}