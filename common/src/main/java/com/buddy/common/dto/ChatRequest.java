package com.buddy.common.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class ChatRequest {
    @NotBlank(message = "Message cannot be empty")
    private String message;
    
    @NotNull(message = "Session ID cannot be null")
    private String sessionId;
    
    private String voiceSessionId;
    
    public ChatRequest() {}
    
    public ChatRequest(String message, String sessionId) {
        this.message = message;
        this.sessionId = sessionId;
    }
    
    public ChatRequest(String message, String sessionId, String voiceSessionId) {
        this.message = message;
        this.sessionId = sessionId;
        this.voiceSessionId = voiceSessionId;
    }
    
    // Getters and Setters
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
    
    public String getSessionId() {
        return sessionId;
    }
    
    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }
    
    public String getVoiceSessionId() {
        return voiceSessionId;
    }
    
    public void setVoiceSessionId(String voiceSessionId) {
        this.voiceSessionId = voiceSessionId;
    }
}
