
package com.llmgateway.backend.service;

import com.llmgateway.backend.entity.ApiKey;
import com.llmgateway.backend.entity.User;
import com.llmgateway.backend.repository.ApiKeyRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ApiKeyAuthenticationServiceTest {

    @Mock
    private ApiKeyRepository apiKeyRepository;

    @Mock
    private ApiKeyHasher apiKeyHasher;

    @InjectMocks
    private ApiKeyAuthenticationService authenticationService;

    private User user;

    @BeforeEach
    void setUp() {
        user = User.builder()
                .id(1L)
                .email("developer@example.com")
                .name("Developer")
                .password("test-password")
                .build();
    }

    @Test
    void authenticatesValidHashedKey() {
        String rawKey = "lgw_valid-test-key";
        String hash = "valid-hash";

        ApiKey apiKey = ApiKey.builder()
                .id(1L)
                .keyHash(hash)
                .keyValue(null)
                .name("Development")
                .active(true)
                .user(user)
                .build();

        when(apiKeyHasher.hash(rawKey)).thenReturn(hash);
        when(apiKeyRepository.findByKeyHashAndActiveTrue(hash))
                .thenReturn(Optional.of(apiKey));

        String email = authenticationService.authenticate(rawKey);

        assertEquals("developer@example.com", email);
        verify(apiKeyRepository, never()).findByKeyValueAndActiveTrue(any());
        verify(apiKeyRepository, never()).save(any());
    }

    @Test
    void rejectsInvalidKey() {
        String rawKey = "lgw_invalid-key";

        when(apiKeyHasher.hash(rawKey)).thenReturn("invalid-hash");
        when(apiKeyRepository.findByKeyHashAndActiveTrue("invalid-hash"))
                .thenReturn(Optional.empty());
        when(apiKeyRepository.findByKeyValueAndActiveTrue(rawKey))
                .thenReturn(Optional.empty());

        assertNull(authenticationService.authenticate(rawKey));

        verify(apiKeyRepository, never()).save(any());
    }

    @Test
    void rejectsNullOrBlankKey() {
        assertNull(authenticationService.authenticate(null));
        assertNull(authenticationService.authenticate("  "));

        verifyNoInteractions(apiKeyRepository, apiKeyHasher);
    }

    @Test
    void migratesLegacyPlaintextKeyOnUse() {
        String rawKey = "lgw_legacy-key";
        String hash = "legacy-hash";

        ApiKey legacyKey = ApiKey.builder()
                .id(2L)
                .keyValue(rawKey)
                .keyHash(null)
                .name("Legacy")
                .active(true)
                .user(user)
                .build();

        when(apiKeyHasher.hash(rawKey)).thenReturn(hash);
        when(apiKeyRepository.findByKeyHashAndActiveTrue(hash))
                .thenReturn(Optional.empty());
        when(apiKeyRepository.findByKeyValueAndActiveTrue(rawKey))
                .thenReturn(Optional.of(legacyKey));

        String email = authenticationService.authenticate(rawKey);

        assertEquals("developer@example.com", email);
        assertEquals(hash, legacyKey.getKeyHash());
        assertNull(legacyKey.getKeyValue());

        verify(apiKeyRepository).save(legacyKey);
    }
}
