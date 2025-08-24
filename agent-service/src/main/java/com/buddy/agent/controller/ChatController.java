package com.buddy.agent.controller;

import com.buddy.agent.service.AgentOrchestrator;
import com.buddy.common.dto.ChatRequest;
import com.buddy.common.dto.ChatEvent;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import reactor.core.publisher.Flux;
import jakarta.validation.Valid;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173", "http://192.168.1.2:5173"}, allowCredentials = "false")
public class ChatController {
    
    private final AgentOrchestrator orchestrator;
    
    public ChatController(AgentOrchestrator orchestrator) {
        this.orchestrator = orchestrator;
    }
    
    @PostMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<ChatEvent> streamChat(@Valid @RequestBody ChatRequest request, 
                                     Authentication authentication) {
        String username = (authentication != null) ? authentication.getName() : "anonymous";
        return orchestrator.processChatStream(request, username);
    }
    
    @PostMapping("/voice/stt")
    public ResponseEntity<String> speechToText(@RequestParam("file") MultipartFile audioFile) {
        try {
            // For now, return a mock transcript
            // In a real implementation, you would integrate with a speech-to-text service
            return ResponseEntity.ok("This is a mock transcript from the audio file. In production, this would be the actual transcribed text from the audio.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to transcribe audio: " + e.getMessage());
        }
    }
    
    @PostMapping("/voice/tts")
    public ResponseEntity<byte[]> textToSpeech(@RequestBody Map<String, String> request) {
        try {
            String text = request.get("text");
            if (text == null || text.trim().isEmpty()) {
                return ResponseEntity.badRequest().build();
            }
            
            // For now, return a mock audio response
            // In a real implementation, you would integrate with a text-to-speech service
            String mockAudioContent = "Mock audio content for: " + text;
            byte[] audioBytes = mockAudioContent.getBytes();
            
            return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("audio/mpeg"))
                .body(audioBytes);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PostMapping("/voice")
    public ResponseEntity<String> handleVoiceChat(@Valid @RequestBody ChatRequest request,
                                                Authentication authentication) {
        // Voice chat endpoint for future implementation
        return ResponseEntity.ok("Voice chat endpoint - coming soon!");
    }
    
    @GetMapping("/test")
    public ResponseEntity<String> testConnection() {
        return ResponseEntity.ok("Chat service is running and ready!");
    }
}
