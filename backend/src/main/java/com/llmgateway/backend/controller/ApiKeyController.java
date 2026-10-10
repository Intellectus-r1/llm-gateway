package com.llmgateway.backend.controller;

import com.llmgateway.backend.dto.ApiKeyRequest;
import com.llmgateway.backend.dto.ApiKeyResponse;
import com.llmgateway.backend.service.ApiKeyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.llmgateway.backend.dto.ApiKeySummary;
import java.util.List;

@RestController
@RequestMapping("/api/api-keys")
@RequiredArgsConstructor
public class ApiKeyController {

    private final ApiKeyService apiKeyService;

    @PostMapping
    public ResponseEntity<ApiKeyResponse> createApiKey(
            @Valid @RequestBody ApiKeyRequest request,
            Authentication authentication) {

        ApiKeyResponse response = apiKeyService.createApiKey(
                request,
                authentication.getName()
        );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @GetMapping
    public ResponseEntity<List<ApiKeySummary>> getApiKeys(
            Authentication authentication) {

        return ResponseEntity.ok(
                apiKeyService.getUserApiKeys(authentication.getName())
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> revokeApiKey(
            @PathVariable Long id,
            Authentication authentication) {

        apiKeyService.revokeApiKey(
                id,
                authentication.getName()
        );

        return ResponseEntity.noContent().build();
    }
}