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

        User user = userRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        List<UsageRecord> records =
                usageRecordRepository.findByUserId(user.getId());

        long totalInputTokens = records.stream()
                .mapToLong(UsageRecord::getInputTokens)
                .sum();

        long totalOutputTokens = records.stream()
                .mapToLong(UsageRecord::getOutputTokens)
                .sum();

        long totalTokens = records.stream()
                .mapToLong(UsageRecord::getTotalTokens)
                .sum();

        double totalEstimatedCost = records.stream()
                .mapToDouble(UsageRecord::getEstimatedCost)
                .sum();

        return UsageSummaryResponse.builder()
                .totalRequests(records.size())
                .totalInputTokens(totalInputTokens)
                .totalOutputTokens(totalOutputTokens)
                .totalTokens(totalTokens)
                .totalEstimatedCost(totalEstimatedCost)
                .build();
    }

    public List<ProviderUsageResponse> getProviderUsage() {

        String email = SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();

        User user = userRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        List<UsageRecord> records =
                usageRecordRepository.findByUserId(user.getId());

        return records.stream()
                .collect(java.util.stream.Collectors.groupingBy(
                        UsageRecord::getProvider
                ))
                .entrySet()
                .stream()
                .map(entry -> {

                    String provider = entry.getKey();
                    List<UsageRecord> providerRecords = entry.getValue();

                    long inputTokens = providerRecords.stream()
                            .mapToLong(UsageRecord::getInputTokens)
                            .sum();

                    long outputTokens = providerRecords.stream()
                            .mapToLong(UsageRecord::getOutputTokens)
                            .sum();

                    long totalTokens = providerRecords.stream()
                            .mapToLong(UsageRecord::getTotalTokens)
                            .sum();

                    double estimatedCost = providerRecords.stream()
                            .mapToDouble(UsageRecord::getEstimatedCost)
                            .sum();

                    return ProviderUsageResponse.builder()
                            .provider(provider)
                            .requests(providerRecords.size())
                            .inputTokens(inputTokens)
                            .outputTokens(outputTokens)
                            .totalTokens(totalTokens)
                            .estimatedCost(estimatedCost)
                            .build();
                })
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