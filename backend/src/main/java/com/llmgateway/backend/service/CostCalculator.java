package com.llmgateway.backend.service;

import org.springframework.stereotype.Service;

@Service
public class CostCalculator {

    public double calculateCost(
            String provider,
            String model,
            int inputTokens,
            int outputTokens) {

        if ("gemini".equals(provider)) {
            return calculateGeminiCost(
                    inputTokens,
                    outputTokens
            );
        }

        if ("nvidia".equals(provider)) {
            return calculateNvidiaCost(
                    inputTokens,
                    outputTokens
            );
        }

        return 0.0;
    }

    private double calculateGeminiCost(
            int inputTokens,
            int outputTokens) {

        // Temporary development estimate.
        // Replace with verified pricing before final deployment/report.
        double inputCostPerMillionTokens = 0.0;
        double outputCostPerMillionTokens = 0.0;

        return (inputTokens / 1_000_000.0)
                * inputCostPerMillionTokens
                +
                (outputTokens / 1_000_000.0)
                        * outputCostPerMillionTokens;
    }

    private double calculateNvidiaCost(
            int inputTokens,
            int outputTokens) {

        // NVIDIA endpoint currently used for development.
        // Keep cost at zero until verified pricing is established.
        return 0.0;
    }
}