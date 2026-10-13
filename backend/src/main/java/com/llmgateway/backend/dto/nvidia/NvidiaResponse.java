package com.llmgateway.backend.dto.nvidia;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class NvidiaResponse {

    private String id;
    private String model;
    private List<Choice> choices;
    private Usage usage;

    @Getter
    @Setter
    public static class Choice {
        private Message message;
    }

    @Getter
    @Setter
    public static class Message {
        private String role;
        private String content;
    }

    @Getter
    @Setter
    public static class Usage {
        private Integer prompt_tokens;
        private Integer completion_tokens;
        private Integer total_tokens;
    }
}