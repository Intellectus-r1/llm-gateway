package com.llmgateway.backend.service;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class LlmResponse {

    private String response;

    private int inputTokens;

    private int outputTokens;
}