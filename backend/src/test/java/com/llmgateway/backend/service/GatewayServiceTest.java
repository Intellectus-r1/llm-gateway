
package com.llmgateway.backend.service;

import com.llmgateway.backend.dto.ChatRequest;
import com.llmgateway.backend.dto.ChatResponse;
import com.llmgateway.backend.entity.User;
import com.llmgateway.backend.entity.UsageRecord;
import com.llmgateway.backend.repository.UsageRecordRepository;
import com.llmgateway.backend.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class GatewayServiceTest {

    @Mock
    private GeminiProvider geminiProvider;

    @Mock
    private NvidiaProvider nvidiaProvider;

    @Mock
    private UsageRecordRepository usageRecordRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private CostCalculator costCalculator;

    @InjectMocks
    private GatewayService gatewayService;

    private User user;

    @BeforeEach
    void setUp() {
        user = User.builder()
                .id(1L)
                .email("test@example.com")
                .name("Test User")
                .password("test-password")
                .build();

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(
                        "test@example.com", null, java.util.Collections.emptyList()
                )
        );
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void successfulPrimaryResponseSavesOneUsageRecord() {
        ChatRequest request = request("gemini-3.1-flash-lite");

        when(geminiProvider.getProviderName()).thenReturn("gemini");
        when(geminiProvider.generateResponse(
                "Hello", "gemini-3.1-flash-lite"
        )).thenReturn(LlmResponse.builder()
                .response("Hello there")
                .inputTokens(10)
                .outputTokens(5)
                .build());

        when(userRepository.findByEmail("test@example.com"))
                .thenReturn(Optional.of(user));

        when(costCalculator.calculateCost(any(), any(), anyInt(), anyInt()))
                .thenReturn(0.0);

        ChatResponse response = gatewayService.chat(request);

        assertEquals("Hello there", response.getResponse());

        ArgumentCaptor<UsageRecord> captor =
                ArgumentCaptor.forClass(UsageRecord.class);
        verify(usageRecordRepository, times(1)).save(captor.capture());

        UsageRecord saved = captor.getValue();
        assertEquals(user, saved.getUser());
        assertEquals("gemini", saved.getProvider());
        assertEquals("gemini-3.1-flash-lite", saved.getModel());
        assertEquals(10, saved.getInputTokens());
        assertEquals(5, saved.getOutputTokens());
        assertEquals(15, saved.getTotalTokens());
        assertEquals(0.0, saved.getEstimatedCost());

        verify(nvidiaProvider, never()).generateResponse(any(), any());
    }

    @Test
    void fallbackSuccessSavesOneRecordForFallbackProvider() {
        ChatRequest request = request("gemini-3.1-flash-lite");

        when(geminiProvider.generateResponse(
                "Hello", "gemini-3.1-flash-lite"
        )).thenThrow(new RuntimeException("Primary provider failed"));

        when(nvidiaProvider.getProviderName()).thenReturn("nvidia");
        when(nvidiaProvider.generateResponse(
                "Hello", "nvidia/nemotron-3-super-120b-a12b"
        )).thenReturn(LlmResponse.builder()
                .response("Fallback response")
                .inputTokens(12)
                .outputTokens(8)
                .build());

        when(userRepository.findByEmail("test@example.com"))
                .thenReturn(Optional.of(user));

        when(costCalculator.calculateCost(any(), any(), anyInt(), anyInt()))
                .thenReturn(0.0);

        ChatResponse response = gatewayService.chat(request);

        assertEquals("Fallback response", response.getResponse());
        assertEquals("nvidia", response.getProvider());

        ArgumentCaptor<UsageRecord> captor =
                ArgumentCaptor.forClass(UsageRecord.class);
        verify(usageRecordRepository, times(1)).save(captor.capture());

        UsageRecord saved = captor.getValue();
        assertEquals("nvidia", saved.getProvider());
        assertEquals("nvidia/nemotron-3-super-120b-a12b", saved.getModel());
        assertEquals(20, saved.getTotalTokens());

        verify(geminiProvider, times(1))
                .generateResponse("Hello", "gemini-3.1-flash-lite");
    }

    @Test
    void bothProvidersFailAndNoUsageRecordIsSaved() {
        ChatRequest request = request("gemini-3.1-flash-lite");

        when(geminiProvider.generateResponse(
                "Hello", "gemini-3.1-flash-lite"
        )).thenThrow(new RuntimeException("Primary failed"));

        when(nvidiaProvider.generateResponse(
                "Hello", "nvidia/nemotron-3-super-120b-a12b"
        )).thenThrow(new RuntimeException("Fallback failed"));

        assertThrows(RuntimeException.class,
                () -> gatewayService.chat(request));

        verify(usageRecordRepository, never()).save(any(UsageRecord.class));
    }

    @Test
    void blankModelUsesDefaultGeminiModel() {
        ChatRequest request = request(" ");

        when(geminiProvider.getProviderName()).thenReturn("gemini");
        when(geminiProvider.generateResponse(
                "Hello", "gemini-3.1-flash-lite"
        )).thenReturn(LlmResponse.builder()
                .response("Default model response")
                .inputTokens(4)
                .outputTokens(3)
                .build());

        when(userRepository.findByEmail("test@example.com"))
                .thenReturn(Optional.of(user));
        when(costCalculator.calculateCost(any(), any(), anyInt(), anyInt()))
                .thenReturn(0.0);

        ChatResponse response = gatewayService.chat(request);

        assertEquals("Default model response", response.getResponse());
        assertEquals("gemini-3.1-flash-lite", response.getModel());

        verify(geminiProvider).generateResponse(
                "Hello", "gemini-3.1-flash-lite"
        );
        verify(usageRecordRepository, times(1)).save(any(UsageRecord.class));
    }

    @Test
    void usageSaveFailureDoesNotTriggerFallbackProvider() {
        ChatRequest request = request("gemini-3.1-flash-lite");

        when(geminiProvider.getProviderName()).thenReturn("gemini");
        when(geminiProvider.generateResponse(
                "Hello", "gemini-3.1-flash-lite"
        )).thenReturn(LlmResponse.builder()
                .response("Hello!")
                .inputTokens(5)
                .outputTokens(3)
                .build());

        when(userRepository.findByEmail("test@example.com"))
                .thenReturn(Optional.of(user));
        when(costCalculator.calculateCost(any(), any(), anyInt(), anyInt()))
                .thenReturn(0.0);
        when(usageRecordRepository.save(any(UsageRecord.class)))
                .thenThrow(new RuntimeException("Database unavailable"));

        assertThrows(RuntimeException.class,
                () -> gatewayService.chat(request));

        verify(geminiProvider).generateResponse(
                "Hello", "gemini-3.1-flash-lite");
        verifyNoInteractions(nvidiaProvider);
    }

    private ChatRequest request(String model) {
        ChatRequest request = new ChatRequest();
        request.setMessage("Hello");
        request.setModel(model);
        return request;
    }
}
