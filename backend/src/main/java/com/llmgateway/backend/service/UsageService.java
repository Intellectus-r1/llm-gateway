package com.llmgateway.backend.service;

import com.llmgateway.backend.dto.UsageSummaryResponse;
import com.llmgateway.backend.entity.UsageRecord;
import com.llmgateway.backend.entity.User;
import com.llmgateway.backend.repository.UsageRecordRepository;
import com.llmgateway.backend.repository.UserRepository;
import com.llmgateway.backend.dto.ProviderUsageResponse;
import com.llmgateway.backend.dto.UsageHistoryResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.time.LocalDateTime;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UsageService {

    private final UsageRecordRepository usageRecordRepository;
    private final UserRepository userRepository;

    public UsageSummaryResponse getUserUsageSummary() {
        String email = SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Object[] totals = usageRecordRepository
                .summarizeUsageByUserId(user.getId())
                .get(0);

        return UsageSummaryResponse.builder()
                .totalRequests(((Number) totals[4]).longValue())
                .totalInputTokens(((Number) totals[0]).longValue())
                .totalOutputTokens(((Number) totals[1]).longValue())
                .totalTokens(((Number) totals[2]).longValue())
                .totalEstimatedCost(((Number) totals[3]).doubleValue())
                .build();
    }

    public List<ProviderUsageResponse> getProviderUsage() {
        String email = SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return usageRecordRepository
                .summarizeUsageByProvider(user.getId())
                .stream()
                .map(row -> ProviderUsageResponse.builder()
                        .provider((String) row[0])
                        .requests(((Number) row[1]).longValue())
                        .inputTokens(((Number) row[2]).longValue())
                        .outputTokens(((Number) row[3]).longValue())
                        .totalTokens(((Number) row[4]).longValue())
                        .estimatedCost(((Number) row[5]).doubleValue())
                        .build())
                .toList();
    }

    public List<UsageHistoryResponse> getUsageHistory() {
        return getUsageHistory(null, null);
    }

    public List<UsageHistoryResponse> getUsageHistory(
            LocalDate from,
            LocalDate to) {

        if (from != null && to != null && from.isAfter(to)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "'from' date must be on or before 'to' date"
            );
        }

        String email = SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();

        User user = userRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        List<UsageRecord> records;

        if (from == null && to == null) {
            records = usageRecordRepository
                    .findByUserIdOrderByCreatedAtDesc(user.getId());
        } else {
            LocalDateTime fromDateTime = from != null
                    ? from.atStartOfDay()
                    : LocalDateTime.of(1970, 1, 1, 0, 0);

            LocalDateTime toExclusive = to != null
                    ? to.plusDays(1).atStartOfDay()
                    : LocalDateTime.of(9999, 12, 31, 0, 0);

            records = usageRecordRepository
                    .findByUserIdAndCreatedAtGreaterThanEqualAndCreatedAtLessThanOrderByCreatedAtDesc(
                            user.getId(),
                            fromDateTime,
                            toExclusive
                    );
        }

        return records.stream()
                .map(record -> UsageHistoryResponse.builder()
                        .id(record.getId())
                        .provider(record.getProvider())
                        .model(record.getModel())
                        .inputTokens(record.getInputTokens())
                        .outputTokens(record.getOutputTokens())
                        .totalTokens(record.getTotalTokens())
                        .estimatedCost(record.getEstimatedCost())
                        .createdAt(record.getCreatedAt())
                        .build())
                .toList();
    }
}