package com.buddy.agent.controller;

import com.buddy.agent.service.AgentOrchestrator;
import com.buddy.common.dto.ChatRequest;
import com.buddy.common.dto.ChatEvent;
import com.buddy.common.dto.TokenEvent;
import com.buddy.common.dto.DoneEvent;
import com.buddy.agent.config.TestSecurityConfig;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.reactive.WebFluxTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.reactive.server.WebTestClient;
import reactor.core.publisher.Flux;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@WebFluxTest(ChatController.class)
@ActiveProfiles("test")
@Import(TestSecurityConfig.class)
class ChatControllerIntegrationTest {

    @Autowired
    private WebTestClient webTestClient;

    @MockBean
    private AgentOrchestrator orchestrator;

    @Test
    void testStreamChatEndpoint_Integration() {
        // Arrange
        ChatRequest request = new ChatRequest("Hello, how are you?", "session123");
        ChatEvent tokenEvent = new TokenEvent("session123", "Hello");
        ChatEvent doneEvent = new DoneEvent("session123", "Response completed");
        
        when(orchestrator.processChatStream(any(ChatRequest.class), anyString()))
            .thenReturn(Flux.just(tokenEvent, doneEvent));

        // Act & Assert
        webTestClient.post()
            .uri("/api/chat/stream")
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(request)
            .exchange()
            .expectStatus().isOk()
            .expectHeader().contentType(MediaType.TEXT_EVENT_STREAM_VALUE)
            .expectBody()
            .jsonPath("$[0].type").isEqualTo("token")
            .jsonPath("$[0].sessionId").isEqualTo("session123")
            .jsonPath("$[1].type").isEqualTo("done")
            .jsonPath("$[1].sessionId").isEqualTo("session123");

        verify(orchestrator).processChatStream(request, "testuser");
    }

    @Test
    void testVoiceChatEndpoint_Integration() {
        // Arrange
        ChatRequest request = new ChatRequest("Hello", "session123", "voice456");

        // Act & Assert
        webTestClient.post()
            .uri("/api/chat/voice")
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(request)
            .exchange()
            .expectStatus().isOk()
            .expectBody(String.class)
            .isEqualTo("Voice chat endpoint - coming soon!");
    }

    @Test
    void testStreamChatWithEmptyMessage_Integration() {
        // Arrange
        ChatRequest request = new ChatRequest("", "session123");

        // Act & Assert
        webTestClient.post()
            .uri("/api/chat/stream")
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(request)
            .exchange()
            .expectStatus().isBadRequest();
    }

    @Test
    void testStreamChatWithNullSessionId_Integration() {
        // Arrange
        ChatRequest request = new ChatRequest();
        request.setMessage("Hello");
        request.setSessionId(null);

        // Act & Assert
        webTestClient.post()
            .uri("/api/chat/stream")
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(request)
            .exchange()
            .expectStatus().isBadRequest();
    }

    @Test
    void testStreamChatWithBlankSessionId_Integration() {
        // Arrange
        ChatRequest request = new ChatRequest("Hello", "   ");

        // Act & Assert
        webTestClient.post()
            .uri("/api/chat/stream")
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(request)
            .exchange()
            .expectStatus().isBadRequest();
    }

    @Test
    void testStreamChatWithVoiceSessionId_Integration() {
        // Arrange
        ChatRequest request = new ChatRequest("Hello", "session123", "voice456");
        ChatEvent tokenEvent = new TokenEvent("session123", "Hello");
        
        when(orchestrator.processChatStream(any(ChatRequest.class), anyString()))
            .thenReturn(Flux.just(tokenEvent));

        // Act & Assert
        webTestClient.post()
            .uri("/api/chat/stream")
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(request)
            .exchange()
            .expectStatus().isOk();

        verify(orchestrator).processChatStream(request, "testuser");
    }

    @Test
    void testStreamChatErrorHandling_Integration() {
        // Arrange
        ChatRequest request = new ChatRequest("Hello", "session123");
        
        when(orchestrator.processChatStream(any(ChatRequest.class), anyString()))
            .thenReturn(Flux.error(new RuntimeException("Service error")));

        // Act & Assert
        webTestClient.post()
            .uri("/api/chat/stream")
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(request)
            .exchange()
            .expectStatus().is5xxServerError();

        verify(orchestrator).processChatStream(request, "testuser");
    }

    @Test
    void testCrossOriginHeaders_Integration() {
        // Arrange
        ChatRequest request = new ChatRequest("Hello", "session123");
        ChatEvent tokenEvent = new TokenEvent("session123", "Hello");
        
        when(orchestrator.processChatStream(any(ChatRequest.class), anyString()))
            .thenReturn(Flux.just(tokenEvent));

        // Act & Assert
        webTestClient.post()
            .uri("/api/chat/stream")
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(request)
            .exchange()
            .expectStatus().isOk()
            .expectHeader().valueEquals("Access-Control-Allow-Origin", "*");
    }
}
