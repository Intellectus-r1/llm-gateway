
package com.llmgateway.backend.service;

import com.llmgateway.backend.dto.gemini.GeminiResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

import java.lang.reflect.Field;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.*;
import static org.springframework.test.web.client.response.MockRestResponseCreators.*;

class GeminiProviderTest {

    private MockRestServiceServer server;
    private GeminiProvider provider;

    @BeforeEach
    void setUp() throws Exception {
        RestClient.Builder builder = RestClient.builder()
                .baseUrl("https://generativelanguage.googleapis.com");

        server = MockRestServiceServer.bindTo(builder).build();

        provider = new GeminiProvider(
                "test-key",
                "https://generativelanguage.googleapis.com",
                "gemini-3.1-flash-lite"
        );

        Field field = GeminiProvider.class.getDeclaredField("restClient");
        field.setAccessible(true);
        field.set(provider, builder.build());
    }

    @Test
    void mapsResponseAndTokenUsage() {
        server.expect(requestTo(
                        "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=test-key"))
                .andExpect(method(org.springframework.http.HttpMethod.POST))
                .andRespond(withSuccess("""
                        {
                          "candidates": [
                            {
                              "content": {
                                "parts": [{"text": "Hello there"}]
                              }
                            }
                          ],
                          "usageMetadata": {
                            "promptTokenCount": 10,
                            "candidatesTokenCount": 5,
                            "totalTokenCount": 15
                          }
                        }
                        """, org.springframework.http.MediaType.APPLICATION_JSON));

        LlmResponse response = provider.generateResponse(
                "Hello", "gemini-3.1-flash-lite");

        assertEquals("Hello there", response.getResponse());
        assertEquals(10, response.getInputTokens());
        assertEquals(5, response.getOutputTokens());

        server.verify();
    }

    @Test
    void rejectsMissingUsageMetadata() {
        server.expect(requestTo(
                        "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=test-key"))
                .andRespond(withSuccess("""
                        {
                          "candidates": [
                            {
                              "content": {
                                "parts": [{"text": "Hello there"}]
                              }
                            }
                          ]
                        }
                        """, org.springframework.http.MediaType.APPLICATION_JSON));

        assertThrows(IllegalStateException.class, () ->
                provider.generateResponse("Hello", "gemini-3.1-flash-lite"));

        server.verify();
    }
}