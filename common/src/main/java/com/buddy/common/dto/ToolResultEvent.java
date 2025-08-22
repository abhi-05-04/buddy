package com.buddy.common.dto;

public class ToolResultEvent extends ChatEvent {
    private String toolName;
    private String result;
    private boolean success;
    
    public ToolResultEvent() {}
    
    public ToolResultEvent(String sessionId, String toolName, String result, boolean success) {
        super(sessionId);
        this.toolName = toolName;
        this.result = result;
        this.success = success;
    }
    
    @Override
    public String getType() {
        return "tool_result";
    }
    
    public String getToolName() {
        return toolName;
    }
    
    public void setToolName(String toolName) {
        this.toolName = toolName;
    }
    
    public String getResult() {
        return result;
    }
    
    public void setResult(String result) {
        this.result = result;
    }
    
    public boolean isSuccess() {
        return success;
    }
    
    public void setSuccess(boolean success) {
        this.success = success;
    }
}
