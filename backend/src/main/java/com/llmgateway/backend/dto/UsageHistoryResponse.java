package com.llmgateway.backend.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class UsageHistoryResponse {

    private Long id;
    private String provider;
    private String model;
    private int inputTokens;
    private int outputTokens;
    private int totalTokens;
    private double estimatedCost;
    private LocalDateTime createdAt;
}