package com.buddy.agent.openai;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.Duration;
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
            .codecs(configurer -> configurer.defaultCodecs().maxInMemorySize(10 * 1024 * 1024)) // 10MB buffer
            .build();
    }
    
    public Flux<String> streamChatCompletion(String conversationHistory, String userMessage) {
        String systemPrompt = "You are Buddy, a helpful AI assistant. Be concise, friendly, and helpful.";
        
        // Try with the configured model first, then fallback to gpt-3.5-turbo if rate limited
        return tryWithModel(chatModel, conversationHistory, userMessage, systemPrompt)
            .onErrorResume(error -> {
                if (error instanceof org.springframework.web.reactive.function.client.WebClientResponseException) {
                    org.springframework.web.reactive.function.client.WebClientResponseException webError = 
                        (org.springframework.web.reactive.function.client.WebClientResponseException) error;
                    
                    if (webError.getStatusCode().value() == 429 && !chatModel.equals("gpt-3.5-turbo")) {
                        logger.info("Rate limited with {}, trying gpt-3.5-turbo as fallback", chatModel);
                        return tryWithModel("gpt-3.5-turbo", conversationHistory, userMessage, systemPrompt);
                    }
                }
                return Flux.error(error);
            });
    }
    
    private Flux<String> tryWithModel(String model, String conversationHistory, String userMessage, String systemPrompt) {
        ChatCompletionRequest request = new ChatCompletionRequest();
        request.setModel(model);
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
            .retryWhen(reactor.util.retry.Retry.backoff(3, Duration.ofSeconds(1))
                .filter(error -> {
                    if (error instanceof org.springframework.web.reactive.function.client.WebClientResponseException) {
                        org.springframework.web.reactive.function.client.WebClientResponseException webError = 
                            (org.springframework.web.reactive.function.client.WebClientResponseException) error;
                        // Only retry on rate limit errors (429) and server errors (5xx)
                        return webError.getStatusCode().value() == 429 || webError.getStatusCode().value() >= 500;
                    }
                    return false;
                })
                .onRetryExhaustedThrow((retryBackoffSpec, retrySignal) -> {
                    logger.warn("Retry exhausted after {} attempts", retrySignal.totalRetries());
                    return retrySignal.failure();
                }))
            .onErrorResume(error -> {
                logger.error("Error calling OpenAI API", error);
                
                // Provide more specific error messages based on the error type
                if (error instanceof org.springframework.web.reactive.function.client.WebClientResponseException) {
                    org.springframework.web.reactive.function.client.WebClientResponseException webError = 
                        (org.springframework.web.reactive.function.client.WebClientResponseException) error;
                    
                    if (webError.getStatusCode().value() == 429) {
                        return Flux.just("I'm currently experiencing high demand. Please wait a moment and try again. (Rate limit exceeded)");
                    } else if (webError.getStatusCode().value() == 401) {
                        return Flux.just("Authentication error with AI service. Please check your API configuration.");
                    } else if (webError.getStatusCode().value() == 403) {
                        return Flux.just("Access denied to AI service. Please check your API key and billing status.");
                    } else if (webError.getStatusCode().value() >= 500) {
                        return Flux.just("The AI service is temporarily unavailable. Please try again in a few minutes.");
                    }
                }
                
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
