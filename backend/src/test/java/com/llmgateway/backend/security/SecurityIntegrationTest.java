package com.llmgateway.backend.security;

import com.llmgateway.backend.service.GatewayService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class SecurityIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private GatewayService gatewayService;

    @Test
    void chatWithoutAuthenticationReturnsUnauthorized() throws Exception {
        mockMvc.perform(post("/api/chat")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "message": "Hello",
                                  "model": "gemini-3.1-flash-lite"
                                }
                                """))
                .andExpect(status().isUnauthorized());

        verifyNoInteractions(gatewayService);
    }

    @Test
    void chatWithInvalidBearerTokenReturnsUnauthorized() throws Exception {
        mockMvc.perform(post("/api/chat")
                        .header("Authorization", "Bearer invalid-token")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "message": "Hello",
                                  "model": "gemini-3.1-flash-lite"
                                }
                                """))
                .andExpect(status().isUnauthorized());

        verifyNoInteractions(gatewayService);
    }
}
