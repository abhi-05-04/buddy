package com.buddy.agent.client;

import com.buddy.common.memory.Message;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;
import java.util.List;

@Component
public class MemoryClient {
    
    private final WebClient webClient;
    
    public MemoryClient(@Value("${memory.baseUrl}") String baseUrl) {
        this.webClient = WebClient.builder()
            .baseUrl(baseUrl)
            .build();
    }
    
    public Mono<Message> appendMessage(Message message) {
        return webClient.post()
            .uri("/api/memory/append")
            .bodyValue(message)
            .retrieve()
            .bodyToMono(Message.class)
            .onErrorResume(error -> {
                // Log error but continue without failing the chat
                System.err.println("Failed to save message to memory: " + error.getMessage());
                return Mono.just(message);
            });
    }
    
    public Mono<List<Message>> getContext(String sessionId) {
        return webClient.post()
            .uri("/api/memory/context")
            .bodyValue(new ContextRequest(sessionId))
            .retrieve()
            .bodyToMono(new org.springframework.core.ParameterizedTypeReference<List<Message>>() {})
            .onErrorResume(error -> {
                // Log error but continue without context
                System.err.println("Failed to get context from memory: " + error.getMessage());
                return Mono.just(List.of());
            });
    }
    
    private static class ContextRequest {
        private String sessionId;
        
        public ContextRequest(String sessionId) {
            this.sessionId = sessionId;
        }
        
        public String getSessionId() {
            return sessionId;
        }
        
        public void setSessionId(String sessionId) {
            this.sessionId = sessionId;
        }
    }
}
