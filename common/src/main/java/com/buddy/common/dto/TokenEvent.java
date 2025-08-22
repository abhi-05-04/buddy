package com.buddy.common.dto;

public class TokenEvent extends ChatEvent {
    private String token;
    
    public TokenEvent() {}
    
    public TokenEvent(String sessionId, String token) {
        super(sessionId);
        this.token = token;
    }
    
    @Override
    public String getType() {
        return "token";
    }
    
    public String getToken() {
        return token;
    }
    
    public void setToken(String token) {
        this.token = token;
    }
}
