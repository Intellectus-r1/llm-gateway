package com.llmgateway.backend.controller;

import com.llmgateway.backend.dto.ChatRequest;
import com.llmgateway.backend.dto.ChatResponse;
import com.llmgateway.backend.service.GatewayService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class GatewayController {

    private final GatewayService gatewayService;

    @PostMapping("/chat")
    public ChatResponse chat(@Valid @RequestBody ChatRequest request) {
        return gatewayService.chat(request);
    }
}