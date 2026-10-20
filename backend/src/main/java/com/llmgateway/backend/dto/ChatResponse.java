
package com.llmgateway.backend.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ChatResponse {

    private String response;
    private String provider;
    private String model;
    private boolean fallbackUsed;
}