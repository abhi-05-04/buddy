package com.buddy.memory.controller;

import com.buddy.memory.service.MemoryService;
import com.buddy.common.memory.Message;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/memory")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173", "http://192.168.1.2:5173"}, allowCredentials = "false")
public class MemoryController {
    
    private final MemoryService memoryService;
    
    public MemoryController(MemoryService memoryService) {
        this.memoryService = memoryService;
    }
    
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("OK");
    }
    
    @PostMapping("/append")
    public ResponseEntity<Message> appendMessage(@RequestBody Message message) {
        Message savedMessage = memoryService.saveMessage(message);
        return ResponseEntity.ok(savedMessage);
    }
    
    @PostMapping("/context")
    public ResponseEntity<List<Message>> getContext(@RequestBody ContextRequest request) {
        List<Message> context = memoryService.getRecentMessages(request.getSessionId(), 20);
        return ResponseEntity.ok(context);
    }
    
    private static class ContextRequest {
        private String sessionId;
        
        public String getSessionId() {
            return sessionId;
        }
        
        public void setSessionId(String sessionId) {
            this.sessionId = sessionId;
        }
    }
}
