package com.llmgateway.backend.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class UsageSummaryResponse {

    private long totalRequests;
    private long totalInputTokens;
    private long totalOutputTokens;
    private long totalTokens;
    private double totalEstimatedCost;
}