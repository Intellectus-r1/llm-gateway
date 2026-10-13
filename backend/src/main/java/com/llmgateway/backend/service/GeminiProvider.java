package com.llmgateway.backend.service;

import com.llmgateway.backend.dto.gemini.GeminiRequest;
import com.llmgateway.backend.dto.gemini.GeminiResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;

@Service
public class GeminiProvider implements LlmProvider {

    private final RestClient restClient;
    private final String apiKey;
    private final String baseUrl;
    private final String defaultModel;

    public GeminiProvider(
            @Value("${gemini.api-key}") String apiKey,
            @Value("${gemini.base-url}") String baseUrl,
            @Value("${gemini.default-model}") String defaultModel) {

        this.apiKey = apiKey;
        this.baseUrl = baseUrl;
        this.defaultModel = defaultModel;

        this.restClient = RestClient.builder()
                .baseUrl(baseUrl)
                .build();
    }

    @Override
    public String getProviderName() {
        return "gemini";
    }

    @Override
    public LlmResponse generateResponse(String message, String model) {

        String selectedModel =
                (model == null || model.isBlank())
                        ? defaultModel
                        : model;

        GeminiRequest.Part part =
                new GeminiRequest.Part(message);

        GeminiRequest.Content content =
                new GeminiRequest.Content(List.of(part));

        GeminiRequest request =
                new GeminiRequest(List.of(content));

        GeminiResponse response = restClient.post()
                .uri(uriBuilder -> uriBuilder
                        .path("/v1beta/models/{model}:generateContent")
                        .queryParam("key", apiKey)
                        .build(selectedModel))
                .contentType(MediaType.APPLICATION_JSON)
                .body(request)
                .retrieve()
                .body(GeminiResponse.class);

        if (response == null ||
                response.getCandidates() == null ||
                response.getCandidates().isEmpty()) {

            throw new RuntimeException(
                    "Gemini returned an empty response"
            );
        }

        String text = response.getCandidates()
                .get(0)
                .getContent()
                .getParts()
                .get(0)
                .getText();

        GeminiResponse.UsageMetadata usage =
                response.getUsageMetadata();

        if (usage == null
                || usage.getPromptTokenCount() == null
                || usage.getCandidatesTokenCount() == null) {
            throw new IllegalStateException(
                    "Gemini response did not contain token usage metadata"
            );
        }

        return LlmResponse.builder()
                .response(text)
                .inputTokens(usage.getPromptTokenCount())
                .outputTokens(usage.getCandidatesTokenCount())
                .build();
    }
}