package com.llmgateway.backend.service;

public interface LlmProvider {

    String getProviderName();

    LlmResponse generateResponse(String message, String model);
}