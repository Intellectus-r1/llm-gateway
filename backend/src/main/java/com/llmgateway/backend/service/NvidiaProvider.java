package com.llmgateway.backend.service;

import com.llmgateway.backend.dto.nvidia.NvidiaRequest;
import com.llmgateway.backend.dto.nvidia.NvidiaResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;

@Service
public class NvidiaProvider implements LlmProvider {

    private final RestClient restClient;
    private final String apiKey;
    private final String defaultModel;

    public NvidiaProvider(
            @Value("${nvidia.api-key}") String apiKey,
            @Value("${nvidia.base-url}") String baseUrl,
            @Value("${nvidia.default-model}") String defaultModel) {

        this.apiKey = apiKey;
        this.defaultModel = defaultModel;

        this.restClient = RestClient.builder()
                .baseUrl(baseUrl)
                .build();
    }

    @Override
    public String getProviderName() {
        return "nvidia";
    }

    @Override
    public LlmResponse generateResponse(String message, String model) {

        String selectedModel =
                (model == null || model.isBlank())
                        ? defaultModel
                        : model;

        NvidiaRequest.Message inputMessage =
                new NvidiaRequest.Message("user", message);

        NvidiaRequest request =
                new NvidiaRequest(
                        selectedModel,
                        List.of(inputMessage)
                );

        NvidiaResponse response = restClient.post()
                .uri("/v1/chat/completions")
                .header("Authorization", "Bearer " + apiKey)
                .contentType(MediaType.APPLICATION_JSON)
                .body(request)
                .retrieve()
                .body(NvidiaResponse.class);

        if (response == null ||
                response.getChoices() == null ||
                response.getChoices().isEmpty()) {

            throw new RuntimeException(
                    "NVIDIA returned an empty response"
            );
        }

        NvidiaResponse.Choice choice =
                response.getChoices().get(0);

        if (choice.getMessage() == null ||
                choice.getMessage().getContent() == null) {

            throw new RuntimeException(
                    "NVIDIA response did not contain message content"
            );
        }

        return LlmResponse.builder()
                .response(choice.getMessage().getContent())
                .inputTokens(
                        response.getUsage() != null
                                ? response.getUsage().getPrompt_tokens()
                                : 0
                )
                .outputTokens(
                        response.getUsage() != null
                                ? response.getUsage().getCompletion_tokens()
                                : 0
                )
                .build();
    }
}