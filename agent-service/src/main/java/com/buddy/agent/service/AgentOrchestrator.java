package com.buddy.agent.service;

import com.buddy.agent.client.MemoryClient;
import com.buddy.agent.client.ToolsClient;
import com.buddy.agent.openai.OpenAiClient;
import com.buddy.common.dto.*;
import com.buddy.common.memory.Message;
import com.buddy.common.memory.MessageRole;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AgentOrchestrator {
    
    private static final Logger logger = LoggerFactory.getLogger(AgentOrchestrator.class);
    
    private final OpenAiClient openAiClient;
    private final MemoryClient memoryClient;
    private final ToolsClient toolsClient;
    
    public AgentOrchestrator(OpenAiClient openAiClient, MemoryClient memoryClient, ToolsClient toolsClient) {
        this.openAiClient = openAiClient;
        this.memoryClient = memoryClient;
        this.toolsClient = toolsClient;
    }
    
    public Flux<ChatEvent> processChatStream(ChatRequest request, String username) {
        logger.info("Processing chat request for user: {}, session: {}", username, request.getSessionId());
        
        // Save user message to memory
        Mono<Message> savedMessage = memoryClient.appendMessage(
            new Message(request.getSessionId(), MessageRole.USER, request.getMessage())
        );
        
        // Get conversation context
        Mono<List<Message>> context = memoryClient.getContext(request.getSessionId());
        
        return savedMessage
            .then(context)
            .flatMapMany(messages -> {
                // Convert messages to conversation format
                String conversationHistory = formatConversationHistory(messages);
                
                // Stream response from OpenAI
                return openAiClient.streamChatCompletion(conversationHistory, request.getMessage())
                    .doOnNext(token -> logger.debug("Received token: {}", token))
                    .map(token -> (ChatEvent) new TokenEvent(request.getSessionId(), token))
                    .doOnComplete(() -> {
                        // Save assistant response to memory
                        memoryClient.appendMessage(
                            new Message(request.getSessionId(), MessageRole.ASSISTANT, "Response completed")
                        ).subscribe();
                    });
            })
            .onErrorResume(error -> {
                logger.error("Error processing chat stream", error);
                return Flux.just((ChatEvent) new DoneEvent(request.getSessionId(), "Error: " + error.getMessage()));
            });
    }
    
    private String formatConversationHistory(List<Message> messages) {
        if (messages == null || messages.isEmpty()) {
            return "";
        }
        
        return messages.stream()
            .map(msg -> msg.getRole() + ": " + msg.getContent())
            .collect(Collectors.joining("\n"));
    }
}
