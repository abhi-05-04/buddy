package com.buddy.common.dto;

public class DoneEvent extends ChatEvent {
    private String summary;
    
    public DoneEvent() {}
    
    public DoneEvent(String sessionId, String summary) {
        super(sessionId);
        this.summary = summary;
    }
    
    @Override
    public String getType() {
        return "done";
    }
    
    public String getSummary() {
        return summary;
    }
    
    public void setSummary(String summary) {
        this.summary = summary;
    }
}
