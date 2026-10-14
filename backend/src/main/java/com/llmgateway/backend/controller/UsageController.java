package com.llmgateway.backend.controller;

import com.llmgateway.backend.dto.UsageSummaryResponse;
import com.llmgateway.backend.service.UsageService;
import com.llmgateway.backend.dto.ProviderUsageResponse;
import com.llmgateway.backend.dto.UsageHistoryResponse;
import java.util.List;
import java.time.LocalDate;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/usage")
@RequiredArgsConstructor
public class UsageController {

    private final UsageService usageService;

    @GetMapping("/summary")
    public UsageSummaryResponse getUsageSummary() {
        return usageService.getUserUsageSummary();
    }

    @GetMapping("/providers")
    public List<ProviderUsageResponse> getProviderUsage() {
        return usageService.getProviderUsage();
    }

    @GetMapping("/history")
    public List<UsageHistoryResponse> getUsageHistory(
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate from,

            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate to) {

        return usageService.getUsageHistory(from, to);
    }
}