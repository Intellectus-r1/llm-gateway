
package com.llmgateway.backend.service;

import com.llmgateway.backend.dto.ProviderUsageResponse;
import com.llmgateway.backend.dto.UsageHistoryResponse;
import com.llmgateway.backend.dto.UsageSummaryResponse;
import com.llmgateway.backend.entity.UsageRecord;
import com.llmgateway.backend.entity.User;
import com.llmgateway.backend.repository.UsageRecordRepository;
import com.llmgateway.backend.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertEquals;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UsageServiceTest {

    @Mock
    private UsageRecordRepository usageRecordRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UsageService usageService;

    private User user;

    @BeforeEach
    void setUp() {
        user = User.builder()
                .id(7L)
                .email("analytics@example.com")
                .name("Analytics User")
                .password("test-password")
                .build();

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(
                        "analytics@example.com",
                        null,
                        List.of()
                )
        );
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void summaryAggregatesOnlyTheAuthenticatedUsersRecords() {
        when(userRepository.findByEmail("analytics@example.com"))
                .thenReturn(Optional.of(user));

        when(usageRecordRepository.summarizeUsageByUserId(7L))
                .thenReturn(new Object[]{160L, 60L, 220L, 0.0, 2L});

        UsageSummaryResponse summary = usageService.getUserUsageSummary();

        assertEquals(2, summary.getTotalRequests());
        assertEquals(160, summary.getTotalInputTokens());
        assertEquals(60, summary.getTotalOutputTokens());
        assertEquals(220, summary.getTotalTokens());
        assertEquals(0.0, summary.getTotalEstimatedCost());

        verify(usageRecordRepository).summarizeUsageByUserId(7L);
    }

    @Test
    void providerUsageGroupsRecordsAndSumsTokens() {
        when(userRepository.findByEmail("analytics@example.com"))
                .thenReturn(Optional.of(user));

        when(usageRecordRepository.summarizeUsageByProvider(7L))
                .thenReturn(List.of(
                        new Object[]{"gemini", 2L, 150L, 50L, 200L, 0.0},
                        new Object[]{"nvidia", 1L, 60L, 20L, 80L, 0.0}
                ));

        List<ProviderUsageResponse> result = usageService.getProviderUsage();

        assertEquals(2, result.size());

        ProviderUsageResponse gemini = result.stream()
                .filter(item -> "gemini".equals(item.getProvider()))
                .findFirst()
                .orElseThrow();

        assertEquals(2, gemini.getRequests());
        assertEquals(150, gemini.getInputTokens());
        assertEquals(50, gemini.getOutputTokens());
        assertEquals(200, gemini.getTotalTokens());
        assertEquals(0.0, gemini.getEstimatedCost());

        verify(usageRecordRepository).summarizeUsageByProvider(7L);
    }

    @Test
    void usageHistoryUsesRepositoryDescendingOrder() {
        when(userRepository.findByEmail("analytics@example.com"))
                .thenReturn(Optional.of(user));
        LocalDateTime newest = LocalDateTime.of(2026, 10, 13, 12, 0);
        LocalDateTime oldest = LocalDateTime.of(2026, 10, 13, 9, 0);

        when(usageRecordRepository.findByUserIdOrderByCreatedAtDesc(7L))
                .thenReturn(List.of(
                        record(2L, "nvidia", 60, 20, 0.0, newest),
                        record(1L, "gemini", 100, 40, 0.0, oldest)
                ));

        List<UsageHistoryResponse> history =
                usageService.getUsageHistory();

        assertEquals(2, history.size());
        assertEquals(2L, history.get(0).getId());
        assertEquals(newest, history.get(0).getCreatedAt());
        assertEquals(1L, history.get(1).getId());
        assertEquals(oldest, history.get(1).getCreatedAt());

        verify(usageRecordRepository)
                .findByUserIdOrderByCreatedAtDesc(7L);
    }

    @Test
    void emptyUsageReturnsZeroSummaryAndEmptyLists() {
        when(userRepository.findByEmail("analytics@example.com"))
                .thenReturn(Optional.of(user));
        when(usageRecordRepository.summarizeUsageByUserId(7L))
                .thenReturn(new Object[]{0L, 0L, 0L, 0.0, 0L});
        when(usageRecordRepository.summarizeUsageByProvider(7L))
                .thenReturn(List.of());

        UsageSummaryResponse summary =
                usageService.getUserUsageSummary();

        assertEquals(0, summary.getTotalRequests());
        assertEquals(0, summary.getTotalTokens());
        assertEquals(0.0, summary.getTotalEstimatedCost());

        assertTrue(usageService.getProviderUsage().isEmpty());

        when(usageRecordRepository.findByUserIdOrderByCreatedAtDesc(7L))
                .thenReturn(List.of());

        assertTrue(usageService.getUsageHistory().isEmpty());
    }


    @Test
    void dateRangeQueriesOnlyTheAuthenticatedUsersRecords() {
        when(userRepository.findByEmail("analytics@example.com"))
                .thenReturn(Optional.of(user));
        LocalDate from = LocalDate.of(2026, 10, 1);
        LocalDate to = LocalDate.of(2026, 10, 14);

        LocalDateTime fromDateTime = from.atStartOfDay();
        LocalDateTime toExclusive = to.plusDays(1).atStartOfDay();

        when(usageRecordRepository
                .findByUserIdAndCreatedAtGreaterThanEqualAndCreatedAtLessThanOrderByCreatedAtDesc(
                        7L, fromDateTime, toExclusive))
                .thenReturn(List.of(
                        record(2L, "gemini", 20, 10, 0.0,
                                LocalDateTime.of(2026, 10, 14, 23, 59)),
                        record(1L, "nvidia", 15, 5, 0.0,
                                LocalDateTime.of(2026, 10, 1, 0, 0))
                ));

        List<UsageHistoryResponse> history =
                usageService.getUsageHistory(from, to);

        assertEquals(2, history.size());
        assertEquals(2L, history.get(0).getId());
        assertEquals(1L, history.get(1).getId());

        verify(usageRecordRepository)
                .findByUserIdAndCreatedAtGreaterThanEqualAndCreatedAtLessThanOrderByCreatedAtDesc(
                        7L, fromDateTime, toExclusive);
        verify(usageRecordRepository, never())
                .findByUserIdOrderByCreatedAtDesc(anyLong());
    }

    @Test
    void rejectsDateRangeWhereFromIsAfterTo() {
        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> usageService.getUsageHistory(
                        LocalDate.of(2026, 10, 15),
                        LocalDate.of(2026, 10, 14)
                )
        );

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
    }


    private UsageRecord record(
            Long id,
            String provider,
            int inputTokens,
            int outputTokens,
            double cost,
            LocalDateTime createdAt) {

        return UsageRecord.builder()
                .id(id)
                .provider(provider)
                .model("test-model")
                .inputTokens(inputTokens)
                .outputTokens(outputTokens)
                .totalTokens(inputTokens + outputTokens)
                .estimatedCost(cost)
                .createdAt(createdAt)
                .user(user)
                .build();
    }
}