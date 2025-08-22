package com.buddy.common.dto;

public class ToolCallEvent extends ChatEvent {
    private String toolName;
    private String toolInput;
    
    public ToolCallEvent() {}
    
    public ToolCallEvent(String sessionId, String toolName, String toolInput) {
        super(sessionId);
        this.toolName = toolName;
        this.toolInput = toolInput;
    }
    
    @Override
    public String getType() {
        return "tool_call";
    }
    
    public String getToolName() {
        return toolName;
    }
    
    public void setToolName(String toolName) {
        this.toolName = toolName;
    }
    
    public String getToolInput() {
        return toolInput;
    }
    
    public void setToolInput(String toolInput) {
        this.toolInput = toolInput;
    }
}
