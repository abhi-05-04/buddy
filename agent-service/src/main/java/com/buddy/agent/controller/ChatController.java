package com.buddy.agent.controller;

import com.buddy.agent.service.AgentOrchestrator;
import com.buddy.common.dto.ChatRequest;
import com.buddy.common.dto.ChatEvent;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "*")
public class ChatController {
    
    private final AgentOrchestrator orchestrator;
    
    public ChatController(AgentOrchestrator orchestrator) {
        this.orchestrator = orchestrator;
    }
    
    @PostMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<ChatEvent> streamChat(@Valid @RequestBody ChatRequest request, 
                                     Authentication authentication) {
        return orchestrator.processChatStream(request, authentication.getName());
    }
    
    @PostMapping("/voice")
    public ResponseEntity<String> handleVoiceChat(@Valid @RequestBody ChatRequest request,
                                                Authentication authentication) {
        // Voice chat endpoint for future implementation
        return ResponseEntity.ok("Voice chat endpoint - coming soon!");
    }
}
