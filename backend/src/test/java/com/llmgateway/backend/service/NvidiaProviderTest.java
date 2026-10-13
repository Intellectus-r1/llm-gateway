
package com.llmgateway.backend.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

import java.lang.reflect.Field;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.*;
import static org.springframework.test.web.client.response.MockRestResponseCreators.*;

class NvidiaProviderTest {

    private MockRestServiceServer server;
    private NvidiaProvider provider;

    @BeforeEach
    void setUp() throws Exception {
        RestClient.Builder builder = RestClient.builder()
                .baseUrl("https://integrate.api.nvidia.com");

        server = MockRestServiceServer.bindTo(builder).build();

        provider = new NvidiaProvider(
                "test-key",
                "https://integrate.api.nvidia.com",
                "nvidia/nemotron-3-super-120b-a12b"
        );

        Field field = NvidiaProvider.class.getDeclaredField("restClient");
        field.setAccessible(true);
        field.set(provider, builder.build());
    }

    @Test
    void mapsResponseAndTokenUsage() {
        server.expect(requestTo(
                        "https://integrate.api.nvidia.com/v1/chat/completions"))
                .andExpect(method(org.springframework.http.HttpMethod.POST))
                .andExpect(header("Authorization", "Bearer test-key"))
                .andRespond(withSuccess("""
                        {
                          "id": "test-response",
                          "model": "nvidia/nemotron-3-super-120b-a12b",
                          "choices": [
                            {
                              "message": {
                                "role": "assistant",
                                "content": "Hello there"
                              }
                            }
                          ],
                          "usage": {
                            "prompt_tokens": 10,
                            "completion_tokens": 5,
                            "total_tokens": 15
                          }
                        }
                        """, org.springframework.http.MediaType.APPLICATION_JSON));

        LlmResponse response = provider.generateResponse(
                "Hello", "nvidia/nemotron-3-super-120b-a12b");

        assertEquals("Hello there", response.getResponse());
        assertEquals(10, response.getInputTokens());
        assertEquals(5, response.getOutputTokens());

        server.verify();
    }

    @Test
    void rejectsMissingUsageMetadata() {
        server.expect(requestTo(
                        "https://integrate.api.nvidia.com/v1/chat/completions"))
                .andRespond(withSuccess("""
                        {
                          "id": "test-response",
                          "choices": [
                            {
                              "message": {
                                "role": "assistant",
                                "content": "Hello there"
                              }
                            }
                          ]
                        }
                        """, org.springframework.http.MediaType.APPLICATION_JSON));

        assertThrows(IllegalStateException.class, () ->
                provider.generateResponse(
                        "Hello", "nvidia/nemotron-3-super-120b-a12b"));

        server.verify();
    }
}