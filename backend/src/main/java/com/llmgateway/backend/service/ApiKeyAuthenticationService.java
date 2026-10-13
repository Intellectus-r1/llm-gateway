package com.llmgateway.backend.service;

import com.llmgateway.backend.entity.ApiKey;
import com.llmgateway.backend.repository.ApiKeyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ApiKeyAuthenticationService {

    private final ApiKeyRepository apiKeyRepository;
    private final ApiKeyHasher apiKeyHasher;

    @Transactional
    public String authenticate(String rawKey) {
        if (rawKey == null || rawKey.isBlank()) {
            return null;
        }

        String keyHash = apiKeyHasher.hash(rawKey);

        ApiKey apiKey = apiKeyRepository
                .findByKeyHashAndActiveTrue(keyHash)
                .orElse(null);

        if (apiKey == null) {
            // Support existing plaintext keys and migrate them on use.
            apiKey = apiKeyRepository
                    .findByKeyValueAndActiveTrue(rawKey)
                    .orElse(null);

            if (apiKey == null) {
                return null;
            }

            apiKey.setKeyHash(keyHash);
            apiKey.setKeyValue(null);
            apiKeyRepository.save(apiKey);
        }

        return apiKey.getUser().getEmail();
    }
}