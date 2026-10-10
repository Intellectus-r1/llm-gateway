package com.llmgateway.backend.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ProviderHealthResponse {

    private String provider;
    private String status;
}