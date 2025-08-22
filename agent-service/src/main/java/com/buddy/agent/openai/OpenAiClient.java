package com.buddy.agent.openai;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;

@Component
public class OpenAiClient {
    
    private static final Logger logger = LoggerFactory.getLogger(OpenAiClient.class);
    
    private final WebClient webClient;
    private final String apiKey;
    private final String chatModel;
    
    public OpenAiClient(@Value("${openai.apiKey}") String apiKey,
                       @Value("${openai.chatModel}") String chatModel) {
        this.apiKey = apiKey;
        this.chatModel = chatModel;
        this.webClient = WebClient.builder()
            .baseUrl("https://api.openai.com/v1")
            .defaultHeader("Authorization", "Bearer " + apiKey)
            .defaultHeader("Content-Type", "application/json")
            .build();
    }
    
    public Flux<String> streamChatCompletion(String conversationHistory, String userMessage) {
        String systemPrompt = "You are Buddy, a helpful AI assistant. Be concise, friendly, and helpful.";
        
        ChatCompletionRequest request = new ChatCompletionRequest();
        request.setModel(chatModel);
        request.setStream(true);
        request.setMessages(List.of(
            new Message("system", systemPrompt),
            new Message("user", conversationHistory + "\n\nUser: " + userMessage)
        ));
        
        return webClient.post()
            .uri("/chat/completions")
            .bodyValue(request)
            .retrieve()
            .bodyToFlux(String.class)
            .filter(chunk -> chunk.contains("\"delta\""))
            .map(this::extractTokenFromChunk)
            .filter(token -> token != null && !token.isEmpty())
            .onErrorResume(error -> {
                logger.error("Error calling OpenAI API", error);
                return Flux.just("I apologize, but I'm experiencing technical difficulties. Please try again later.");
            });
    }
    
    private String extractTokenFromChunk(String chunk) {
        try {
            // Simple extraction - in production, use proper JSON parsing
            if (chunk.contains("\"content\"")) {
                int start = chunk.indexOf("\"content\":") + 11;
                int end = chunk.indexOf("\"", start);
                if (end > start) {
                    return chunk.substring(start, end);
                }
            }
            return null;
        } catch (Exception e) {
            logger.warn("Failed to extract token from chunk", e);
            return null;
        }
    }
    
    private static class ChatCompletionRequest {
        private String model;
        private boolean stream;
        private List<Message> messages;
        
        // Getters and Setters
        public String getModel() { return model; }
        public void setModel(String model) { this.model = model; }
        public boolean isStream() { return stream; }
        public void setStream(boolean stream) { this.stream = stream; }
        public List<Message> getMessages() { return messages; }
        public void setMessages(List<Message> messages) { this.messages = messages; }
    }
    
    private static class Message {
        private String role;
        private String content;
        
        public Message(String role, String content) {
            this.role = role;
            this.content = content;
        }
        
        // Getters and Setters
        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
    }
}
