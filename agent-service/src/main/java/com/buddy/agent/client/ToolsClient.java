package com.buddy.agent.client;

import com.buddy.common.tool.ToolResult;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Component
public class ToolsClient {
    
    private final WebClient webClient;
    
    public ToolsClient(@Value("${tools.baseUrl}") String baseUrl) {
        this.webClient = WebClient.builder()
            .baseUrl(baseUrl)
            .build();
    }
    
    public Mono<ToolResult> executeTool(String toolName, String input) {
        return webClient.post()
            .uri("/api/tools/execute/{name}", toolName)
            .bodyValue(new ToolExecutionRequest(input))
            .retrieve()
            .bodyToMono(ToolResult.class)
            .onErrorResume(error -> {
                System.err.println("Failed to execute tool " + toolName + ": " + error.getMessage());
                return Mono.just(ToolResult.failure("Tool execution failed: " + error.getMessage()));
            });
    }
    
    private static class ToolExecutionRequest {
        private String input;
        
        public ToolExecutionRequest(String input) {
            this.input = input;
        }
        
        public String getInput() {
            return input;
        }
        
        public void setInput(String input) {
            this.input = input;
        }
    }
}
