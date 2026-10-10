package com.llmgateway.backend.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ProviderUsageResponse {

    private String provider;
    private long requests;
    private long inputTokens;
    private long outputTokens;
    private long totalTokens;
    private double estimatedCost;
}