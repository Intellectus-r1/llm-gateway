package com.llmgateway.backend.exception;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import static org.junit.jupiter.api.Assertions.*;

class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler =
            new GlobalExceptionHandler();

    @Test
    void unexpectedRuntimeExceptionReturnsInternalServerError() {
        var response = handler.handleRuntimeException(
                new RuntimeException("Database details"));

        assertEquals(
                HttpStatus.INTERNAL_SERVER_ERROR,
                response.getStatusCode());
        assertEquals(
                "An unexpected error occurred",
                response.getBody().get("message"));
    }

    @Test
    void responseStatusExceptionPreservesBadRequestStatus() {
        var response = handler.handleResponseStatusException(
                new ResponseStatusException(
                        HttpStatus.BAD_REQUEST, "Invalid date range"));

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Invalid date range",
                response.getBody().get("message"));
    }

    @Test
    void runtimeExceptionWithoutMessageReturnsGenericError() {
        var response = handler.handleRuntimeException(
                new RuntimeException());

        assertEquals(
                HttpStatus.INTERNAL_SERVER_ERROR,
                response.getStatusCode());
        assertEquals(
                "An unexpected error occurred",
                response.getBody().get("message"));
    }

    @Test
    void responseStatusExceptionPreservesServiceUnavailableStatus() {
        var response = handler.handleResponseStatusException(
                new ResponseStatusException(
                        HttpStatus.SERVICE_UNAVAILABLE,
                        "Service temporarily unavailable"));

        assertEquals(
                HttpStatus.SERVICE_UNAVAILABLE,
                response.getStatusCode());
        assertEquals(
                "Service temporarily unavailable",
                response.getBody().get("message"));
    }
}