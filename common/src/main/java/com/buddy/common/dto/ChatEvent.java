package com.buddy.common.dto;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;

@JsonTypeInfo(
    use = JsonTypeInfo.Id.NAME,
    property = "type"
)
@JsonSubTypes({
    @JsonSubTypes.Type(value = TokenEvent.class, name = "token"),
    @JsonSubTypes.Type(value = ToolCallEvent.class, name = "tool_call"),
    @JsonSubTypes.Type(value = ToolResultEvent.class, name = "tool_result"),
    @JsonSubTypes.Type(value = DoneEvent.class, name = "done")
})
public abstract class ChatEvent {
    private String sessionId;
    private long timestamp;
    
    public ChatEvent() {
        this.timestamp = System.currentTimeMillis();
    }
    
    public ChatEvent(String sessionId) {
        this();
        this.sessionId = sessionId;
    }
    
    public abstract String getType();
    
    // Getters and Setters
    public String getSessionId() {
        return sessionId;
    }
    
    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }
    
    public long getTimestamp() {
        return timestamp;
    }
    
    public void setTimestamp(long timestamp) {
        this.timestamp = timestamp;
    }
}
