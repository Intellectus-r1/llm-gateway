package com.llmgateway.backend.controller;

import com.llmgateway.backend.dto.ProviderHealthResponse;
import com.llmgateway.backend.service.GeminiProvider;
import com.llmgateway.backend.service.NvidiaProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/monitoring")
@RequiredArgsConstructor
public class MonitoringController {

    private final GeminiProvider geminiProvider;
    private final NvidiaProvider nvidiaProvider;

    @GetMapping("/health")
    public Map<String, Object> health() {
        return Map.of(
                "status", "UP",
                "service", "llm-gateway-backend",
                "timestamp", LocalDateTime.now()
        );
    }

    @GetMapping("/providers")
    public List<ProviderHealthResponse> providers() {

        return List.of(
                ProviderHealthResponse.builder()
                        .provider(geminiProvider.getProviderName())
                        .status("CONFIGURED")
                        .build(),

                ProviderHealthResponse.builder()
                        .provider(nvidiaProvider.getProviderName())
                        .status("CONFIGURED")
                        .build()
        );
    }
}