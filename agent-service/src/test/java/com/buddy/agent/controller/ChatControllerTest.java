package com.buddy.agent.controller;

import com.buddy.agent.service.AgentOrchestrator;
import com.buddy.common.dto.ChatRequest;
import com.buddy.common.dto.ChatEvent;
import com.buddy.common.dto.TokenEvent;
import com.buddy.common.dto.DoneEvent;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.web.reactive.server.WebTestClient;
import reactor.core.publisher.Flux;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ChatControllerTest {

    @Mock
    private AgentOrchestrator orchestrator;
    
    @Mock
    private Authentication authentication;
    
    @Mock
    private SecurityContext securityContext;

    private WebTestClient webTestClient;
    private ChatController chatController;

    @BeforeEach
    void setUp() {
        chatController = new ChatController(orchestrator);
        
        // Setup security context
        when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);
        
        // Setup WebTestClient
        webTestClient = WebTestClient
            .bindToController(chatController)
            .build();
    }

    @Test
    void testStreamChat_Success() {
        // Arrange
        ChatRequest request = new ChatRequest("Hello, how are you?", "session123");
        ChatEvent tokenEvent = new TokenEvent("session123", "Hello");
        ChatEvent doneEvent = new DoneEvent("session123", "Response completed");
        
        when(authentication.getName()).thenReturn("testuser");
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
    void testStreamChat_WithVoiceSessionId() {
        // Arrange
        ChatRequest request = new ChatRequest("Hello", "session123", "voice456");
        ChatEvent tokenEvent = new TokenEvent("session123", "Hello");
        
        when(authentication.getName()).thenReturn("testuser");
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
    void testStreamChat_ValidationError_EmptyMessage() {
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
    void testStreamChat_ValidationError_NullSessionId() {
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
    void testStreamChat_ValidationError_BlankSessionId() {
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
    void testStreamChat_OrchestratorError() {
        // Arrange
        ChatRequest request = new ChatRequest("Hello", "session123");
        
        when(authentication.getName()).thenReturn("testuser");
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
    void testHandleVoiceChat_Success() {
        // Arrange
        ChatRequest request = new ChatRequest("Hello", "session123", "voice456");
        when(authentication.getName()).thenReturn("testuser");

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
    void testHandleVoiceChat_ValidationError() {
        // Arrange
        ChatRequest request = new ChatRequest("", "session123");

        // Act & Assert
        webTestClient.post()
            .uri("/api/chat/voice")
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(request)
            .exchange()
            .expectStatus().isBadRequest();
    }

    @Test
    void testHandleVoiceChat_WithNullVoiceSessionId() {
        // Arrange
        ChatRequest request = new ChatRequest("Hello", "session123", null);
        when(authentication.getName()).thenReturn("testuser");

        // Act & Assert
        webTestClient.post()
            .uri("/api/chat/voice")
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(request)
            .exchange()
            .expectStatus().isOk();
    }

    @Test
    void testCrossOriginHeaders() {
        // Arrange
        ChatRequest request = new ChatRequest("Hello", "session123");
        ChatEvent tokenEvent = new TokenEvent("session123", "Hello");
        
        when(authentication.getName()).thenReturn("testuser");
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
