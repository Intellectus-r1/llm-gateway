package com.llmgateway.backend.service;

import com.llmgateway.backend.dto.ApiKeyRequest;
import com.llmgateway.backend.dto.ApiKeyResponse;
import com.llmgateway.backend.dto.ApiKeySummary;
import com.llmgateway.backend.entity.ApiKey;
import com.llmgateway.backend.entity.User;
import com.llmgateway.backend.repository.ApiKeyRepository;
import com.llmgateway.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ApiKeyService {

    private final ApiKeyRepository apiKeyRepository;
    private final UserRepository userRepository;
    private final ApiKeyHasher apiKeyHasher;

    @Transactional
    public ApiKeyResponse createApiKey(ApiKeyRequest request, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String keyValue = generateApiKey();

        ApiKey apiKey = ApiKey.builder()
                .name(request.getName())
                .keyHash(apiKeyHasher.hash(keyValue))
                .keyValue(null)
                .active(true)
                .createdAt(LocalDateTime.now())
                .user(user)
                .build();

        ApiKey savedKey = apiKeyRepository.save(apiKey);

        return ApiKeyResponse.builder()
                .id(savedKey.getId())
                .name(savedKey.getName())
                .keyValue(keyValue)
                .active(savedKey.isActive())
                .createdAt(savedKey.getCreatedAt())
                .build();
    }

    private String generateApiKey() {
        byte[] randomBytes = new byte[32];
        new SecureRandom().nextBytes(randomBytes);

        return "lgw_" + Base64.getUrlEncoder()
                .withoutPadding()
                .encodeToString(randomBytes);
    }

    @Transactional(readOnly = true)
    public List<ApiKeySummary> getUserApiKeys(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return apiKeyRepository.findByUserId(user.getId())
                .stream()
                .map(apiKey -> ApiKeySummary.builder()
                        .id(apiKey.getId())
                        .name(apiKey.getName())
                        .keyValue(null)
                        .active(apiKey.isActive())
                        .createdAt(apiKey.getCreatedAt())
                        .build())
                .toList();
    }

    @Transactional
    public void revokeApiKey(Long apiKeyId, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        ApiKey apiKey = apiKeyRepository.findById(apiKeyId)
                .orElseThrow(() -> new RuntimeException("API key not found"));

        if (!apiKey.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("API key does not belong to user");
        }

        apiKey.setActive(false);
        apiKeyRepository.save(apiKey);
    }
}