package com.llmgateway.backend.service;

import com.llmgateway.backend.dto.ChatRequest;
import com.llmgateway.backend.dto.ChatResponse;
import com.llmgateway.backend.entity.User;
import com.llmgateway.backend.entity.UsageRecord;
import com.llmgateway.backend.repository.UserRepository;
import com.llmgateway.backend.repository.UsageRecordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class GatewayService {

    private final GeminiProvider geminiProvider;
    private final NvidiaProvider nvidiaProvider;
    private final UsageRecordRepository usageRecordRepository;
    private final UserRepository userRepository;
    private final CostCalculator costCalculator;

    public ChatResponse chat(ChatRequest request) {

        String model = request.getModel();

        if (model == null || model.isBlank()) {
            model = "gemini-3.1-flash-lite";
        }

        LlmProvider primaryProvider;
        LlmProvider fallbackProvider;

        if (model.startsWith("nvidia/")) {
            primaryProvider = nvidiaProvider;
            fallbackProvider = geminiProvider;
        } else {
            primaryProvider = geminiProvider;
            fallbackProvider = nvidiaProvider;
        }

        LlmResponse llmResponse;
        String selectedModel = model;
        LlmProvider selectedProvider = primaryProvider;
        boolean fallbackUsed = false;

        try {
            llmResponse = primaryProvider.generateResponse(
                    request.getMessage(),
                    model
            );
        } catch (Exception primaryException) {
            selectedProvider = fallbackProvider;
            fallbackUsed = true;
            selectedModel = fallbackProvider == nvidiaProvider
                    ? "nvidia/nemotron-3-super-120b-a12b"
                    : "gemini-3.1-flash-lite";

            llmResponse = fallbackProvider.generateResponse(
                    request.getMessage(),
                    selectedModel
            );
        }

        saveUsage(selectedProvider, selectedModel, llmResponse);

        return ChatResponse.builder()
                .response(llmResponse.getResponse())
                .provider(selectedProvider.getProviderName())
                .model(selectedModel)
                .fallbackUsed(fallbackUsed)
                .build();
    }

    private void saveUsage(
            LlmProvider provider,
            String model,
            LlmResponse response) {

        String email = SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();

        User user = userRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        int totalTokens =
                response.getInputTokens()
                        + response.getOutputTokens();

        UsageRecord usageRecord = UsageRecord.builder()
                .provider(provider.getProviderName())
                .model(model)
                .inputTokens(response.getInputTokens())
                .outputTokens(response.getOutputTokens())
                .totalTokens(totalTokens)
                .estimatedCost(
                        costCalculator.calculateCost(
                                provider.getProviderName(),
                                model,
                                response.getInputTokens(),
                                response.getOutputTokens()
                        )
                )
                .createdAt(LocalDateTime.now())
                .user(user)
                .build();

        usageRecordRepository.save(usageRecord);
    }
}